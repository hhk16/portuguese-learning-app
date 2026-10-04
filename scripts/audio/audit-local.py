#!/usr/bin/env python3
"""Decode every referenced native recording and optionally transcribe an audit set.
Objective checks cannot establish accent or pleasantness. ASR mismatches need review.
"""
import argparse,concurrent.futures,json,pathlib,re,subprocess
import numpy as np
p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--asr',action='store_true');p.add_argument('--staged');p.add_argument('--asr-model',default='small');p.add_argument('--texts');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[2]
manifest=json.loads((root/'public/audio/manifest.json').read_text())
records={k:root/'public/audio'/f for k,f in manifest.items()}
if a.staged:
 staged=pathlib.Path(a.staged);data=json.loads((staged/'staged.json').read_text());records={k:staged/v['file'] for k,v in data.items()}
if a.texts:
 keys={' '.join(t.strip().lower().split()) for t in json.loads(pathlib.Path(a.texts).read_text())}
 records={k:v for k,v in records.items() if k in keys}
def decode(path):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ar','16000','-ac','1','-f','f32le','-']),dtype=np.float32)
def audit(item):
 k,path=item
 try:
  v=decode(path);peak=float(np.max(np.abs(v)));active=np.flatnonzero(np.abs(v)>.008)
  out={'text':k,'file':path.name,'duration':round(len(v)/16000,3),'peak':round(peak,4),'clippedSamples':int(np.sum(np.abs(v)>=.999)), 'rms':round(float(np.sqrt(np.mean(v*v))),4)}
  out['leadSilence']=round(active[0]/16000,3) if active.size else out['duration'];out['tailSilence']=round((len(v)-active[-1])/16000,3) if active.size else out['duration']
  out['flags']=[label for label,check in [('empty-or-quiet',peak<.03),('too-short',len(v)<2400),('clipping',out['clippedSamples']>8),('long-lead',out['leadSilence']>.7),('long-tail',out['tailSilence']>1),('nonfinite',not np.isfinite(v).all())] if check];return out
 except Exception as e:return {'text':k,'file':path.name,'flags':['decode-error'],'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(audit,records.items()))
report={'recordings':len(results),'flagged':[r for r in results if r['flags']], 'measurements':results}
pathlib.Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Decoded',len(results),'flagged',len(report['flagged']),flush=True)
if a.asr:
 from faster_whisper import WhisperModel
 model=WhisperModel(a.asr_model,device='cpu',compute_type='int8',cpu_threads=2,download_root='/workspace/toolchain/whisper-models')
 def normalize(s):return re.findall(r'[^\W\d_]+',s.lower())
 def distance(x,y):
  row=list(range(len(y)+1))
  for i,c in enumerate(x):
   nxt=[i+1]
   for j,d in enumerate(y):nxt.append(min(nxt[-1]+1,row[j+1]+1,row[j]+(c!=d)))
   row=nxt
  return row[-1]
 report['asrModel']=a.asr_model
 report['transcriptions']=[]
 # Staged: all. Existing: deterministic representative short/long words and sentences.
 selected=list(records) if a.staged else list(dict.fromkeys(list(records)[::max(1,len(records)//20)]+['bom dia!','queria um café, por favor.','queria duas sopas e um pão, por favor.','queria três águas e dois cafés, por favor.']))
 for k in selected:
  if k not in records:continue
  seg,info=model.transcribe(decode(records[k]),language='pt',beam_size=5,vad_filter=False,condition_on_previous_text=False)
  text=' '.join(s.text for s in seg).strip();x,y=normalize(k),normalize(text)
  r={'expected':k,'transcript':text,'wordErrorRate':round(distance(x,y)/max(1,len(x)),3)}
  report['transcriptions'].append(r);print(r,flush=True)
  pathlib.Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
