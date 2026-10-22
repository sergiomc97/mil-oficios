import sys
from pathlib import Path
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

LADO_MAX = 1600


def preparar(origen, destino):
    with Image.open(origen) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        img.thumbnail((LADO_MAX, LADO_MAX))
        limpia = Image.new("RGB", img.size)
        limpia.paste(img)
        Path(destino).parent.mkdir(parents=True, exist_ok=True)
        limpia.save(destino, "JPEG", quality=85, optimize=True, progressive=True)
        print(f"{destino} {limpia.size[0]}x{limpia.size[1]}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("uso: python3 scripts/fotos.py <origen> <assets/fotos/nombre.jpg>")
    preparar(sys.argv[1], sys.argv[2])
