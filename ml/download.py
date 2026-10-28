"""Download the pinned, attributed FracAtlas v7 archive, verify before extraction."""
import hashlib,json,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent
DATA=ROOT/'data';DATA.mkdir(exist_ok=True)
url='https://api.figshare.com/v2/articles/22363012/versions/7'
meta=json.load(urllib.request.urlopen(url))
if meta['license']['name']!='CC BY 4.0': raise RuntimeError('Review changed license')
(ROOT/'dataset-source.json').write_text(json.dumps(meta,indent=2))
f=meta['files'][0];archive=DATA/'FracAtlas.zip'
if not archive.exists(): urllib.request.urlretrieve(f['download_url'],archive)
if hashlib.md5(archive.read_bytes()).hexdigest()!=f['computed_md5']: raise RuntimeError('Archive integrity check failed')
with zipfile.ZipFile(archive) as z:
    for item in z.infolist():
        if not (DATA/item.filename).resolve().is_relative_to(DATA.resolve()): raise RuntimeError('Unsafe archive path')
    z.extractall(DATA)
print('Downloaded and verified FracAtlas v7, CC BY 4.0')
