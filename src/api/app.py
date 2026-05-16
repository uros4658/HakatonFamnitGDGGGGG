from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from phaseguard.paths import OUTPUT_DIR, SAMPLE_DIR, ensure_runtime_dirs
from phaseguard.pipeline import analyze_audio_file, run_sample_demo


ensure_runtime_dirs()

app = FastAPI(title="PhaseGuard", version="0.1.0")
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return _INDEX_HTML


@app.post("/analyze")
async def analyze(request: Request) -> dict:
    filename = request.headers.get("x-filename", "uploaded.wav")
    if not filename.lower().endswith(".wav"):
        raise HTTPException(
            status_code=400,
            detail={"message": "Could not process the audio file. Please use a WAV file."},
        )
    body = await request.body()
    if not body:
        raise HTTPException(
            status_code=400,
            detail={"message": "Could not process the audio file. Please use a WAV file."},
        )
    input_path = OUTPUT_DIR / f"{uuid4().hex[:12]}_{Path(filename).name}"
    try:
        with open(input_path, "wb") as handle:
            handle.write(body)
        return analyze_audio_file(input_path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"message": str(exc)}) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"message": "Could not process the audio file. Please try the sample demo."},
        ) from exc


@app.get("/sample-demo")
def sample_demo() -> dict:
    return run_sample_demo()


@app.get("/sample-audio")
def sample_audio() -> FileResponse:
    from phaseguard.audio import make_sample_audio

    sample_path = SAMPLE_DIR / "phaseguard_sample.wav"
    if not sample_path.exists():
        make_sample_audio(sample_path)
    return FileResponse(sample_path, media_type="audio/wav", filename="phaseguard_sample.wav")


_INDEX_HTML = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PhaseGuard</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f5f7fa; color: #17202a; }
    main { max-width: 1120px; margin: 0 auto; padding: 24px; }
    header { margin-bottom: 18px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 16px 0; }
    button, input::file-selector-button { border: 1px solid #315c7c; background: #1f6f8b; color: white; padding: 9px 12px; border-radius: 6px; cursor: pointer; }
    section { background: white; border: 1px solid #d9e0e7; border-radius: 8px; padding: 16px; margin: 14px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    canvas { width: 100%; height: 220px; border: 1px solid #d9e0e7; border-radius: 6px; background: #fff; }
    audio { width: 100%; }
    pre { overflow: auto; background: #101820; color: #d7f9ff; padding: 12px; border-radius: 6px; }
  </style>
</head>
<body>
<main>
  <header>
    <h1>PhaseGuard</h1>
    <p>Unsupervised detection and suppression of structured underwater acoustic interference.</p>
  </header>
  <section>
    <div class="toolbar">
      <input id="file" type="file" accept=".wav,audio/wav" />
      <button id="upload">Upload underwater audio</button>
      <button id="sample">Run sample demo</button>
    </div>
    <div id="status">Ready.</div>
  </section>
  <div class="grid">
    <section><h2>Original Audio</h2><audio id="original" controls></audio><canvas id="waveOriginal"></canvas></section>
    <section><h2>Cleaned Audio</h2><audio id="cleaned" controls></audio><canvas id="waveCleaned"></canvas></section>
  </div>
  <div class="grid">
    <section><h2>Frequency Spectrum</h2><canvas id="spectrum"></canvas></section>
    <section><h2>Unit Circle</h2><canvas id="circle"></canvas></section>
  </div>
  <section><h2>Result Summary</h2><pre id="summary">{}</pre></section>
</main>
<script>
const statusEl = document.getElementById('status');
document.getElementById('sample').onclick = async () => show(await fetchJson('/sample-demo'));
document.getElementById('upload').onclick = async () => {
  const file = document.getElementById('file').files[0];
  if (!file) { statusEl.textContent = 'Choose a WAV file first.'; return; }
  show(await fetchJson('/analyze', { method: 'POST', body: file, headers: { 'x-filename': file.name, 'content-type': 'audio/wav' } }));
};
async function fetchJson(url, options) {
  statusEl.textContent = 'Processing...';
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}
function show(data) {
  statusEl.textContent = `Detected ${data.analysis.detected_groups.length} phase-cancellation group(s).`;
  document.getElementById('original').src = data.original_audio_url;
  document.getElementById('cleaned').src = data.cleaned_audio_url;
  document.getElementById('summary').textContent = JSON.stringify(data.analysis.detected_groups, null, 2);
  drawWave('waveOriginal', data.waveform_original);
  drawWave('waveCleaned', data.waveform_cleaned);
  drawSpectrum('spectrum', data.spectrum);
  drawCircle('circle', data.unit_circle);
}
function setup(id) {
  const c = document.getElementById(id), dpr = window.devicePixelRatio || 1;
  c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr); ctx.clearRect(0,0,c.clientWidth,c.clientHeight); return [c, ctx];
}
function drawWave(id, data) {
  const [c, ctx] = setup(id), w = c.clientWidth, h = c.clientHeight, mid = h/2;
  ctx.strokeStyle = '#1f6f8b'; ctx.beginPath();
  data.forEach((p, i) => { const x = i / Math.max(1, data.length-1) * w, y = mid - p.value * mid * .86; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); });
  ctx.stroke();
}
function drawSpectrum(id, data) {
  const [c, ctx] = setup(id), w = c.clientWidth, h = c.clientHeight;
  const bar = w / Math.max(1, data.length);
  data.forEach((p, i) => { ctx.fillStyle = p.detected ? '#d44f2f' : '#2f7a55'; ctx.fillRect(i*bar, h - p.amplitude*h, Math.max(1, bar), p.amplitude*h); });
}
function drawCircle(id, data) {
  const [c, ctx] = setup(id), w = c.clientWidth, h = c.clientHeight, r = Math.min(w,h)*.38, cx=w/2, cy=h/2;
  ctx.strokeStyle='#a9b8c6'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  data.forEach(p => { ctx.fillStyle = p.detected ? '#d44f2f' : '#1f6f8b'; ctx.beginPath(); ctx.arc(cx+p.x*r, cy-p.y*r, p.detected ? 5 : 3, 0, Math.PI*2); ctx.fill(); });
}
</script>
</body>
</html>
"""
