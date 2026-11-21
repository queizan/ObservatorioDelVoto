#!/usr/bin/env python3
"""Validate governments.json and regenerate static browser bundle (stdlib only)."""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
d=json.loads((BASE/'data/governments.json').read_text(encoding='utf-8'))
assert d['schemaVersion']==1
assert len(d['terms'])==8 and len(d['series'])==26
assert [int(y) for y in d['series']]==list(range(2000,2026))
assert len(set(x['id'] for x in d['terms']))==len(d['terms'])
ids=[x['id'] for x in d['indicatorDefs']]
assert len(ids)==len(set(ids)) and len(ids)>=4
for y,v in d['series'].items():
    assert set(ids)==set(v), (y,'missing indicators')
    for k,val in v.items(): assert val is None or isinstance(val,(int,float)), (y,k)
for t in d['terms']:
    assert t['leader'] in d['leaders'] and 2000<=t['from']<=t['to']<=2025
    assert t['start'] and t['period'] and t['id']
    for e in t['events']:
        assert e['url'].startswith('https://') and e['title'] and e['objective'] and e['action'] and e['result']
for x in d['judicial']:
    assert x['periodId'] in {t['id'] for t in d['terms']}
    assert x['source'].startswith('https://')
out='/* AUTO-GENERATED from data/governments.json; run python3 scripts/sync-governments.py */\nwindow.GOVERNMENTS_DATA = '+json.dumps(d,ensure_ascii=False,indent=2)+';\n'
(BASE/'data/governments.js').write_text(out,encoding='utf-8')
print('OK: '+str(len(d['terms']))+' terms; '+str(len(d['series']))+' years; '+str(len(d['judicial']))+' judicial records')
