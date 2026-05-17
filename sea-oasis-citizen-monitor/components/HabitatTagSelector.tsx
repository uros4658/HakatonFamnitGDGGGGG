import { ALL_TAGS } from "@/lib/observations/schema";

const HABITAT_TAGS = ALL_TAGS.filter(t =>
  ["artificial_reef_growth", "waste", "fishing_line", "plastic", "anchor_damage", "broken_structure", "unusual_behaviour"].includes(t)
);

export function HabitatTagSelector({ selected, onToggle }: { selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {HABITAT_TAGS.map(tag => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`text-xs px-2 py-1 rounded-lg transition-colors ${selected.includes(tag) ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
        >
          {tag.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
