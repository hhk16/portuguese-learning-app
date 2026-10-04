#!/usr/bin/env python3
"""Stage local, free Qwen3-TTS speech. Never promote unchecked audio automatically.
Requires torch (CPU or CUDA), qwen-tts==0.1.1 and soundfile; ffmpeg on PATH.
The model and staging directory must stay outside the repository.
"""
import argparse, hashlib, json, os, pathlib, subprocess, time
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
p = argparse.ArgumentParser()
p.add_argument('--model', required=True); p.add_argument('--work', required=True)
p.add_argument('--threads', type=int, default=4); p.add_argument('--dtype', choices=['float32','bfloat16'],default='float32'); p.add_argument('--texts'); p.add_argument('--x-vector-only',action='store_true'); p.add_argument('--say-as')
a = p.parse_args()
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
root = pathlib.Path(__file__).resolve().parents[2]; work = pathlib.Path(a.work).resolve(); work.mkdir(parents=True, exist_ok=True)
if work.is_relative_to(root): raise ValueError('Keep model and staging files outside the repo')
manifest = json.loads((root/'public/audio/manifest.json').read_text())
sources = json.loads((root/'scripts/audio/sources.json').read_text())
texts = json.loads(pathlib.Path(a.texts).read_text()) if a.texts else [x['pt'] for t in json.loads((root/'scripts/android/phrasebook.json').read_text()) for x in t['phrases']]
say_as = json.loads(pathlib.Path(a.say_as).read_text()) if a.say_as else {}
model_id = 'Qwen/Qwen3-TTS-12Hz-1.7B-Base' if '1.7' in a.model else 'Qwen/Qwen3-TTS-12Hz-0.6B-Base'
key = lambda t: ' '.join(t.strip().lower().split())
# The three reference recordings are European Portuguese and explicitly CC0.
# Other human recordings are preserved; no user voice or paid API is used.
parts = []; reference = []
for t in ['engenheiro', 'estudante', 'jornalista']:
    src = sources[t]
    if src['license'] != 'CC0' or src['source'] != 'lingua-libre': raise ValueError('Reference licence changed')
    wav = work/(t+'.wav')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'public/audio'/manifest[t]),'-ar','24000','-ac','1',str(wav)], check=True)
    data, sr = sf.read(wav); parts += [data, np.zeros(2400)]; reference.append(src)
sf.write(work/'reference.wav', np.concatenate(parts), 24000)
torch.set_num_threads(a.threads)
model = Qwen3TTSModel.from_pretrained(a.model, device_map='cpu', dtype=getattr(torch,a.dtype), attn_implementation='sdpa')
prompt = model.create_voice_clone_prompt(ref_audio=str(work/'reference.wav'), ref_text='Engenheiro. Estudante. Jornalista.', x_vector_only_mode=a.x_vector_only)
report_path = work/'staged.json'; report = json.loads(report_path.read_text()) if report_path.exists() else {}
for i, t in enumerate(dict.fromkeys(texts)):
    k = key(t)
    if sources.get(k, {}).get('source') == 'lingua-libre': continue
    spoken = say_as.get(t,t)
    name = hashlib.sha1((k+spoken+str(a.x_vector_only)+model_id+'-CC0-PT-reference-v2-speed0.9-'+a.dtype).encode()).hexdigest()[:10]+'.mp3'
    if k in report and (work/name).exists(): continue
    started = time.time(); torch.manual_seed(16)
    wavs, sr = model.generate_voice_clone(text=spoken, language='Portuguese', voice_clone_prompt=prompt, max_new_tokens=400, do_sample=False)
    data = wavs[0]; duration = len(data)/sr
    if not np.isfinite(data).all() or duration < .25 or duration > 25: raise ValueError('Invalid synthesis: '+t)
    sf.write(work/'raw.wav', data, sr)
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(work/'raw.wav'),'-af','silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.06,areverse,atempo=0.9,loudnorm=I=-18:TP=-1.5:LRA=7','-ar','24000','-ac','1','-b:a','64k',str(work/name)],check=True)
    report[k] = {'text':t, 'file':name, 'source':'qwen3-tts-local', 'model':'Qwen/Qwen3-TTS-12Hz-1.7B-Base' if '1.7' in a.model else 'Qwen/Qwen3-TTS-12Hz-0.6B-Base', 'license':'Apache-2.0', 'referenceRecordings':reference, 'language':'Portuguese', 'accentReference':'European Portuguese', 'speed':0.9, 'seed':16, 'sayAs':spoken, 'xVectorOnly':a.x_vector_only, 'dtype':a.dtype, 'generationSeconds':round(time.time()-started,2)}
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f'{i+1}/{len(texts)}: {t} ({duration:.2f}s)', flush=True)
print('Staged',len(report),'clips. Audit before copying files and updating the manifest.',flush=True)
