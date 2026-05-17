import { Camera } from "lucide-react";

const PHOTO_COLORS: Record<string, string> = {
  front: "from-cyan-900 to-blue-900",
  back: "from-blue-900 to-indigo-900",
  top: "from-teal-900 to-cyan-900",
  left: "from-emerald-900 to-teal-900",
  right: "from-indigo-900 to-violet-900",
  lower: "from-slate-900 to-gray-900",
  gp1: "from-green-900 to-emerald-900",
  gp2: "from-green-900 to-teal-900",
  gp3: "from-teal-900 to-green-900",
  gp4: "from-emerald-900 to-cyan-900",
  gp5: "from-cyan-900 to-green-900",
  seabed: "from-amber-900 to-yellow-900",
  wide: "from-sky-900 to-blue-900",
  waste: "from-red-900 to-orange-900",
  unusual: "from-purple-900 to-violet-900",
};

export function PhotoPlaceholder({ itemId, filename, note }: { itemId: string; filename?: string; note?: string }) {
  const gradient = PHOTO_COLORS[itemId] || "from-slate-900 to-gray-900";

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gradient-to-br ${gradient} aspect-[4/3] flex flex-col items-center justify-center p-3`}>
      <Camera size={24} className="text-slate-500 mb-2" />
      {filename ? (
        <span className="text-[10px] font-mono text-slate-400 text-center break-all">{filename}</span>
      ) : (
        <span className="text-[10px] text-slate-500">No photo</span>
      )}
      {note && (
        <span className="text-[9px] text-slate-500 mt-1 text-center line-clamp-2">{note}</span>
      )}
      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-slate-400">
        DEMO
      </div>
    </div>
  );
}

export function PhotoGrid({ items }: { items: Array<{ id: string; photoPlaceholder?: string; note?: string; status: string }> }) {
  const captured = items.filter(i => i.status === "captured" && i.photoPlaceholder);
  if (captured.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {captured.map(item => (
        <PhotoPlaceholder key={item.id} itemId={item.id} filename={item.photoPlaceholder} note={item.note} />
      ))}
    </div>
  );
}
