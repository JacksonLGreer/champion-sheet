import TypeBadge from "../TypeBadge";
import StatBar from "../StatBar";
import { PokemonSet } from "../../Constants/PokemonInterface";
import { STAT_COLORS, STAT_LABELS } from "../../Constants/STAT_CONSTANTS";

export default function PokemonExpandedDetails({ pokemon }: { pokemon: PokemonSet }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #13132a 0%, #0a0a18 100%)",
      border: "1px solid #252545",
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* dot-grid texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "14px 14px", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 0", position: "relative" }}>
        <img src={pokemon.pokemon.sprite} alt={pokemon.pokemon.name} style={{ width: 64, height: 64, imageRendering: "pixelated", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.7))" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 900, color: "#ffe066", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: "0 1px 0 #7a5a00" }}>
            {pokemon.pokemon.name}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
            {pokemon.pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6666aa", marginTop: 4 }}>
            {pokemon.nature} · {pokemon.ability}
          </div>
        </div>
        {/* Item */}
        <div style={{ background: "#0a0a1e", border: "1px solid #2a2a4e", borderRadius: 6, padding: "4px 8px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace", letterSpacing: "0.06em" }}>ITEM</div>
          <div style={{ fontSize: 9, color: "#aaaacc", fontFamily: "'Courier New', monospace", fontWeight: 700, marginTop: 1, maxWidth: 70, lineHeight: 1.3 }}>{pokemon.item}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin: "8px 12px", height: 1, background: "linear-gradient(to right, #ffe06622, #2a2a4e, transparent)" }} />

      {/* Moves + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px 10px" }}>
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Moves</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {pokemon.moves.map((m, i) => (
              <div key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#aaaacc", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#ffe06666", fontSize: 8 }}>▸</span>
                {m}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Base Stats</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(["hp", "atk", "def", "spa", "spd", "spe"] as const).map(s => (
              <StatBar key={s} stat={s} value={pokemon.pokemon.baseStats[s]} />
            ))}
          </div>
        </div>
      </div>

      {/* EVs */}
      <div style={{ borderTop: "1px solid #16163a", padding: "6px 12px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>EVs</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["hp", "atk", "def", "spa", "spd", "spe"] as const).map(s =>
            pokemon.evs[s] > 0 ? (
              <div key={s} style={{ background: "#0a0a1e", border: "1px solid #1e1e3a", borderRadius: 4, padding: "2px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: STAT_COLORS[s], fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{STAT_LABELS[s]}</div>
                <div style={{ fontSize: 8, color: "#6666aa", fontFamily: "'Courier New', monospace" }}>{pokemon.evs[s]}</div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}