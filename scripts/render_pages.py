"""يحوّل كل صفحة من public/book.pdf إلى صورة PNG بـ 16 درجة رمادي (≈55KB للصفحة).

لماذا صور وليس PDF.js؟ خطوط الكتاب (Times/Helvetica) غير مضمّنة في الملف، وPDF.js يرسمها
بحروف ناقصة ومسافات خاطئة. Poppler يرسمها صحيحة، والصورة تعمل في كل متصفح وجوال.

الاستخدام:  python3 scripts/render_pages.py      (يتخطّى الصفحات الموجودة)
يحتاج: pdftoppm (poppler-utils) و Pillow.
"""
import os
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'public', 'book.pdf')
OUT = os.path.join(ROOT, 'public', 'pages')
DPI = 130


def page_count() -> int:
    info = subprocess.run(['pdfinfo', PDF], capture_output=True, text=True, check=True).stdout
    return int(next(l for l in info.splitlines() if l.startswith('Pages:')).split()[1])


def render(n: int) -> None:
    dest = os.path.join(OUT, f'p{n:04d}.png')
    if os.path.exists(dest):
        return
    with tempfile.TemporaryDirectory() as tmp:
        base = os.path.join(tmp, 'pg')
        subprocess.run(['pdftoppm', '-q', '-f', str(n), '-l', str(n), '-r', str(DPI), '-gray', '-png', '-singlefile', PDF, base], check=True)
        im = Image.open(base + '.png').convert('L').quantize(colors=16, dither=Image.Dither.NONE)
        im.save(dest + '.tmp', 'PNG', optimize=True)
        os.replace(dest + '.tmp', dest)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    total = page_count()
    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        for i, _ in enumerate(ex.map(render, range(1, total + 1)), 1):
            if i % 100 == 0:
                print(f'{i}/{total}', file=sys.stderr)
    print(f'{total} pages in {OUT}')


if __name__ == '__main__':
    main()
