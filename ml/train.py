"""Reproducible CPU research baseline; never a clinical diagnostic model."""
import os
from pathlib import Path
ROOT = Path(__file__).resolve().parent
os.environ['TORCH_HOME'] = str(ROOT/'cache')
import csv, hashlib, json, random, time, copy
import numpy as np
from PIL import Image
from image_io import open_image
import torch
from torch import nn
from torchvision.ops import box_iou
from network import Detector, preprocess, decode, SIZE, GRID

torch.set_num_threads(4)
torch.manual_seed(2026); random.seed(2026); np.random.seed(2026)
DATA = ROOT/'data/FracAtlas'
OUT = ROOT/'artifacts'; OUT.mkdir(exist_ok=True)

def records():
    rows = list(csv.DictReader((DATA/'dataset.csv').open()))
    audit={'csv_rows':len(rows),'missing_files':[],'unreadable_files':[],'exact_duplicates':[],'inconsistent_annotations':[]}
    result, seen = [], set()
    for row in rows:
        path = DATA/'images'/('Fractured' if int(row['fractured']) else 'Non_fractured')/row['image_id']
        if not path.exists(): audit['missing_files'].append(row['image_id']); continue
        try:
            with open_image(path) as im: im.load()
        except (OSError, ValueError):
            audit['unreadable_files'].append(row['image_id'])
            print('Skipped unreadable image', row['image_id'], flush=True); continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in seen: audit['exact_duplicates'].append(row['image_id']); continue
        seen.add(digest)
        label = DATA/'Annotations/YOLO'/path.with_suffix('.txt').name
        boxes = []
        if label.exists():
            for line in label.read_text().splitlines():
                fields = [float(x) for x in line.split()]
                if len(fields)==5:
                    _,cx,cy,w,h=fields
                    boxes.append([cx-w/2,cy-h/2,cx+w/2,cy+h/2])
        if bool(boxes) != bool(int(row['fractured'])):
            audit['inconsistent_annotations'].append(row['image_id'])
            print('Skipped inconsistent annotation',row['image_id'],flush=True); continue
        result.append({'id':row['image_id'],'path':str(path),'sha256':digest,'boxes':boxes})
    splits = {'train':[], 'validation':[], 'test':[]}
    for positive in [False,True]:
        group=[r for r in result if bool(r['boxes'])==positive]
        random.shuffle(group)
        n=len(group); a=int(.7*n); b=int(.85*n)
        for key,part in zip(splits,[group[:a],group[a:b],group[b:]]): splits[key].extend(part)
    (OUT/'split.json').write_text(json.dumps({k:[{f:v for f,v in r.items() if f!='path'} for r in rows] for k,rows in splits.items()},indent=2))
    audit['usable_unique_images']=len(result)
    (OUT/'dataset-audit.json').write_text(json.dumps(audit,indent=2))
    return splits

def cache_features(model, rows, name):
    cache = OUT/f'{name}-features.pt'
    if cache.exists(): return torch.load(cache,weights_only=True)
    feats,targets,truths=[],[],[]
    for start in range(0,len(rows),24):
        xs=[]
        for row in rows[start:start+24]:
            with open_image(row['path']) as im: x,info=preprocess(im)
            w,h,rw,rh,dx,dy=info
            truth=torch.tensor(row['boxes'],dtype=torch.float32).reshape(-1,4)
            if len(truth):
                truth[:,[0,2]]=(truth[:,[0,2]]*rw+dx)/SIZE
                truth[:,[1,3]]=(truth[:,[1,3]]*rh+dy)/SIZE
            target=torch.zeros(5,GRID,GRID)
            for box in truth:
                cx,cy=(box[:2]+box[2:])/2; bw,bh=box[2:]-box[:2]
                gx,gy=min(GRID-1,int(cx*GRID)),min(GRID-1,int(cy*GRID))
                target[:,gy,gx]=torch.tensor([1,cx*GRID-gx,cy*GRID-gy,bw,bh])
            xs.append(x); targets.append(target); truths.append(truth)
        with torch.inference_mode(): feats.append(model.backbone(torch.stack(xs)).clone())
        print(f'{name}: features {min(start+24,len(rows))}/{len(rows)}',flush=True)
    data=(torch.cat(feats),torch.stack(targets),truths)
    torch.save(data,cache)
    return data

def evaluate(head,data,threshold):
    features,targets,truths=data
    tp=fp=fn=itp=ifp=itn=ifn=0
    with torch.inference_mode(): outputs=torch.cat([head(x) for x in features.split(64)])
    for out,truth in zip(outputs,truths):
        preds=decode(out,threshold)
        positive=bool(len(truth)); detected=bool(preds)
        itp+=positive and detected; ifn+=positive and not detected
        ifp+=not positive and detected; itn+=not positive and not detected
        matched=set()
        for pred in preds:
            ious=box_iou(torch.tensor([pred['box']]),truth)[0] if len(truth) else []
            candidates=[i for i,v in enumerate(ious) if v>=.5 and i not in matched]
            if candidates: matched.add(max(candidates,key=lambda i:ious[i])); tp+=1
            else: fp+=1
        fn+=len(truth)-len(matched)
    return {'box_precision_iou50':tp/max(1,tp+fp),'box_recall_iou50':tp/max(1,tp+fn),
            'image_sensitivity':itp/max(1,itp+ifn),'image_specificity':itn/max(1,itn+ifp),
            'box_tp':tp,'box_fp':fp,'box_fn':fn,'image_tp':itp,'image_fp':ifp,'image_tn':itn,'image_fn':ifn,
            'images':len(truths),'fracture_images':sum(bool(len(t)) for t in truths)}

if __name__=='__main__':
    start=time.time(); splits=records()
    model=Detector(pretrained=True).eval()
    train=cache_features(model,splits['train'],'train')
    val=cache_features(model,splits['validation'],'validation')
    test=cache_features(model,splits['test'],'test')
    optimizer=torch.optim.AdamW(model.head.parameters(),lr=.001,weight_decay=.001)
    history=[]; bestloss=float('inf'); best=None
    for epoch in range(30):
        model.head.train(); total=0
        for ids in torch.randperm(len(train[0])).split(32):
            pred=model.head(train[0][ids]); target=train[1][ids]; pos=target[:,0]>0
            obj=nn.functional.binary_cross_entropy_with_logits(pred[:,0],target[:,0],reduction='none')
            # Balance positive and negative cells; no boxes are fabricated for negative images.
            loss=obj[pos].mean() if pos.any() else obj.mean()*0
            loss=loss+obj[~pos].mean()
            if pos.any(): loss=loss+8*nn.functional.smooth_l1_loss(pred[:,1:].permute(0,2,3,1)[pos].sigmoid(),target[:,1:].permute(0,2,3,1)[pos])
            optimizer.zero_grad(); loss.backward(); optimizer.step(); total+=float(loss.detach())
        model.head.eval()
        with torch.inference_mode():
            vout=torch.cat([model.head(x) for x in val[0].split(64)])
            vl=nn.functional.binary_cross_entropy_with_logits(vout[:,0],val[1][:,0],pos_weight=torch.tensor(60.)).item()
        history.append({'epoch':epoch+1,'train_loss':total,'validation_loss':vl})
        if vl<bestloss: bestloss=vl; best=copy.deepcopy(model.head.state_dict())
        print(f'Epoch {epoch+1}/30 loss={total:.3f} val={vl:.4f}',flush=True)
    model.head.load_state_dict(best); model.eval()
    choices=[]
    for threshold in [.3,.4,.5,.6,.7,.8,.9,.95]:
        m=evaluate(model.head,val,threshold)
        p,r=m['box_precision_iou50'],m['box_recall_iou50']
        choices.append((2*p*r/max(1e-9,p+r),threshold,m))
    _,threshold,validation=max(choices,key=lambda x:x[0])
    metrics=evaluate(model.head,test,threshold)
    report={'id':'osseo-fracatlas-grid-v1','status':'research_only_not_clinically_validated',
      'algorithm':'Frozen ImageNet MobileNetV3-Small + supervised convolutional grid detection head',
      'dataset':'FracAtlas v7','license':'CC BY 4.0','dataset_doi':'10.6084/m9.figshare.22363012.v7',
      'seed':2026,'epochs':30,'input_size':SIZE,'threshold':threshold,
      'split_counts':{k:len(v) for k,v in splits.items()},'validation':validation,'test':metrics,
      'split_limit':'Image-level stratified split; exact SHA256 duplicates removed. Patient IDs unavailable: patient-level separation and near-duplicate independence cannot be established.',
      'limitations':['Not a medical diagnosis.','Only fracture bounding boxes; no bruise/hairline subtype labels.','No automated bone, laterality, or 2D-to-3D registration.','No validated rejection of non-X-ray or out-of-distribution images.','No external or prospective clinical validation.'],
      'seconds':round(time.time()-start),'history':history}
    torch.save({'state':model.state_dict(),'threshold':threshold,'id':report['id']},OUT/'detector.pt')
    (OUT/'metrics.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2),flush=True)
