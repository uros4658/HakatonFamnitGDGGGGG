import { ExternalLink, MapPin } from "lucide-react";
import { SEA_OASIS_LOCATION } from "@/lib/oasis/seaOasisConstants";

export default function OasisLocationCard() {
  const mapsUrl = `https://www.google.com/maps?q=${SEA_OASIS_LOCATION.latitude},${SEA_OASIS_LOCATION.longitude}`;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 text-cyan-300" size={20} />
          <div>
            <h2 className="font-semibold text-slate-50">{SEA_OASIS_LOCATION.name}</h2>
            <p className="text-xs text-slate-400">
              Public map location. Planning route based on public Sea Oasis dimensions and approximate
              local coordinate frame.
            </p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500"
        >
          Open location in Google Maps <ExternalLink size={13} />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
        <Stat label="DMS coordinates" value={SEA_OASIS_LOCATION.dms} />
        <Stat
          label="Decimal coordinates"
          value={`${SEA_OASIS_LOCATION.latitude.toFixed(6)}, ${SEA_OASIS_LOCATION.longitude.toFixed(6)}`}
        />
        <Stat label="Depth" value={`${SEA_OASIS_LOCATION.depthMinM}-${SEA_OASIS_LOCATION.depthMaxM} m`} />
        <Stat label="Structure summit" value={`~${SEA_OASIS_LOCATION.structureSummitDepthM} m`} />
        <Stat
          label="Dimensions"
          value={`${SEA_OASIS_LOCATION.structureLengthM} x ${SEA_OASIS_LOCATION.structureWidthM} m, ${SEA_OASIS_LOCATION.structureHeightM} m high`}
        />
        <Stat label="Growth plates" value={String(SEA_OASIS_LOCATION.growthPlateCount)} />
        <Stat label="Distance from coast" value={`${SEA_OASIS_LOCATION.distanceFromShoreM / 1000} km`} />
        <Stat label="Source" value={SEA_OASIS_LOCATION.sourceLabel} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950/60 p-3">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-100">{value}</div>
    </div>
  );
}
