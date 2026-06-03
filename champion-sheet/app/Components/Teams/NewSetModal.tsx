"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../Services/supabase/supabase-client";
import TypeBadge from "../TypeBadge";
import { STAT_COLORS, STAT_LABELS } from "../../Constants/STAT_CONSTANTS";
import { getAllPokemon, Pokemon } from "../../Services/pokemon-service";

const NATURES = [
  "Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile",
  "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild",
  "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed",
  "Sassy", "Serious", "Timid",
];

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"] as const;


interface NewSetModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const BASE_STAT_KEYS: Record<string, string> = {
  hp: "hp", atk: "attack", def: "defense", spa: "special_attack", spd: "special_defense", spe: "speed",
};

export default function NewSetModal({ onClose, onSaved }: NewSetModalProps) {
  const supabase = createClient();

  // ── Pokémon ──────────────────────────────────────────────────────────────
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);


  // ── Set fields ───────────────────────────────────────────────────────────
  const [abilitySearch, setAbilitySearch] = useState("");
  const [showAbilityDropdown, setShowAbilityDropdown] = useState(false);
  const [moveSearches, setMoveSearches] = useState(["", "", "", ""]);
  const [showMoveDropdown, setShowMoveDropdown] = useState([false, false, false, false]);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<(string | null)[]>([null, null, null, null]);
  const [nature, setNature] = useState("Hardy");
  const [item, setItem] = useState("");
  const [evs, setEvs] = useState({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  

  const sprite = selectedPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.pokedexNum}.png`
    : null;

  // ── Load data ─────────────────────────────────────────────────────────────────
  // Load all pokemon once on mount:
  useEffect(() => {
    getAllPokemon().then(setAllPokemon).catch(console.error);
     async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
    }
  }
  loadUser();
  }, []);

  // ── Reset ability/moves when pokemon changes ─────────────────────────────
  useEffect(() => {
    setSelectedAbility(null);
    setAbilitySearch("");
    setSelectedMoves([null, null, null, null]);
    setMoveSearches(["", "", "", ""]);
  }, [selectedPokemon]);

  // Filter locally — no more Supabase search call needed:
  const filteredPokemon = search.length < 2
    ? []
    : allPokemon.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 12);
  const filteredAbilities = (selectedPokemon?.abilities ?? [] as Array<{id: number; name: string}>)
    .filter((a: {id: number; name: string}) => a.name.toLowerCase().includes(abilitySearch.toLowerCase()))
    .slice(0, 8);
  const filteredMoves = (i: number) => (selectedPokemon?.moves ?? [] as Array<{id: number; name: string}>)
    .filter((m: {id: number; name: string}) => m.name.toLowerCase().includes(moveSearches[i].toLowerCase()))
    .map(m => m.name)
    .slice(0, 8);
  const allMoves = (selectedPokemon?.moves ?? [] as Array<{id: number; name: string}>).map(m => m.name);
  const evTotal = Object.values(evs).reduce((a, b) => a + b, 0);
 

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!selectedPokemon || !selectedAbility || selectedMoves.some(m => m === null) || !item) {
      setError("Please fill in all fields."); return;
    }
    setSaving(true); setError(null);

    // Look up IDs from DB by name
    const [{ data: abilityData }, { data: moveData }] = await Promise.all([
      supabase.from("abilities").select("id").eq("name", selectedAbility).single(),
      supabase.from("moves").select("id, name").in("name", selectedMoves as string[]),
    ]);

    if (!abilityData || !moveData) {
      setError("Could not resolve ability or move IDs."); setSaving(false); return;
    }

    const moveIdMap = Object.fromEntries(moveData.map((m: { id: number; name: string }) => [m.name, m.id]));

    const { error: saveError } = await supabase.from("pokemon_sets").insert({
      pokemon_id: selectedPokemon.id,
      trainer_id: userId,
      ability: abilityData.id,
      move1: moveIdMap[selectedMoves[0]!],
      move2: moveIdMap[selectedMoves[1]!],
      move3: moveIdMap[selectedMoves[2]!],
      move4: moveIdMap[selectedMoves[3]!],
      nature,
      item,
      hp_ev: evs.hp, atk_ev: evs.atk, def_ev: evs.def,
      spa_ev: evs.spa, spd_ev: evs.spd, spe_ev: evs.spe,
    });

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    onSaved(); onClose();
  }
  // ── Shared input style ───────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: "100%", background: "#06060f", border: "1px solid #2a2a4e",
    borderRadius: 4, color: "#cccce0", fontFamily: "'Courier New', monospace",
    fontSize: 10, padding: "5px 7px", outline: "none",
    boxSizing: "border-box", letterSpacing: "0.04em",
  };
  const lbl: React.CSSProperties = {
    fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a",
    letterSpacing: "0.16em", textTransform: "uppercase", display: "block", marginBottom: 3,
  };
  const ddWrap: React.CSSProperties = {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 99,
    background: "#0d0d1e", border: "1px solid #2a2a4e", borderRadius: 4,
    marginTop: 2, maxHeight: 160, overflowY: "auto",
  };
  const ddItem = (active: boolean): React.CSSProperties => ({
    padding: "5px 8px", cursor: "pointer",
    fontFamily: "'Courier New', monospace", fontSize: 10,
    color: active ? "#ffe066" : "#aaaacc",
    background: active ? "#1a1a3a" : "transparent",
  });

  const statBarMax: Record<string, number> = { hp: 255, atk: 165, def: 230, spa: 165, spd: 230, spe: 200 };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 40, backdropFilter: "blur(3px)" }} />

      {/* Modal shell */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "min(60vw)", maxHeight: "92vh", overflowY: "auto",
        background: "#0e0e20", border: "1px solid #2e2e52",
        borderRadius: 8, zIndex: 50, fontFamily: "'Courier New', monospace",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
      }}>

        {/* ── Title bar ── */}
        <div style={{ background: "linear-gradient(90deg,#1a1a38,#12122a)", borderBottom: "1px solid #2a2a4e", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#ffe066", letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 1px 0 #7a5a00" }}>New Pokémon Set</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? "#0d0d1e" : "#1a3a1a", border: "1px solid #2a5a2a", borderRadius: 3, color: saving ? "#33334a" : "#66ee66", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "✓ Save"}
            </button>
            <button onClick={onClose} style={{ background: "#1a1a2e", border: "1px solid #3a2a2a", borderRadius: 3, color: "#aa6666", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* ── Top panel (mirrors the card UI in the screenshot) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr", borderBottom: "1px solid #1a1a32", background: "#0b0b1a" }}>

          {/* Sprite column */}
          <div style={{ borderRight: "1px solid #1a1a32", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 8px", gap: 6, minHeight: 130 }}>
            <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#06060f", borderRadius: 6, border: "1px solid #1a1a32" }}>
              {sprite
                ? <img src={sprite} alt={selectedPokemon?.name} style={{ width: 72, height: 72, imageRendering: "pixelated", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))" }} />
                : <span style={{ fontSize: 28, opacity: 0.15 }}>?</span>
              }
            </div>
            <div style={{ width: "100%", position: "relative" }}>
              <label style={lbl}>Pokémon</label>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedPokemon(null); setShowDropdown(true); }}
                onFocus={() => filteredPokemon.length > 0 && setShowDropdown(true)}
                placeholder="Search…"
                style={{ ...inp, fontSize: 9 }}
              />
              {showDropdown && filteredPokemon.length > 0 && (
                <div style={ddWrap}>
                  {filteredPokemon.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPokemon(p); setSearch(p.name); setShowDropdown(false); }}
                      style={ddItem(selectedPokemon?.id === p.id)}
                    >
                      <span style={{ marginRight: 6, color: "#44445a" }}>#{p.pokedexNum}</span>{p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedPokemon?.types && (
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                <TypeBadge type={selectedPokemon.types.type1} />
                {selectedPokemon.types.type2 && <TypeBadge type={selectedPokemon.types.type2} />}
              </div>
            )}
          </div>

          {/* Item + Ability + Nature column */}
          <div style={{ borderRight: "1px solid #1a1a32", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ffe066", letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid #1a1a32", paddingBottom: 4, marginBottom: 2 }}>Details</div>

            <div>
              <label style={lbl}>Nature</label>
              <select value={nature} onChange={e => setNature(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label style={lbl}>Item</label>
              <input value={item} onChange={e => setItem(e.target.value)} placeholder="e.g. Leftovers" style={inp} />
            </div>

            <div style={{ position: "relative" }}>
              <label style={lbl}>Ability</label>
              <input
                value={abilitySearch}
                onChange={e => { setAbilitySearch(e.target.value); setSelectedAbility(null); setShowAbilityDropdown(true); }}
                onFocus={() => setShowAbilityDropdown(true)}
                placeholder="Search…"
                style={{ ...inp, borderColor: selectedAbility ? "#4a9eda" : "#2a2a4e" }}
              />
              {showAbilityDropdown && filteredAbilities.length > 0 && (
                <div style={ddWrap}>
                  {filteredAbilities.map(a => (
                    <div key={a.id} onClick={() => { setSelectedAbility(a.name); setAbilitySearch(a.name); setShowAbilityDropdown(false); }} style={ddItem(selectedAbility === a.name)}>
                      {a.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Moves column */}
          <div style={{ borderRight: "1px solid #1a1a32", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ffe066", letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid #1a1a32", paddingBottom: 4, marginBottom: 2 }}>Moves</div>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ position: "relative" }}>
                <input
                  value={moveSearches[i]}
                  placeholder={`Move ${i + 1}…`}
                  onChange={e => {
                    const s = [...moveSearches]; s[i] = e.target.value; setMoveSearches(s);
                    const ids = [...selectedMoves]; ids[i] = null; setSelectedMoves(ids);
                    const show = [...showMoveDropdown]; show[i] = true; setShowMoveDropdown(show);
                  }}
                  onFocus={() => { const show = [...showMoveDropdown]; show[i] = true; setShowMoveDropdown(show); }}
                  style={{ ...inp, borderColor: selectedMoves[i] ? "#4a9eda" : "#2a2a4e" }}
                />
                {showMoveDropdown[i] && filteredMoves(i).length > 0 && !selectedMoves[i] && (
                  <div style={ddWrap}>
                    {filteredMoves(i).map(m => (
                      <div key={m} onClick={() => {
                        const ids = [...selectedMoves]; ids[i] = m; setSelectedMoves(ids);
                        const s = [...moveSearches]; s[i] = m; setMoveSearches(s);
                        const show = [...showMoveDropdown]; show[i] = false; setShowMoveDropdown(show);
                      }} style={ddItem(selectedMoves[i] === m)}>
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Base Stats column */}
          <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ffe066", letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid #1a1a32", paddingBottom: 4, marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
              <span>Stats</span><span style={{ color: "#44445a" }}>EV</span>
            </div>
            {STAT_KEYS.map(s => {
              const base = selectedPokemon?.pokemon_stats
                ? (selectedPokemon.pokemon_stats as any)[BASE_STAT_KEYS[s]] ?? 0
                : 0;
              const pct = Math.round((base / (statBarMax[s] ?? 255)) * 100);
              return (
                <div key={s} style={{ display: "grid", gridTemplateColumns: "28px 1fr 36px", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 8, color: STAT_COLORS[s], fontWeight: 700, letterSpacing: "0.06em" }}>{STAT_LABELS[s]}</span>
                  <div style={{ height: 5, background: "#06060f", borderRadius: 3, overflow: "hidden", border: "1px solid #1a1a32" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: STAT_COLORS[s], opacity: 0.8, borderRadius: 3 }} />
                  </div>
                  <input
                    type="number" min={0} max={252} value={evs[s]}
                    onChange={e => setEvs(prev => ({ ...prev, [s]: Math.min(252, Math.max(0, Number(e.target.value))) }))}
                    style={{ ...inp, padding: "2px 4px", textAlign: "center", fontSize: 9, width: 36 }}
                  />
                </div>
              );
            })}
            <div style={{ marginTop: 4, fontSize: 8, color: evTotal > 66 ? "#cc4444" : "#44445a", letterSpacing: "0.06em", textAlign: "right" }}>
              {evTotal} / 66
            </div>
          </div>
        </div>

        {/* ── Move list browser ── */}
        <div style={{ padding: "8px 12px 4px", borderBottom: "1px solid #1a1a32", background: "#09091a" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 60px 48px 48px 36px", gap: 0 }}>
            {["Name", "Type", "Cat", "Pow", "Acc", "PP"].map(h => (
              <div key={h} style={{ fontSize: 8, color: "#44445a", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 6px", borderBottom: "1px solid #1a1a32", fontWeight: 700 }}>{h}</div>
            ))}
          </div>
        </div>

        {/* Move rows — filtered by whatever move slot is focused */}
        <div style={{ maxHeight: 260, overflowY: "auto", background: "#08081a" }}>
          {!selectedPokemon ? (
            <div style={{ padding: 20, textAlign: "center", color: "#2a2a4a", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.1em" }}>
              Select a Pokémon to see its moves
            </div>
          ) : allMoves.filter((m: string) => {
            const activeSearch = moveSearches.find(s => s.length > 0) ?? "";
            return activeSearch.length < 2 || m.toLowerCase().includes(activeSearch.toLowerCase());
          }).slice(0, 40).map((m: string, idx: number) => (
            <div
              key={idx}
              onClick={() => {
                const activeSlot = showMoveDropdown.findIndex(v => v);
                const emptySlot = selectedMoves.findIndex(s => s === null);
                const target = activeSlot >= 0 ? activeSlot : emptySlot >= 0 ? emptySlot : 0;
                const ids = [...selectedMoves]; ids[target] = m; setSelectedMoves(ids);
                const s = [...moveSearches]; s[target] = m; setMoveSearches(s);
                const show = [...showMoveDropdown]; show[target] = false; setShowMoveDropdown(show);
              }}
              style={{
                display: "grid", gridTemplateColumns: "2fr 80px 60px 48px 48px 36px",
                background: idx % 2 === 0 ? "#08081a" : "#0a0a1e",
                borderBottom: "1px solid #10101e", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#14143a")}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#08081a" : "#0a0a1e")}
            >
              <div style={{ padding: "5px 6px", fontSize: 10, color: selectedMoves.includes(m) ? "#ffe066" : "#aaaacc", fontFamily: "'Courier New', monospace" }}>
                {selectedMoves.includes(m) && <span style={{ color: "#ffe06688", marginRight: 4 }}>✓</span>}
                {m}
              </div>
              {["—", "—", "—", "—", "—"].map((v, ci) => (
                <div key={ci} style={{ padding: "5px 6px", fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace" }}>{v}</div>
              ))}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: "6px 12px", background: "#1a0808", borderTop: "1px solid #3a1a1a", fontSize: 10, color: "#cc4444", fontFamily: "'Courier New', monospace", letterSpacing: "0.06em" }}>
            ⚠ {error}
          </div>
        )}

        <style>{`
          input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
          select option { background: #0d0d1e; }
          input::placeholder, textarea::placeholder { color: #2a2a4a; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #06060f; }
          ::-webkit-scrollbar-thumb { background: #2a2a50; border-radius: 3px; }
        `}</style>
      </div>
    </>
  );
}