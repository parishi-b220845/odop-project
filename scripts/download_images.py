#!/usr/bin/env python3
"""
Download all ODOP product images from the CSV Google Drive URLs.
Saves to: scripts/odop_images/{fileId}.jpg
Produces: scripts/image_map.json  { "STATE|PRODUCT|DISTRICT": "fileId" }
"""
import csv, re, os, json, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

CSV_PATH  = os.path.join(os.path.dirname(__file__), '../backend/seeds/odop_dataset.csv')
OUT_DIR   = os.path.join(os.path.dirname(__file__), 'odop_images')
MAP_PATH  = os.path.join(os.path.dirname(__file__), 'image_map.json')
WORKERS   = 15
TIMEOUT   = 12

os.makedirs(OUT_DIR, exist_ok=True)

# ── Read CSV ────────────────────────────────────────────────────────────────
rows = []
with open(CSV_PATH, encoding='latin-1') as f:
    for r in csv.DictReader(f):
        state   = r['State'].strip()
        product = r['Product'].strip()
        district= r['District'].strip()
        photo   = r['Photo'].strip()
        m = re.search(r'/d/([a-zA-Z0-9_-]+)', photo)
        if m:
            rows.append((state, product, district, m.group(1)))

print(f'CSV rows with Drive URLs: {len(rows)}')

# ── Download one image ──────────────────────────────────────────────────────
def download(state, product, district, fid):
    dest = os.path.join(OUT_DIR, f'{fid}.jpg')
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        return fid, True, 'cached'
    url = f'https://lh3.googleusercontent.com/d/{fid}=w800-h800'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            data = r.read()
        if len(data) < 5000:
            return fid, False, f'too small ({len(data)}b)'
        with open(dest, 'wb') as f:
            f.write(data)
        return fid, True, f'{len(data)//1024}KB'
    except Exception as e:
        return fid, False, str(e)[:60]

# ── Run parallel downloads ──────────────────────────────────────────────────
ok = err = 0
image_map = {}   # "STATE|PRODUCT|DISTRICT" -> fileId

futures = {}
with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    for state, product, district, fid in rows:
        key = f'{state}|{product}|{district}'
        image_map[key] = fid
        futures[ex.submit(download, state, product, district, fid)] = (state, product, fid)

    total = len(futures)
    for i, fut in enumerate(as_completed(futures), 1):
        fid, success, msg = fut.result()
        state, product, _ = futures[fut]
        status = '✓' if success else '✗'
        if success:
            ok += 1
        else:
            err += 1
        if i % 50 == 0 or not success:
            print(f'[{i}/{total}] {status} {fid[:16]}  {msg}  ({product[:30]})')

print(f'\nDone: {ok} OK, {err} failed')

with open(MAP_PATH, 'w') as f:
    json.dump(image_map, f, indent=2)
print(f'Map saved → {MAP_PATH}')
