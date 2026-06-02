import Image from "next/image";
import { TYPE_COLORS } from "../../Constants/TYPE_COLORS";
import TypeBadge from "../TypeBadge";

interface PokemonSet {
  id: string;
  pokemonName: string;
  sprite: string;
  moves: string[];
  nature: string;
  item: string;
  ability: string;
  evSpread: string;
  types: string[];
  teamName?: string;
}

export default function PokemonSetDetails( { set }: { set: PokemonSet }) {
      const c = TYPE_COLORS[set.types[1]] ?? TYPE_COLORS.normal;

    return (
       
    <div style={{
      background: "linear-gradient(160deg, #13132a, #0a0a18)",
      border: `1px solid ${c.bg}`,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* color accent top strip */}
      <div style={{ height: 3, background: c.text, opacity: 0.4 }} />
      <div style={{ padding: "10px 12px 12px" }}>
        {/* Top: sprite + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <img src={set.sprite} alt={set.pokemonName} style={{ width: 48, height: 48, imageRendering: "pixelated", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.7))" }} />
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 1, color: "#ffe066", letterSpacing: "0.08em", textTransform: "uppercase" }}>{set.pokemonName}</div>
            <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
              {set.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        {/* Moves */}
        <div style={{ marginBottom: 8}}>
          <div style={{ fontFamily: "'Courier New', monospace", padding: "0px 10px",fontSize: 7, color: "#33335a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Moves</div>
          <div style={{ display: "grid", padding: "0px 20px", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
            {set.moves.map((m, i) => (
              <div key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#9999cc", display: "flex", gap: 4 }}>
                <span style={{ color: c.text, opacity: 0.5, fontSize: 7 }}>▸</span>{m}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Item and Nature */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {[set.nature, set.item].map((tag, i) => (
            <span key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#8888bb", background: "#0d0d1e", border: "1px solid #1e1e3a", borderRadius: 3, padding: "2px 6px", letterSpacing: "0.06em" }}>{tag}</span>
          ))}
        </div>

        

        {/* EV Spread */}
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#44445a", letterSpacing: "0.04em", borderTop: "1px solid #16163a", paddingTop: 6 }}>
          Stat Points: {set.evSpread}
        </div>

        {/* Team tag */}
        {set.teamName && (
          <div style={{ marginTop: 4, fontFamily: "'Courier New', monospace", fontSize: 7, color: c.text, opacity: 0.6, letterSpacing: "0.06em" }}>
            ◈ {set.teamName}
          </div>
        )}
      </div>
    </div>

    )
} 

