"""Keep Pillow's standard decoder, before optional ML format monkey-patches."""
from PIL import Image
open_image = Image.open
