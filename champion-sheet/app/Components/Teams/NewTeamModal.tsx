"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../Services/supabase/supabase-client";
import { getUserSets } from "../../Services/teams-service";
import { PokemonSet } from "../../Constants/PokemonInterface";
import TypeBadge from "../TypeBadge";

const FORMATS = ["OU", "Ubers", "UU", "RU", "NU", "PU", "VGC", "BSS", "LC", "Monotype", "Custom"];
const SLOT_KEYS = ["pokemon1", "pokemon2", "pokemon3", "pokemon4", "pokemon5", "pokemon6"] as const;

interface NewTeamModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function NewTeamModal({ onClose, onSaved }: NewTeamModalProps) {
  const supabase = createClient();

  const [userSets, setUserSets] = useState<PokemonSet[]>([]);
  const [slots, setSlots] = useState<(PokemonSet | null)[]>([null, null, null, null, null, null]);
  const [teamName, setTeamName] = useState("");
  const [format, setFormat] = useState("OU");
  const [search, setSearch] = useState("");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load user's sets ─────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      try {
        const sets = await getUserSets(user.id);
        setUserSets(sets);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const filteredSets = userSets.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.pokemon.name.toLowerCase().includes(q) ||
      (s.set_name ?? "").toLowerCase().includes(q)
    );
  });

  const filledCount = slots.filter(Boolean).length;

  // ── Slot actions ─────────────────────────────────────────────────────────
  function assignSet(set: PokemonSet) {
    // If already in a slot, remove it first
    const existing = slots.findIndex(s => s?.id === set.id);
    if (existing >= 0) {
      const updated = [...slots]; updated[existing] = null; setSlots(updated); return;
    }
    // Fill the active slot, or the first empty one
    const target = activeSlot !== null && slots[activeSlot] === null
      ? activeSlot
      : slots.findIndex(s => s === null);
    if (target < 0) return;
    const updated = [...slots]; updated[target] = set; setSlots(updated);
    setActiveSlot(null);
  }

  function removeSlot(i: number) {
    const updated = [...slots]; updated[i] = null; setSlots(updated);
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!teamName.trim()) { setError("Please enter a team name."); return; }
    if (filledCount === 0) { setError("Add at least one Pokémon."); return; }
    setSaving(true); setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not logged in."); setSaving(false); return; }

    const payload: Record<string, any> = {
      name: teamName.trim(),
      format,
      trainer_id: user.id,
    };
    SLOT_KEYS.forEach((k, i) => { payload[k] = slots[i]?.id ?? null; });

    const { error: saveError } = await supabase.from("teams").insert(payload);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    onSaved(); onClose();
  }

  // ── Styles ───────────────────────────────────────────────────────────────
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

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 40, backdropFilter: "blur(3px)" }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "min(720px, 96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column",
        background: "#0e0e20", border: "1px solid #2e2e52", borderRadius: 8,
        zIndex: 50, fontFamily: "'Courier New', monospace",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
      }}>

        {/* ── Title bar ── */}
        <div style={{ background: "linear-gradient(90deg,#1a1a38,#12122a)", borderBottom: "1px solid #2a2a4e", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#ffe066", letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 1px 0 #7a5a00" }}>New Team</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? "#0d0d1e" : "#1a3a1a", border: "1px solid #2a5a2a", borderRadius: 3, color: saving ? "#33334a" : "#66ee66", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "✓ Save Team"}
            </button>
            <button onClick={onClose} style={{ background: "#1a1a2e", border: "1px solid #3a2a2a", borderRadius: 3, color: "#aa6666", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* ── Team name + format ── */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #1a1a32", background: "#0b0b1a", display: "flex", gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 2 }}>
            <label style={lbl}>Team Name</label>
            <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Rain Team…" style={inp} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: filledCount === 6 ? "#66ee66" : "#44445a", letterSpacing: "0.1em", paddingBottom: 6 }}>
              {filledCount} / 6
            </div>
          </div>
        </div>

        {/* ── Body: sets list + slot grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* ── LEFT: sets scroll list ── */}
          <div style={{ borderRight: "1px solid #1a1a32", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #1a1a32", flexShrink: 0 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter sets…"
                style={{ ...inp, fontSize: 9 }}
              />
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading ? (
                <div style={{ padding: 20, textAlign: "center", color: "#2a2a4a", fontSize: 10, letterSpacing: "0.1em" }}>Loading…</div>
              ) : filteredSets.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#2a2a4a", fontSize: 10, letterSpacing: "0.1em" }}>No sets found</div>
              ) : filteredSets.map((s, idx) => {
                const inSlot = slots.some(sl => sl?.id === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => assignSet(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", cursor: "pointer",
                      background: inSlot ? "#0e1e0e" : idx % 2 === 0 ? "#08081a" : "#0a0a1e",
                      borderBottom: "1px solid #10101e",
                      borderLeft: inSlot ? "2px solid #44ee44" : "2px solid transparent",
                    }}
                    onMouseEnter={e => { if (!inSlot) e.currentTarget.style.background = "#14143a"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = inSlot ? "#0e1e0e" : idx % 2 === 0 ? "#08081a" : "#0a0a1e"; }}
                  >
                    <img
                      src={s.pokemon.sprite}
                      alt={s.pokemon.name}
                      style={{ width: 36, height: 36, imageRendering: "pixelated", opacity: inSlot ? 1 : 0.7 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: inSlot ? "#66ee66" : "#ffe066", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {inSlot && "✓ "}{s.set_name ?? s.pokemon.name}
                      </div>
                      <div style={{ fontSize: 8, color: "#44445a", letterSpacing: "0.04em", marginTop: 1 }}>
                        {s.pokemon.name} · {s.nature} · {s.item}
                      </div>
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {s.pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: 6 slots ── */}
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            <div style={{ fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>
              Click a set on the left to fill a slot · Click a slot to target it · Click ✕ to clear
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {slots.map((slot, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSlot(activeSlot === i ? null : i)}
                  style={{
                    borderRadius: 6, border: `1px solid ${activeSlot === i ? "#ffe066" : slot ? "#2a4a2a" : "#1a1a32"}`,
                    background: activeSlot === i ? "#1a1a0a" : slot ? "#0a140a" : "#08080f",
                    padding: "8px 10px", cursor: "pointer", minHeight: 70,
                    display: "flex", alignItems: "center", gap: 10, position: "relative",
                    transition: "border-color 0.15s",
                  }}
                >
                  {slot ? (
                    <>
                      <img src={slot.pokemon.sprite} alt={slot.pokemon.name} style={{ width: 52, height: 52, imageRendering: "pixelated", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#ffe066", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {slot.set_name ?? slot.pokemon.name}
                        </div>
                        <div style={{ fontSize: 8, color: "#6666aa", marginTop: 1 }}>{slot.pokemon.name} · {slot.nature}</div>
                        <div style={{ fontSize: 8, color: "#44445a", marginTop: 1 }}>{slot.item} · {slot.ability}</div>
                        <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                          {slot.pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                      {/* Clear button */}
                      <button
                        onClick={e => { e.stopPropagation(); removeSlot(i); }}
                        style={{ position: "absolute", top: 5, right: 6, background: "none", border: "none", color: "#443333", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#cc6666")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#443333")}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, opacity: activeSlot === i ? 0.8 : 0.25 }}>
                      <div style={{ fontSize: 22, lineHeight: 1 }}>+</div>
                      <div style={{ fontSize: 8, color: "#6666aa", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {activeSlot === i ? "Select a set →" : `Slot ${i + 1}`}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: "6px 12px", background: "#1a0808", borderTop: "1px solid #3a1a1a", fontSize: 10, color: "#cc4444", fontFamily: "'Courier New', monospace", letterSpacing: "0.06em", flexShrink: 0 }}>
            ⚠ {error}
          </div>
        )}

        <style>{`
          select option { background: #0d0d1e; }
          input::placeholder { color: #2a2a4a; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #06060f; }
          ::-webkit-scrollbar-thumb { background: #2a2a50; border-radius: 3px; }
        `}</style>
      </div>
    </>
  );
}