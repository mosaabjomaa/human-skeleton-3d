"""Small research detector. Frozen ImageNet backbone, trainable fracture grid head."""
import torch
from torch import nn
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

SIZE = 320
GRID = 10

class Detector(nn.Module):
    def __init__(self, pretrained=False):
        super().__init__()
        self.backbone = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.DEFAULT if pretrained else None).features
        self.backbone.requires_grad_(False)
        self.head = nn.Sequential(nn.Conv2d(576, 128, 3, padding=1), nn.ReLU(), nn.Conv2d(128, 5, 1))

    def forward(self, x):
        return self.head(self.backbone(x))

def preprocess(image):
    import numpy as np
    from PIL import ImageOps
    image = ImageOps.exif_transpose(image).convert('RGB')
    w, h = image.size
    scale = SIZE / max(w, h)
    rw, rh = max(1, round(w * scale)), max(1, round(h * scale))
    canvas = __import__('PIL.Image', fromlist=['Image']).new('RGB', (SIZE, SIZE))
    dx, dy = (SIZE-rw)//2, (SIZE-rh)//2
    canvas.paste(image.resize((rw, rh)), (dx, dy))
    a = torch.from_numpy(np.asarray(canvas).copy()).permute(2,0,1).float()/255
    a = (a - torch.tensor([.485,.456,.406])[:,None,None])/torch.tensor([.229,.224,.225])[:,None,None]
    return a, (w,h,rw,rh,dx,dy)

def decode(output, threshold=.5):
    from torchvision.ops import nms
    p = output.detach().cpu()
    scores = p[0].sigmoid()
    ys, xs = torch.where(scores >= threshold)
    if not len(xs): return []
    offsets = p[1:3,ys,xs].sigmoid()
    wh = p[3:5,ys,xs].sigmoid()
    cx,cy = (xs+offsets[0])/GRID, (ys+offsets[1])/GRID
    boxes = torch.stack([cx-wh[0]/2,cy-wh[1]/2,cx+wh[0]/2,cy+wh[1]/2],1).clamp(0,1)
    s = scores[ys,xs]
    keep = nms(boxes,s,.3)[:10]
    return [{'box': boxes[i].tolist(), 'score': float(s[i])} for i in keep]
