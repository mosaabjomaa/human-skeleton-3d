"""Fixed internal test evaluation. Select threshold on validation, never on test."""
from pathlib import Path
import os,json,time,hashlib,csv
ROOT=Path(__file__).resolve().parent
os.environ['YOLO_CONFIG_DIR']=str(ROOT/'config')
os.environ['MPLCONFIGDIR']=str(ROOT/'cache/matplotlib')
os.environ['YOLO_AUTOINSTALL']='false'
import torch
torch.set_num_threads(4)
from ultralytics import YOLO
from torchvision.ops import box_iou

def predict(model,rows,name):
    records=[]
    for i,row in enumerate(rows):
        image=ROOT/'data/FracAtlas/images'/('Fractured' if row['boxes'] else 'Non_fractured')/row['id']
        result=model.predict(str(image),conf=.01,iou=.3,imgsz=320,device='cpu',verbose=False,max_det=10)[0]
        records.append({'id':row['id'],'truth':row['boxes'],
          'predictions':[{'box':b.xyxyn[0].clamp(0,1).tolist(),'score':float(b.conf[0])} for b in result.boxes]})
        if i%100==0: print(f'{name} inference {i}/{len(rows)}',flush=True)
    return records

def evaluate(records,threshold):
    tp=fp=fn=itp=ifp=itn=ifn=0
    for record in records:
        truth=torch.tensor(record['truth'],dtype=torch.float32).reshape(-1,4)
        preds=[p for p in record['predictions'] if p['score']>=threshold]
        positive=bool(len(truth));detected=bool(preds)
        itp+=positive and detected;ifn+=positive and not detected
        ifp+=not positive and detected;itn+=not positive and not detected
        matched=set()
        for pred in sorted(preds,key=lambda p:p['score'],reverse=True):
            ious=box_iou(torch.tensor([pred['box']]),truth)[0] if len(truth) else []
            candidates=[i for i,v in enumerate(ious) if v>=.5 and i not in matched]
            if candidates: matched.add(max(candidates,key=lambda i:ious[i]));tp+=1
            else:fp+=1
        fn+=len(truth)-len(matched)
    return {'box_precision_iou50':tp/max(1,tp+fp),'box_recall_iou50':tp/max(1,tp+fn),
      'image_sensitivity':itp/max(1,itp+ifn),'image_specificity':itn/max(1,itn+ifp),
      'box_tp':tp,'box_fp':fp,'box_fn':fn,'image_tp':itp,'image_fp':ifp,'image_tn':itn,'image_fn':ifn,
      'images':len(records),'fracture_images':sum(bool(r['truth']) for r in records)}

def main():
    start=time.time()
    splits=json.loads((ROOT/'artifacts/yolo-split.json').read_text())
    weights=ROOT/'artifacts/yolo-detector.pt'
    model=YOLO(str(weights))
    validation=predict(model,splits['validation'],'Validation')
    choices=[]
    for threshold in [.05,.1,.15,.2,.25,.3,.4,.5,.6,.7,.8,.9]:
        m=evaluate(validation,threshold);p,r=m['box_precision_iou50'],m['box_recall_iou50']
        choices.append((2*p*r/max(1e-9,p+r),threshold,m))
    _,threshold,val=max(choices,key=lambda x:x[0])
    test=predict(model,splits['test'],'Test')
    test_metrics=evaluate(test,threshold)
    history=list(csv.DictReader((ROOT/'runs/fracatlas-yolo11n/results.csv').open()))
    report={'id':'osseo-fracatlas-yolo11n-v1','status':'research_only_not_clinically_validated',
      'algorithm':'YOLO11n COCO-pretrained, first 10 layers frozen, fracture detection fine-tuning',
      'dataset':'FracAtlas v7','dataset_license':'CC BY 4.0','model_license':'AGPL-3.0 (Ultralytics)',
      'dataset_doi':'10.6084/m9.figshare.22363012.v7','seed':2026,'epochs_completed':len(history),'input_size':320,
      'training_sampling':f"All {sum(bool(r['boxes']) for r in splits['train'])} fracture-positive training images + {sum(not bool(r['boxes']) for r in splits['train'])} seeded negative images. Validation and test preserve natural prevalence.",
      'split_counts':{k:len(v) for k,v in splits.items()},'threshold':threshold,'validation':val,'test':test_metrics,
      'split_limit':'Image-level stratified split. Exact SHA256 duplicates removed; patient IDs unavailable. Patient-level separation and near-duplicate independence are unverified.',
      'limitations':['No clinical validation.','No bruise or hairline subtype classification.','No automated bone or laterality classification.','Manual whole-bone atlas association only, no 3D fracture registration.','No validated non-X-ray or out-of-distribution rejection.','Small internal test; scores are not calibrated medical probabilities.'],
      'weights_sha256':hashlib.sha256(weights.read_bytes()).hexdigest(),'evaluation_seconds':round(time.time()-start),
      'pretrained_source':'https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo11n.pt',
      'pretrained_sha256':hashlib.sha256((ROOT/'cache/yolo11n.pt').read_bytes()).hexdigest(),
      'dataset_audit':json.loads((ROOT/'artifacts/dataset-audit.json').read_text()) if (ROOT/'artifacts/dataset-audit.json').exists() else None,
      'history':history}
    (ROOT/'artifacts/yolo-predictions.json').write_text(json.dumps({'validation':validation,'test':test},indent=2))
    temporary=ROOT/'artifacts/yolo-metrics.tmp'
    temporary.write_text(json.dumps(report,indent=2));temporary.replace(ROOT/'artifacts/yolo-metrics.json')
    print(json.dumps({k:v for k,v in report.items() if k!='history'},indent=2),flush=True)

if __name__=='__main__':main()
