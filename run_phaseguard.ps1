$ErrorActionPreference = "Stop"
$env:PYTHONPATH = "src"
& "C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" -m uvicorn api.app:app --host 127.0.0.1 --port 8000
