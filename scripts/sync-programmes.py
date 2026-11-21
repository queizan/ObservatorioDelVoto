#!/usr/bin/env python3
"""Validate and regenerate the public programme/document comparison bundle. No dependencies."""
from pathlib import Path
from urllib.parse import urlparse
import json
BASE=Path(__file__).resolve().parents[1]
SOURCE=BASE/'data/programmes.json'
TARGET=BASE/'data/programmes.js'
d=json.loads(SOURCE.read_text(encoding='utf-8'))
parties=d['parties']; topics=d['topics']
keys=[p['key'] for p in parties]; topic_keys=[t['key'] for t in topics]
assert len(keys)==len(set(keys)) and len(keys)>=11, 'Duplicate/missing party keys'
assert len(topic_keys)==len(set(topic_keys)) and len(topic_keys)>=12, 'Duplicate/missing topics'
def https(v):
    u=urlparse(v)
    return u.scheme=='https' and bool(u.netloc)
for p in parties:
    assert p['year'] in (2023,2026) and https(p['url']) and p['label'] and p['type']
    for old in p.get('history',[]):
        assert old.get('year') and https(old['url']) and old.get('title')
    for doc in p.get('supplementaryDocuments',[]):
        assert doc.get('title') and https(doc['url'])
assert set(d['positions'])==set(keys), 'Missing party position matrix'
total=0
for k in keys:
    row=d['positions'][k]
    assert set(row)==set(topic_keys), f'Incomplete topic list: {k}'
    for t,entry in row.items():
        if entry is None: continue
        assert isinstance(entry['summary'],str) and len(entry['summary'].strip())>=25, (k,t)
        assert entry['year'] in (2023,2026) and https(entry['sourceUrl']) and entry['sourceTitle'], (k,t)
        assert entry['year']==next(p['year'] for p in parties if p['key']==k), (k,t)
        total+=1
assert total>=80, 'Insufficient documented comparisons'
TARGET.write_text('/* AUTO-GENERATED from data/programmes.json; run python3 scripts/sync-programmes.py */\nwindow.PROGRAMMES_DATA = '+json.dumps(d,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(f'OK: {len(parties)} parties; {len(topics)} subjects; {total} sourced programme summaries; quiz removed')
