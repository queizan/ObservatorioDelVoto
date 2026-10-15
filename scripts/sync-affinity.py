#!/usr/bin/env python3
"""Validate source question bank and emit data/affinity.js. No dependencies."""
from pathlib import Path
import json
BASE=Path(__file__).resolve().parents[1]
src=BASE/'data/affinity.json'
tgt=BASE/'data/affinity.js'
d=json.loads(src.read_text('utf8'))
assert d['questionCount']>=30
assert len(d['questions'])>=d['questionCount']
assert len(set(q['id'] for q in d['questions']))==len(d['questions'])
expected=set(d['parties'])
assert len(expected)>=11
for question in d['questions']:
    assert all(question.get(k) for k in ('id','topic','text','source'))
    assert question['source'].startswith('https://')
    assert set(question['positions'])==expected
    assert all(v is None or (isinstance(v,int) and -2<=v<=2) for v in question['positions'].values())
    assert sum(v is not None for v in question['positions'].values()) >= 2
assert set(d['parties'])==expected
assert set(x['key'] for x in d['programmes'])==expected
assert len(set(x['topic'] for x in d['questions'])) >= 15
assert all(x.get('territory') and x.get('type') and x.get('year')==2023 for x in d['programmes'])
for program in d['programmes']:
    assert program['url'].startswith('https://')
tgt.write_text('/* AUTO-GENERATED from data/affinity.json */\nwindow.AFFINITY_BANK = '+json.dumps(d,ensure_ascii=False,indent=2)+';\n','utf8')
print(f"OK: {len(d['questions'])} validated questions; quiz displays {d['questionCount']}")
