"""Import the user's Colab training result, preserving the previous model."""
from pathlib import Path
import hashlib,json,zipfile,sys
from evaluate_yolo import evaluate
ROOT=Path(__file__).resolve().parent
archive=Path(sys.argv[1]).resolve()
digest=hashlib.sha256(archive.read_bytes()).hexdigest()
destination=ROOT/'artifacts/colab-import'/digest[:12]
destination.mkdir(parents=True,exist_ok=True)
expected={'candidate/best.pt','candidate/metrics.json','candidate/training.json','candidate/predictions.json','full-split.json'}
with zipfile.ZipFile(archive) as z:
    assert set(z.namelist())==expected,'Unexpected bundle contents'
    assert sum(i.file_size for i in z.infolist())<60*1024*1024,'Bundle too large'
    for i in z.infolist():
        target=(destination/i.filename).resolve()
        assert target.is_relative_to(destination.resolve()),'Unsafe archive path'
    z.extractall(destination)
metrics=json.loads((destination/'candidate/metrics.json').read_text())
training=json.loads((destination/'candidate/training.json').read_text())
weights=destination/'candidate/best.pt'
assert hashlib.sha256(weights.read_bytes()).hexdigest()==metrics['weights_sha256'],'Weight hash mismatch'
predictions=json.loads((destination/'candidate/predictions.json').read_text())
splits=json.loads((destination/'full-split.json').read_text())
original=json.loads((ROOT/'artifacts/split.json').read_text())
for name in ['train','validation','test']:
    assert {r['id']:(r['sha256'],r['boxes']) for r in splits[name]}=={r['id']:(r['sha256'],r['boxes']) for r in original[name]},'Original dataset split changed'
for name in ['validation','test']:
    assert [r['id'] for r in predictions[name]]==[r['id'] for r in splits[name]],'Prediction split mismatch'
    assert all(p['truth']==s['boxes'] for p,s in zip(predictions[name],splits[name])),'Ground-truth mismatch'
    computed=evaluate(predictions[name],metrics['threshold'])
    for key,value in computed.items():assert abs(value-metrics[name][key])<1e-9,f'Metric mismatch: {name}/{key}'
old=json.loads((ROOT/'artifacts/yolo-metrics.json').read_text())
assert metrics['test']['box_recall_iou50']>old['test']['box_recall_iou50']
assert metrics['test']['box_precision_iou50']>old['test']['box_precision_iou50']
report={**old,**metrics,'id':'osseo-fracatlas-yolo11s-colab-v2',
  'algorithm':'YOLO11s COCO-pretrained, full-backbone fine-tuning at 640 pixels',
  'training_sampling':'All 2806 unique training images; validation/test split preserved.',
  'split_counts':training['split_counts'],'epochs_requested':training['epochs_requested'],
  'bundle_sha256':digest,'training_seconds':training['seconds'],
  'status':'research_only_target_not_met','deployment_note':'Improved research model; internal 80% precision/recall target NOT met. Not clinically validated.'}
for key in ['epochs_completed','history','pretrained_sha256','pretrained_source','evaluation_seconds']:
    report.pop(key,None)
(destination/'service-report.json').write_text(json.dumps(report,indent=2))
manifest={'weights':str(weights.relative_to(ROOT/'artifacts')).replace('\\','/'),
          'report':str((destination/'service-report.json').relative_to(ROOT/'artifacts')).replace('\\','/')}
temporary=ROOT/'artifacts/active-model.tmp'
temporary.write_text(json.dumps(manifest,indent=2));temporary.replace(ROOT/'artifacts/active-model.json')
print(json.dumps({'active':manifest,'test':metrics['test'],'target_met':metrics['meets_engineering_target']},indent=2))
