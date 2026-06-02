import { PokemonSet } from "../../Constants/PokemonInterface";
import {Team} from "../../Constants/TeamInterface";

const SLOT_KEYS = ["pokemon1", "pokemon2", "pokemon3", "pokemon4", "pokemon5", "pokemon6"] as const;


export default function TeamSidebar(
    { team, active, setSelectedTeamId }: 
    { team: any, active: boolean, setSelectedTeamId: 
        (id: string) => void }) {

            const slots = SLOT_KEYS.map(k => team[k] as PokemonSet | null);

    return (
        
        <button key={team.id} onClick={() => setSelectedTeamId(team.id)} style={{
                    width: "100%", background: active ? "linear-gradient(90deg, #1e1e4a, #14142e)" : "none",
                    border: "none", borderLeft: active ? "3px solid #ffe066" : "3px solid transparent",
                    borderBottom: "1px solid #12122a", padding: "12px 12px 12px 14px",
                    cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    {/* 2×3 mini sprite grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                      {slots.map((p, i) =>
                        p ? (
                          <img key={`${team.id}-${p.id}`} src={p.pokemon.sprite} alt={p.pokemon.name} style={{ width: 36, height: 36, imageRendering: "pixelated", opacity: active ? 1 : 0.55, filter: active ? "none" : "grayscale(40%)" }} />
                        ) : (
                          <div key={`${team.id}-empty-${i}`} style={{ width: 36, height: 36, border: "1px dashed #1e1e3a", borderRadius: 4, opacity: 0.3 }} />
                        )
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 900, color: active ? "#ffe066" : "#6666aa", letterSpacing: "0.08em", textTransform: "uppercase" }}>{team.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
                        <span style={{ fontSize: 8, color: active ? "#4a9eda" : "#2a2a4a", fontFamily: "'Courier New', monospace", background: active ? "#0a1a3a" : "#0d0d1a", border: "1px solid #1a2a4a", borderRadius: 3, padding: "1px 5px", letterSpacing: "0.06em" }}>{team.format}</span>
                        <span style={{ fontSize: 8, color: "#33334a", fontFamily: "'Courier New', monospace" }}>{team.createdAt}</span>
                      </div>
                    </div>
                  </button>
    )
} 

