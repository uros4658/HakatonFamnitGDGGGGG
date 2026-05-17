export function RouteCertificate({ certificate, isMinimal, catalogType }: {
  certificate: string;
  isMinimal: boolean;
  catalogType: string | null;
}) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 font-mono text-xs text-slate-300 space-y-1">
      <div>{certificate}</div>
      <div className="text-slate-500">
        Minimality: {isMinimal ? "primitive / minimal" : "composite"}
        {catalogType && ` � Catalog type: ${catalogType}`}
      </div>
    </div>
  );
}
