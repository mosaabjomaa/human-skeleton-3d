"""Evaluate the full-training candidate without changing the deployed service."""
from train_yolo import ROOT,YOLO,torch
from evaluate_yolo import evaluate
from compare_inference import predictions
from image_io import open_image
from PIL import ImageOps
import json,hashlib

def run(model,rows,label):
    result=[]
    for i,row in enumerate(rows):
        path=ROOT/'data/FracAtlas/images'/('Fractured' if row['boxes'] else 'Non_fractured')/row['id']
        with open_image(path) as image: image=ImageOps.exif_transpose(image).convert('RGB')
        result.append({'id':row['id'],'truth':row['boxes'],'predictions':predictions(model,image,640,False,'0' if torch.cuda.is_available() else 'cpu')})
        if i%100==0:print(label,i,len(rows),flush=True)
    return result

def main():
    folder=ROOT/'artifacts/candidate';weights=folder/'best.pt'
    model=YOLO(str(weights))
    splits=json.loads((ROOT/'artifacts/full-split.json').read_text())
    validation=run(model,splits['validation'],'Validation')
    choices=[]
    for threshold in [.03,.05,.075,.1,.15,.2,.25,.3,.4,.5,.6,.7,.8]:
        m=evaluate(validation,threshold);p,r=m['box_precision_iou50'],m['box_recall_iou50']
        choices.append((2*p*r/max(1e-9,p+r),threshold,m))
    _,threshold,val=max(choices,key=lambda row:row[0])
    test=run(model,splits['test'],'Test');metrics=evaluate(test,threshold)
    report={'status':'unvalidated_research_candidate','input_size':640,
      'threshold':threshold,'validation':val,'test':metrics,
      'weights_sha256':hashlib.sha256(weights.read_bytes()).hexdigest(),
      'engineering_target':{'box_precision_iou50':.8,'box_recall_iou50':.8},
      'meets_engineering_target':metrics['box_precision_iou50']>=.8 and metrics['box_recall_iou50']>=.8,
      'clinical_validation':False,'note':'Engineering targets are not clinical acceptance criteria. Patient-level independence is unverified. No bruise/hairline subtype or automatic 3D localization.'}
    (folder/'metrics.json').write_text(json.dumps(report,indent=2))
    (folder/'predictions.json').write_text(json.dumps({'validation':validation,'test':test}))
    print(json.dumps(report,indent=2),flush=True)

if __name__=='__main__':main()
