import { Card } from "./Card";

// Mostra um número grande com rótulo (ex.: Acurácia 0,91)
export const MetricBig = ({ label, value }) => (
  <Card className="h-full">
    <div className="text-zinc-400 text-sm">{label}</div>
    <div className="mt-2 text-5xl font-bold tracking-tight">{value}</div>
  </Card>
);