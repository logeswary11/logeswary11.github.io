#!/usr/bin/env python3
"""Copy only public website files to the Pages artifact."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for name in ('index.html', 'work.html', 'library.html', 'venture-scout.html', 'CNAME'):
    src = ROOT / name
    if src.exists():
        shutil.copy2(src, OUT / name)
shutil.copytree(ROOT / 'assets', OUT / 'assets')
(OUT / 'data').mkdir()
shutil.copy2(ROOT / 'data/writings.json', OUT / 'data/writings.json')
(OUT / '.nojekyll').touch()
print('Public site prepared in _site/.')
