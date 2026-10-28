"""Second research experiment: pretrained YOLO11n detector, CPU fine-tuning.
Ultralytics code and weights are AGPL-3.0; see https://www.ultralytics.com/license.
"""
from pathlib import Path
import os,json,random,shutil,time
ROOT=Path(__file__).resolve().parent
os.environ['YOLO_CONFIG_DIR']=str(ROOT/'config')
os.environ['MPLCONFIGDIR']=str(ROOT/'cache/matplotlib')
os.environ['YOLO_AUTOINSTALL']='false'
os.environ['WANDB_MODE']='disabled'
os.chdir(ROOT)
import torch
from image_io import open_image
torch.set_num_threads(4)
from ultralytics import YOLO,settings
settings.update({'sync':False,'runs_dir':str(ROOT/'runs'),'weights_dir':str(ROOT/'cache'),'datasets_dir':str(ROOT/'data')})

def prepare(balanced=True,destination='yolo',split_name='yolo-split.json'):
    if not (ROOT/'artifacts/split.json').exists():
        from train import records
        records()
    splits=json.loads((ROOT/'artifacts/split.json').read_text())
    random.seed(2026)
    positive=[r for r in splits['train'] if r['boxes']]
    negative=[r for r in splits['train'] if not r['boxes']]
    random.shuffle(negative)
    if balanced: splits['train']=positive+negative[:len(positive)]
    sets={k:{r['sha256'] for r in v} for k,v in splits.items()}
    assert not sets['train']&sets['validation'] and not sets['train']&sets['test'] and not sets['validation']&sets['test'], 'Cross-split duplicate detected'
    folder=ROOT/'data'/destination
    for key,rows in splits.items():
        images=folder/'images'/key;labels=folder/'labels'/key
        images.mkdir(parents=True,exist_ok=True);labels.mkdir(parents=True,exist_ok=True)
        for row in rows:
            source=ROOT/'data/FracAtlas/images'/('Fractured' if row['boxes'] else 'Non_fractured')/row['id']
            target=images/row['id']
            if not target.exists():
                try: os.link(source,target)
                except OSError: shutil.copyfile(source,target)
            lines=[]
            for a,b,c,d in row['boxes']: lines.append(f'0 {(a+c)/2} {(b+d)/2} {c-a} {d-b}')
            (labels/Path(row['id']).with_suffix('.txt').name).write_text('\n'.join(lines))
        # Explicit manifests avoid accidentally including stale files after a split changes.
        (folder/f'{key}.txt').write_text('\n'.join((images/r['id']).as_posix() for r in rows))
    (ROOT/'artifacts'/split_name).write_text(json.dumps(splits,indent=2))
    yaml=folder/'dataset.yaml'
    yaml.write_text(f"path: {folder.as_posix()}\ntrain: train.txt\nval: validation.txt\ntest: test.txt\nnames:\n  0: fracture\n")
    return yaml,splits

if __name__=='__main__':
    start=time.time();yaml,splits=prepare()
    model=YOLO(str(ROOT/'cache/yolo11n.pt'))
    model.train(data=str(yaml),epochs=15,imgsz=320,batch=16,device='cpu',workers=0,
      freeze=10,optimizer='AdamW',lr0=.001,seed=2026,deterministic=True,
      project=str(ROOT/'runs'),name='fracatlas-yolo11n',exist_ok=True,
      cache='ram',plots=False,save=True,verbose=False,amp=False,
      mosaic=0,mixup=0,fliplr=.5,hsv_h=0,hsv_s=0,hsv_v=.1,
      degrees=8,translate=.05,scale=.15,close_mosaic=0,patience=8)
    best=ROOT/'runs/fracatlas-yolo11n/weights/best.pt'
    trained=YOLO(str(best))
    # Threshold selection and evaluation implemented separately for transparent TP/FP counts.
    shutil.copyfile(best,ROOT/'artifacts/yolo-detector.pt')
    print('Training finished; evaluating held-out images',time.time()-start,flush=True)
    from evaluate_yolo import main
    main()
