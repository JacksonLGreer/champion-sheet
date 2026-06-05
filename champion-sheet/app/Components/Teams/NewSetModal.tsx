"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../Services/supabase/supabase-client";
import TypeBadge from "../TypeBadge";
import { STAT_COLORS, STAT_LABELS } from "../../Constants/STAT_CONSTANTS";
import { getAllPokemon, Pokemon } from "../../Services/pokemon-service";
import MoveListBrowser from "../MoveListBrowser";

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
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<(string | null)[]>([null, null, null, null]);
  const [nature, setNature] = useState("Hardy");
  const [item, setItem] = useState("");
  const [setName, setSetName] = useState("");
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
  }, [selectedPokemon]);

  // Filter locally — no more Supabase search call needed:
  const filteredPokemon = search.length < 2
  ? []
  : allPokemon
      .filter(p => p.name.toLowerCase().startsWith(search.toLowerCase()))
      .slice(0, 12);
  const filteredAbilities = (selectedPokemon?.abilities ?? [] as Array<{id: number; name: string}>)
    .filter((a: {id: number; name: string}) => a.name.toLowerCase().includes(abilitySearch.toLowerCase()))
    .slice(0, 8);
  
 
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
      set_name: setName,
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
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              value={setName}
              onChange={e => setSetName(e.target.value)}
              placeholder="Set name"
              style={{ ...inp, width: 160, padding: "4px 8px", fontSize: 9 }}
            />
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

          {/* Moves — display only, selection driven by MoveListBrowser below */}
          <div style={{ borderRight: "1px solid #1a1a32", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ffe066", letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid #1a1a32", paddingBottom: 4, marginBottom: 2 }}>Moves</div>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, background: "#06060f", border: `1px solid ${selectedMoves[i] ? "#4a9eda" : "#2a2a4e"}`, borderRadius: 4, padding: "5px 7px", fontSize: 10, color: selectedMoves[i] ? "#cccce0" : "#2a2a4a", fontFamily: "'Courier New', monospace", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedMoves[i] ?? `Move ${i + 1}…`}
                </div>
                {selectedMoves[i] && (
                  <button
                    onClick={() => { const next = [...selectedMoves]; next[i] = null; setSelectedMoves(next); }}
                    style={{ background: "none", border: "none", color: "#44445a", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
                  >✕</button>
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
                    type="number" min={0} max={32} value={evs[s]}
                    onChange={e => {
                      const raw = Number(e.target.value);
                      setEvs(prev => {
                        const prevVal = (prev as any)[s] ?? 0;
                        const totalWithout = Object.values(prev).reduce((a, b) => a + b, 0) - prevVal;
                        const maxForStat = Math.max(0, Math.min(32, 66 - totalWithout));
                        const newVal = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(maxForStat, raw));
                        return { ...prev, [s]: newVal } as typeof prev;
                      });
                    }}
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

        <MoveListBrowser
          pokemonId={selectedPokemon?.id ?? null}
          selectedMoves={selectedMoves}
          onMovesChange={setSelectedMoves}
        />

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