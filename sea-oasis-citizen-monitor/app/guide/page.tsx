import { BookOpen, AlertTriangle } from "lucide-react";

const GROUPS = [
  { name: "Fish", lookFor: "Schools, individuals near reef structure, juveniles in sheltered areas", photo: "Side-on from 1-2m distance, no flash, avoid chasing", dontDo: "Do not chase, corner, or feed fish", why: "Fish diversity and abundance indicate reef health" },
  { name: "Algae", lookFor: "Coverage on surfaces, color (green/brown/red), turf vs macro algae", photo: "Close-up of surface coverage, include scale reference if possible", dontDo: "Do not scrape or remove algae samples", why: "Algae balance indicates nutrient levels and grazing pressure" },
  { name: "Bryozoans", lookFor: "Encrusting colonies on hard surfaces, fan or sheet shapes", photo: "Close-up showing colony structure and extent", dontDo: "Do not touch - colonies are fragile", why: "Bryozoan presence indicates good water quality and substrate stability" },
  { name: "Polychaetes", lookFor: "Tube structures, fan worms, visible feeding appendages", photo: "Photograph tubes/fans without disturbing sediment", dontDo: "Do not disturb surrounding sediment", why: "Polychaetes are key indicators of substrate colonization progress" },
  { name: "Seahorse", lookFor: "Attached to seagrass or structures, camouflaged, very still", photo: "From distance, no flash, minimal time near animal", dontDo: "Never touch, approach closely, or use flash. Protected species.", why: "Seahorse presence indicates high habitat quality. They are extremely sensitive to disturbance" },
  { name: "Lobster", lookFor: "In crevices and under overhangs, nocturnal - look in shadows", photo: "Photograph from outside crevice, do not reach in", dontDo: "Do not reach into crevices or attempt to lure out", why: "Lobster presence indicates mature reef with adequate shelter" },
  { name: "Seagrass", lookFor: "Meadow density, blade length, epiphyte load, bare patches", photo: "Wide shot showing meadow extent, close-up of blade condition", dontDo: "Do not drag equipment through seagrass", why: "Seagrass meadows are critical nursery habitat and carbon sinks" },
  { name: "Artificial reef growth", lookFor: "Coverage percentage on growth plates, species composition on surfaces", photo: "Standard angles: front, top, sides of each growth plate", dontDo: "Do not scrape or clean growth plates", why: "Tracks colonization progress and reef development over time" },
  { name: "Waste", lookFor: "Plastic, fishing line, metal, glass, abandoned gear", photo: "Document type, size, location relative to reef", dontDo: "Only collect if safe and not entangled with organisms", why: "Waste mapping enables targeted cleanup and prevention" },
  { name: "Damage", lookFor: "Broken structures, anchor scars, dislodged elements, bleaching", photo: "Show extent and context of damage", dontDo: "Do not attempt repairs - report for expert assessment", why: "Damage documentation helps prioritize maintenance and identify causes" },
  { name: "Unknown organism", lookFor: "Anything you cannot identify confidently", photo: "Multiple angles, show size relative to known object", dontDo: "Do not touch or collect. Mark for expert review.", why: "Could be rare, invasive, or indicator species - expert ID needed" },
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-purple-400" size={28} />
        <h1 className="text-2xl font-bold">Species & Habitat Guide</h1>
      </div>

      <section className="p-4 rounded-xl border border-amber-800 bg-amber-900/20">
        <h2 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> Responsible Observation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          <div>Keep minimum distance - do not approach marine life</div>
          <div>Never touch, move, or collect organisms</div>
          <div>Avoid stirring sediment - maintain buoyancy</div>
          <div>Do not use flash if it disturbs animals</div>
          <div>Do not chase, corner, or feed any species</div>
          <div>Report - do not attempt to fix damage yourself</div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Why Repeatable Photos Matter</h2>
        <p className="text-sm text-slate-400">
          Consistent photo angles, positions, and timing make observations comparable across months.
          This lets researchers detect real changes rather than variation from inconsistent methods.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Annotation Groups</h2>
        <p className="text-xs text-slate-500 mb-2">
          These are observation groups, not guaranteed species identifications. Expert verification is needed for scientific use.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GROUPS.map(g => (
            <div key={g.name} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <h3 className="font-semibold text-cyan-300">{g.name}</h3>
              <div className="text-xs space-y-1.5">
                <div><span className="text-slate-500">Look for:</span> <span className="text-slate-300">{g.lookFor}</span></div>
                <div><span className="text-slate-500">How to photo:</span> <span className="text-slate-300">{g.photo}</span></div>
                <div className="text-red-400"><span className="font-medium">Do NOT:</span> {g.dontDo}</div>
                <div><span className="text-slate-500">Why it matters:</span> <span className="text-slate-400">{g.why}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What to Do If You See Waste or Damage</h2>
        <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
          <li>Document with photos (location, type, extent)</li>
          <li>Record in observation form with severity rating</li>
          <li>Mark follow-up as &quot;cleanup needed&quot; or &quot;damage inspection&quot;</li>
          <li>Only collect loose waste if safe and not entangled with organisms</li>
          <li>Never attempt structural repairs - report for expert assessment</li>
        </ol>
      </section>
    </div>
  );
}
