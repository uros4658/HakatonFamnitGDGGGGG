"use client";
import { useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { Observation, ObservationTag, ALL_TAGS } from "@/lib/observations/schema";
import { saveObservation, getSelectedRoute } from "@/lib/observations/storage";

export default function ObservationsPage() {
  const [observer, setObserver] = useState("");
  const [locationType, setLocationType] = useState<Observation["locationType"]>("artificial_reef");
  const [surveyMethod, setSurveyMethod] = useState<Observation["surveyMethod"]>("dive");
  const [visibility, setVisibility] = useState<Observation["visibility"]>("good");
  const [seaCondition, setSeaCondition] = useState<Observation["seaCondition"]>("calm");
  const [disturbance, setDisturbance] = useState<Observation["disturbanceLevel"]>("none");
  const [tags, setTags] = useState<ObservationTag[]>([]);
  const [growthPlate, setGrowthPlate] = useState<string>("unknown");
  const [waste, setWaste] = useState<Observation["wasteSeverity"]>("none");
  const [damage, setDamage] = useState<Observation["damageSeverity"]>("none");
  const [followUp, setFollowUp] = useState<Observation["followUpNeeded"]>("none");
  const [notes, setNotes] = useState("");
  const [ethics, setEthics] = useState(false);
  const [saved, setSaved] = useState(false);

  function addTag(tag: string) {
    if (tags.find(t => t.tag === tag)) return;
    setTags([...tags, { tag, abundance: "unknown", confidence: "medium" }]);
  }

  function updateTag(idx: number, updates: Partial<ObservationTag>) {
    const updated = [...tags];
    updated[idx] = { ...updated[idx], ...updates };
    setTags(updated);
  }

  function removeTag(idx: number) {
    setTags(tags.filter((_, i) => i !== idx));
  }

  function submit() {
    if (!observer.trim() || !ethics) return;
    const now = new Date();
    const obs: Observation = {
      id: `obs-${Date.now()}`,
      observer,
      date: now.toISOString().split("T")[0],
      month: now.toISOString().slice(0, 7),
      routeId: getSelectedRoute() || undefined,
      locationType,
      surveyMethod,
      visibility,
      seaCondition,
      disturbanceLevel: disturbance,
      tags,
      growthPlateScore: growthPlate as Observation["growthPlateScore"],
      wasteSeverity: waste,
      damageSeverity: damage,
      followUpNeeded: followUp,
      notes: notes || undefined,
      ethicsConfirmed: true,
      createdAt: now.toISOString(),
    };
    saveObservation(obs);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl font-bold text-cyan-300">OK</div>
        <h2 className="text-xl font-bold text-emerald-400">Observation Saved!</h2>
        <p className="text-sm text-slate-400">Your data has been stored locally.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setSaved(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">
            Record another
          </button>
          <a href="/dashboard" className="px-4 py-2 bg-cyan-600 rounded-lg text-sm">View Dashboard</a>
        </div>
        <Badge tags={tags} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-blue-400" size={28} />
        <h1 className="text-2xl font-bold">Record Observation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Observer name">
          <input value={observer} onChange={e => setObserver(e.target.value)} className="input-field w-full" placeholder="Your name" />
        </Field>
        <Field label="Location type">
          <select value={locationType} onChange={e => setLocationType(e.target.value as Observation["locationType"])} className="input-field w-full">
            <option value="artificial_reef">Artificial reef</option>
            <option value="growth_plates">Growth plates</option>
            <option value="seagrass_meadow">Seagrass meadow</option>
            <option value="coastline">Coastline</option>
            <option value="cleanup_area">Cleanup area</option>
          </select>
        </Field>
        <Field label="Survey method">
          <select value={surveyMethod} onChange={e => setSurveyMethod(e.target.value as Observation["surveyMethod"])} className="input-field w-full">
            <option value="snorkel">Snorkel</option>
            <option value="dive">Dive</option>
            <option value="underwater_drone">Underwater drone</option>
            <option value="shore_observation">Shore observation</option>
          </select>
        </Field>
        <Field label="Visibility">
          <select value={visibility} onChange={e => setVisibility(e.target.value as Observation["visibility"])} className="input-field w-full">
            <option value="poor">Poor</option>
            <option value="medium">Medium</option>
            <option value="good">Good</option>
          </select>
        </Field>
        <Field label="Sea condition">
          <select value={seaCondition} onChange={e => setSeaCondition(e.target.value as Observation["seaCondition"])} className="input-field w-full">
            <option value="calm">Calm</option>
            <option value="mild_current">Mild current</option>
            <option value="strong_current">Strong current</option>
          </select>
        </Field>
        <Field label="Disturbance level">
          <select value={disturbance} onChange={e => setDisturbance(e.target.value as Observation["disturbanceLevel"])} className="input-field w-full">
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Species / Habitat Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                tags.find(t => t.tag === tag)
                  ? "bg-cyan-900/50 border-cyan-700 text-cyan-300"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {tag.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className="space-y-2">
            {tags.map((tag, i) => (
              <div key={tag.tag} className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-800">
                <span className="text-xs font-medium text-cyan-300 min-w-[100px]">{tag.tag.replace(/_/g, " ")}</span>
                <select value={tag.abundance} onChange={e => updateTag(i, { abundance: e.target.value as ObservationTag["abundance"] })} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1">
                  <option value="unknown">abundance?</option>
                  <option value="one">one</option>
                  <option value="few">few</option>
                  <option value="many">many</option>
                  <option value="dominant">dominant</option>
                </select>
                <select value={tag.confidence} onChange={e => updateTag(i, { confidence: e.target.value as ObservationTag["confidence"] })} className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1">
                  <option value="low">low conf</option>
                  <option value="medium">med conf</option>
                  <option value="high">high conf</option>
                </select>
                <button onClick={() => removeTag(i)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Growth plate coverage (0-3)">
          <select value={growthPlate} onChange={e => setGrowthPlate(e.target.value)} className="input-field w-full">
            <option value="unknown">Unknown</option>
            <option value="0">0 - no visible growth</option>
            <option value="1">1 - sparse growth</option>
            <option value="2">2 - moderate growth</option>
            <option value="3">3 - dense growth</option>
          </select>
        </Field>
        <Field label="Waste severity">
          <select value={waste} onChange={e => setWaste(e.target.value as Observation["wasteSeverity"])} className="input-field w-full">
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Damage severity">
          <select value={damage} onChange={e => setDamage(e.target.value as Observation["damageSeverity"])} className="input-field w-full">
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Follow-up needed">
          <select value={followUp} onChange={e => setFollowUp(e.target.value as Observation["followUpNeeded"])} className="input-field w-full">
            <option value="none">None</option>
            <option value="expert_review">Expert review</option>
            <option value="cleanup_needed">Cleanup needed</option>
            <option value="damage_inspection">Damage inspection</option>
            <option value="repeat_survey">Repeat survey</option>
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field w-full h-20 resize-none" placeholder="Additional observations..." />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={ethics} onChange={e => setEthics(e.target.checked)} className="rounded" />
        <span className="text-slate-300">I confirm I did not touch, collect, chase, feed, or disturb marine life.</span>
      </label>

      <button
        onClick={submit}
        disabled={!observer.trim() || !ethics}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        Save Observation
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Badge({ tags }: { tags: ObservationTag[] }) {
  const hasGrowthPlate = tags.some(t => t.tag === "artificial_reef_growth");
  const hasWaste = tags.some(t => t.tag === "waste" || t.tag === "plastic" || t.tag === "fishing_line");
  let badge = "Sea Observer";
  if (hasGrowthPlate) badge = "Growth Plate Monitor";
  if (hasWaste) badge = "Cleanup Reporter";

  return (
    <div className="inline-block mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border border-cyan-700">
      <span className="text-xs text-cyan-300 font-medium">{badge}</span>
    </div>
  );
}
