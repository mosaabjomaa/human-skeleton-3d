"""Validation-only experiment. Never changes the deployed model or test labels."""
from pathlib import Path
import os,json,time
ROOT=Path(__file__).resolve().parent
os.environ['YOLO_CONFIG_DIR']=str(ROOT/'config')
os.environ['YOLO_AUTOINSTALL']='false'
from image_io import open_image
from PIL import ImageOps
import torch
from torchvision.ops import nms
from ultralytics import YOLO
from evaluate_yolo import evaluate
torch.set_num_threads(4)

def predictions(model,image,size,tiled,device='cpu'):
    w,h=image.size
    views=[(image,(0,0,w,h))]
    if tiled:
        cw,ch=round(w*.65),round(h*.65)
        for x,y in [(0,0),(w-cw,0),(0,h-ch),(w-cw,h-ch)]:
            views.append((image.crop((x,y,x+cw,y+ch)),(x,y,cw,ch)))
    boxes=[];scores=[]
    for view,(x,y,vw,vh) in views:
        result=model.predict(view,imgsz=size,conf=.01,iou=.3,max_det=20,device=device,verbose=False)[0]
        for b in result.boxes:
            a,c,d,e=b.xyxyn[0].tolist()
            boxes.append([(a*vw+x)/w,(c*vh+y)/h,(d*vw+x)/w,(e*vh+y)/h]);scores.append(float(b.conf[0]))
    if not boxes:return []
    boxes=torch.tensor(boxes).clamp(0,1);scores=torch.tensor(scores)
    keep=nms(boxes,scores,.3)[:20]
    return [{'box':boxes[i].tolist(),'score':float(scores[i])} for i in keep]

def main():
    model=YOLO(str(ROOT/'artifacts/yolo-detector.pt'))
    rows=json.loads((ROOT/'artifacts/yolo-split.json').read_text())['validation']
    summary=[]
    baseline=json.loads((ROOT/'artifacts/yolo-predictions.json').read_text())['validation']
    for name,size,tiled in [('baseline',320,False),('high_resolution',640,False),('overlapping_crops',320,True)]:
        cache=ROOT/f'artifacts/experiment-{name}.json'
        start=time.time()
        if name=='baseline':records=baseline
        elif cache.exists():records=json.loads(cache.read_text())
        else:
            records=[]
            for i,row in enumerate(rows):
                path=ROOT/'data/FracAtlas/images'/('Fractured' if row['boxes'] else 'Non_fractured')/row['id']
                with open_image(path) as im:image=ImageOps.exif_transpose(im).convert('RGB')
                records.append({'id':row['id'],'truth':row['boxes'],'predictions':predictions(model,image,size,tiled)})
                if i%100==0:print(name,i,len(rows),flush=True)
            cache.write_text(json.dumps(records))
        choices=[]
        for threshold in [.03,.05,.075,.1,.15,.2,.25,.3,.4,.5,.6,.7]:
            m=evaluate(records,threshold);p,r=m['box_precision_iou50'],m['box_recall_iou50']
            choices.append({'threshold':threshold,'metrics':m,'f1':2*p*r/max(1e-9,p+r)})
        best=max(choices,key=lambda x:x['f1'])
        summary.append({'name':name,'size':size,'tiled':tiled,'best':best,'all_thresholds':choices,'seconds':round(time.time()-start)})
        (ROOT/'artifacts/inference-comparison.json').write_text(json.dumps(summary,indent=2))
        print(name,json.dumps(best),flush=True)

if __name__=='__main__':main()
