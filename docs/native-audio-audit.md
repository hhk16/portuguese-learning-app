# Local speech audit — 4 October 2026

All 1,899 existing manifest entries were decoded locally with ffmpeg. None had decode failures, a peak below 0.03, excessive clipping, leading silence over 0.7 seconds or trailing silence over 1 second. These are technical checks, not a claim that every recording sounds natural. A deterministic sample of 25 existing utterances was transcribed with Whisper small on the CPU. Some short phrases transcribed poorly.

Qwen3-TTS-12Hz Base 0.6B and 1.7B were evaluated locally, including alternative reference conditioning and an explicit European Portuguese Piper fallback. No paid API or hosted speech service was used. Qwen's models are Apache-2.0. Three CC0 Lingua Libre recordings by European Portuguese speaker Waldyrious (engenheiro, estudante, jornalista) condition the voice. Model weights stay outside the repository and APK. Per-file model, reference, seed and synthesis settings are in `scripts/audio/sources.json`.

The final selection contains **50 new Qwen clips**: **43** for the new phrasebook and **7** replacements for older clips that transcribed worse. Two human recordings complete the **45-phrase** book. The seven older replacements are Boa sorte!, ela dorme, eles perdem, Este autocarro passa pela minha rua., eu quero, Hoje faço anos! and o blazer preto. All selected clips pass the technical checks and match their expected text under case, punctuation, hyphen and diacritic-insensitive ASR comparison. The original 48 human recordings are preserved. Most older speech remains Piper; this is a tested incremental replacement, not a complete revoice of the course.

Candidates with mismatches were not blindly promoted. Three phrasebook entries (asking the train departure time, a headache phrase and locating a pharmacy) were withheld after unsuccessful comparisons. The introduction uses the validated O meu nome é Ana. The 45 retained phrases include situations, translations and usage tips. Recogniser failures do not prove a recording is wrong: reduced vowels and linked words in European Portuguese can confuse ASR. Likewise a correct transcription does not establish a pleasant voice or a fully correct regional accent. Human listening through the owner's TV speakers is still required. There is no supported claim that one model is universally the best.

Speech is mono MP3, normally 24 kHz/64 kbps for Qwen, with consistent -18 LUFS target and -1.5 dB true peak limit. Qwen playback is slowed to 90% in the exported recordings; the phrasebook offers an additional pitch-preserving Slow control. ASR selection evidence is retained in `docs/native-audio-audit.json`.

## Reproduce

Create a CPU PyTorch virtual environment outside the repo, then install `qwen-tts==0.1.1`, soundfile, numpy and huggingface_hub. ffmpeg must be installed. Download the Qwen Base checkpoint to an external model directory. To stage new candidates:

```sh
python scripts/audio/render-local-qwen.py --model /absolute/path/to/model-1.7b --work /absolute/path/to/staging --dtype bfloat16
python scripts/audio/audit-local.py --staged /absolute/path/to/staging --output /absolute/path/to/audit.json --asr
```

Whisper transcription requires `faster-whisper`; `--asr-model` chooses the recogniser. The default is small. Audit output is informational; selection requires review, and the renderer never promotes candidates automatically. The existing incremental renderer preserves audited local replacements unless `--force` is explicitly requested. `collect.ts` includes the native phrasebook so ordinary rebuilds do not orphan its speech.
