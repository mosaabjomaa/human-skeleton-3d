"""Loopback-only research API. Uploads processed in memory, never persisted."""
from pathlib import Path
import os
os.environ['YOLO_CONFIG_DIR']=str(Path(__file__).resolve().parent/'config')
os.environ['MPLCONFIGDIR']=str(Path(__file__).resolve().parent/'cache/matplotlib')
os.environ['YOLO_AUTOINSTALL']='false'
import asyncio, io, json, csv
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse
from starlette.formparsers import MultiPartParser
from PIL import Image, ImageOps, UnidentifiedImageError
from image_io import open_image
import torch
from ultralytics import YOLO

ROOT=Path(__file__).resolve().parent
Image.MAX_IMAGE_PIXELS=25_000_000
torch.set_num_threads(2)
lock=asyncio.Lock()
model=None; report=None; threshold=.5
# Keep all accepted multipart uploads in RAM (UploadFile otherwise spools >1 MB).
MultiPartParser.spool_max_size=13*1024*1024

class UploadLimit:
    def __init__(self,app): self.app=app
    async def __call__(self,scope,receive,send):
        if scope['type']!='http' or scope.get('method')!='POST':
            return await self.app(scope,receive,send)
        limit=12*1024*1024+128*1024
        headers=dict(scope.get('headers',[]))
        try: length=int(headers.get(b'content-length',b'0'))
        except ValueError: length=limit+1
        if length>limit:
            return await JSONResponse({'detail':'Maximum upload is 12 MB'},status_code=413)(scope,receive,send)
        count=0
        async def bounded_receive():
            nonlocal count
            message=await receive();count+=len(message.get('body',b''))
            if count>limit: raise HTTPException(413,'Maximum upload is 12 MB')
            return message
        await self.app(scope,bounded_receive,send)

@asynccontextmanager
async def lifespan(app):
    load_model()
    yield

def load_model():
    global model,report,threshold
    artifact=ROOT/'artifacts/yolo-detector.pt'
    report_path=ROOT/'artifacts/yolo-metrics.json'
    manifest=ROOT/'artifacts/active-model.json'
    if manifest.exists():
        active=json.loads(manifest.read_text())
        artifact=(ROOT/'artifacts'/active['weights']).resolve()
        report_path=(ROOT/'artifacts'/active['report']).resolve()
        if not artifact.is_relative_to((ROOT/'artifacts').resolve()) or not report_path.is_relative_to((ROOT/'artifacts').resolve()):
            raise RuntimeError('Invalid active model path')
    if model is None and artifact.exists() and report_path.exists():
        report=json.loads(report_path.read_text())
        model=YOLO(str(artifact))
        threshold=report['threshold']

app=FastAPI(title='OSSEO research X-ray API',lifespan=lifespan)
app.add_middleware(UploadLimit)

@app.get('/api/xray/health')
def health():
    load_model()
    history=ROOT/'runs/fracatlas-yolo11n/results.csv'
    epochs=len(list(csv.DictReader(history.open()))) if history.exists() else 0
    return {'ready':model is not None,'research_only':True,
      'progress':{'epochs_completed':report.get('epochs_completed') if report else epochs,'epochs_planned':report.get('epochs_requested',15) if report else 15,'stage':'ready' if model is not None else 'training'},
      'report':{k:v for k,v in report.items() if k!='history'} if report else None}

@app.get('/api/xray/sample/{kind}')
def sample(kind:str):
    if kind not in ['fractured','non-fractured']: raise HTTPException(404)
    split=ROOT/'artifacts/split.json'
    if not split.exists(): raise HTTPException(503,'Dataset not prepared')
    rows=json.loads(split.read_text())['test']
    row=next(r for r in rows if bool(r['boxes'])==(kind=='fractured'))
    path=ROOT/'data/FracAtlas/images'/('Fractured' if row['boxes'] else 'Non_fractured')/row['id']
    return FileResponse(path,media_type='image/jpeg')

def infer(raw):
    try:
        image=open_image(io.BytesIO(raw))
        if image.format not in ['JPEG','PNG','WEBP']: raise ValueError('format')
        if getattr(image,'n_frames',1)!=1: raise ValueError('animated image')
        if min(image.size)<64 or max(image.size)>12000 or image.width*image.height>25_000_000: raise ValueError('dimensions')
        image=ImageOps.exif_transpose(image).convert('RGB')
    except (UnidentifiedImageError,ValueError,OSError,Image.DecompressionBombError):
        raise HTTPException(422,'Use a valid JPEG, PNG or WebP image, at least 64 pixels; maximum 25 megapixels. DICOM is not supported.')
    with torch.inference_mode(): prediction=model.predict(image,conf=threshold,imgsz=report.get('input_size',320),device='cpu',verbose=False,max_det=20,iou=.3)[0]
    w,h=image.size
    detections=[]
    for b in prediction.boxes:
        box=b.xyxyn[0].clamp(0,1).tolist()
        if box[2]>box[0] and box[3]>box[1]: detections.append({'box':box,'score':round(float(b.conf[0]),4)})
    return {'model':report['id'],'status':'unvalidated_research_output','width':w,'height':h,
      'detections':detections,'threshold':threshold,'diagnosis':None,
      'message':'Candidate regions only. No finding does not exclude a fracture. Scores are not calibrated probabilities. No bruise/hairline classification or automatic 3D registration.'}

@app.post('/api/xray/analyze')
async def analyze(file:UploadFile):
    if model is None: raise HTTPException(503,'Model unavailable. Run training and restart the ML server.')
    raw=await file.read(12*1024*1024+1)
    await file.close()
    if len(raw)>12*1024*1024: raise HTTPException(413,'Maximum upload is 12 MB')
    async with lock: return await asyncio.to_thread(infer,raw)
