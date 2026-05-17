import { Pause, Play, RotateCcw } from "lucide-react";

export default function RoutePlaybackControls({
  playing,
  progress,
  speed,
  onToggle,
  onRestart,
  onProgressChange,
  onSpeedChange,
}: {
  playing: boolean;
  progress: number;
  speed: number;
  onToggle: () => void;
  onRestart: () => void;
  onProgressChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
      <button
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-500"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        onClick={onRestart}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
        title="Restart"
      >
        <RotateCcw size={16} />
      </button>
      <input
        aria-label="Route playback progress"
        type="range"
        min={0}
        max={1000}
        value={Math.round(progress * 1000)}
        onChange={(event) => onProgressChange(Number(event.target.value) / 1000)}
        className="min-w-48 flex-1"
      />
      <div className="flex rounded-lg bg-slate-800 p-1">
        {[0.5, 1, 2].map((value) => (
          <button
            key={value}
            onClick={() => onSpeedChange(value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              speed === value ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            {value}x
          </button>
        ))}
      </div>
    </div>
  );
}

