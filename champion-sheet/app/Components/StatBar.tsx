import { STAT_COLORS, STAT_LABELS } from "../Constants/STAT_CONSTANTS";

export default function StatBar({ stat, value, max = 255 }: { stat: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: STAT_COLORS[stat], width: 30, fontWeight: 700, letterSpacing: "0.05em" }}>{STAT_LABELS[stat]}</span>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#8888bb", width: 28, textAlign: "right" }}>{value}</span>
      <div style={{ flex: 1, height: 4, background: "#0d0d1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: STAT_COLORS[stat], borderRadius: 2, opacity: 0.85 }} />
      </div>
    </div>
  );
}