import { ALL_TAGS } from "@/lib/observations/schema";

const SPECIES_TAGS = ALL_TAGS.filter(t =>
  ["fish", "algae", "bryozoans", "polychaetes", "seahorse", "lobster", "crab", "molluscs", "juvenile_fish", "seagrass", "eggs_larvae", "unknown_organism", "invasive_species", "dead_organism"].includes(t)
);

export function SpeciesTagSelector({ selected, onToggle }: { selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {SPECIES_TAGS.map(tag => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`text-xs px-2 py-1 rounded-lg transition-colors ${selected.includes(tag) ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
        >
          {tag.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
