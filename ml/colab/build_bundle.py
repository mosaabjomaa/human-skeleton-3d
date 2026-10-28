"""Package only reproducible training source and fixed splits, never user uploads."""
from pathlib import Path
import json,zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'colab'
files=['download.py','train.py','network.py','image_io.py','train_yolo.py',
       'train_full.py','evaluate_yolo.py','compare_inference.py','evaluate_full.py',
       'artifacts/split.json','artifacts/dataset-audit.json','README.md']
with zipfile.ZipFile(OUT/'osseo-training.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in files:z.write(ROOT/name,'ml/'+name)

def cell(kind,source):
    result={'cell_type':kind,'metadata':{},'source':source.splitlines(keepends=True)}
    if kind=='code':result.update(execution_count=None,outputs=[])
    return result
cells=[cell('markdown','''# OSSEO — إعادة تدريب كاشف الكسور
اختار Runtime → Change runtime type → GPU. ارفع ملف osseo-training.zip في الخلية الأولى.
هذا تدريب جديد وليس نموذجًا مضمون الدقة. لا يفعّل النموذج على الموقع تلقائيًا.
المصدر: FracAtlas CC BY 4.0. النموذج وكود Ultralytics: AGPL-3.0.
لا ترفع صور مرضى؛ هذه الحزمة تحتوي كودًا وتقسيم بيانات عامة فقط.
'''),cell('code','''from google.colab import files
from pathlib import Path
import os, zipfile
uploaded=files.upload()
archive=Path('osseo-training.zip')
assert archive.exists(), 'Upload osseo-training.zip'
root=Path('/content/osseo-training');root.mkdir(exist_ok=True)
with zipfile.ZipFile(archive) as z:
    assert all((root/n.filename).resolve().is_relative_to(root.resolve()) for n in z.infolist())
    z.extractall(root)
os.chdir(root)
'''),cell('code','''import subprocess,sys,torch
assert torch.cuda.is_available(), 'Enable a GPU runtime first; GPU availability depends on your Colab account.'
subprocess.run([sys.executable,'-m','pip','install','ultralytics==8.4.191'],check=True)
subprocess.run([sys.executable,'ml/download.py'],check=True)
'''),cell('code','''# Fine-tune all layers; preserve the fixed validation/test split.
subprocess.run([sys.executable,'-u','ml/train_full.py','--device','0','--epochs','80','--batch','8'],check=True)
'''),cell('code','''subprocess.run([sys.executable,'-u','ml/evaluate_full.py'],check=True)
import json
report=json.loads(Path('ml/artifacts/candidate/metrics.json').read_text())
print(json.dumps(report,indent=2))
print('Meeting an internal engineering target does NOT establish clinical validity.')
'''),cell('code','''import zipfile
with zipfile.ZipFile('/content/osseo-candidate.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in ['best.pt','metrics.json','training.json','predictions.json']:
        p=Path('ml/artifacts/candidate')/name
        if p.exists():z.write(p,'candidate/'+name)
    z.write('ml/artifacts/full-split.json','full-split.json')
files.download('/content/osseo-candidate.zip')
''')]
notebook={'cells':cells,'metadata':{'colab':{'name':'OSSEO fracture detector training'},'accelerator':'GPU',
          'kernelspec':{'display_name':'Python 3','name':'python3'}},'nbformat':4,'nbformat_minor':5}
(OUT/'OSSEO_GPU_Training.ipynb').write_text(json.dumps(notebook,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built training-only archive and Colab notebook')
