"""Full-backbone candidate training. Never overwrites the deployed model.
Run on a CUDA GPU where possible; CPU training is substantially slower.
Ultralytics model/code: AGPL-3.0. Dataset: FracAtlas CC BY 4.0.
"""
from pathlib import Path
import argparse,shutil,json,time
from train_yolo import ROOT,prepare,YOLO,torch

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--device',default='0' if torch.cuda.is_available() else 'cpu')
    parser.add_argument('--epochs',type=int,default=80)
    parser.add_argument('--batch',type=int,default=8)
    args=parser.parse_args()
    yaml,splits=prepare(False,'yolo-full','full-split.json')
    model=YOLO(str(ROOT/'cache/yolo11s.pt'))
    start=time.time()
    model.train(data=str(yaml),epochs=args.epochs,imgsz=640,batch=args.batch,
      device=args.device,workers=0 if args.device=='cpu' else 2,freeze=0,
      optimizer='AdamW',lr0=.0005,lrf=.01,warmup_epochs=3,seed=2026,
      deterministic=True,project=str(ROOT/'runs'),name='fracatlas-full',
      exist_ok=False,cache=False,plots=True,amp=args.device!='cpu',
      mosaic=0,mixup=0,hsv_h=0,hsv_s=0,hsv_v=.1,fliplr=.5,
      degrees=8,translate=.05,scale=.15,patience=20,save=True)
    folder=ROOT/'artifacts/candidate';folder.mkdir(exist_ok=True)
    shutil.copyfile(Path(model.trainer.save_dir)/'weights/best.pt',folder/'best.pt')
    (folder/'training.json').write_text(json.dumps({'architecture':'YOLO11s',
      'input_size':640,'freeze':0,'epochs_requested':args.epochs,
      'split_counts':{k:len(v) for k,v in splits.items()},'seconds':time.time()-start,
      'device':args.device,'deployed':False},indent=2))
    print('Candidate saved. Evaluate on validation and reserved images before activation.')

if __name__=='__main__':main()
