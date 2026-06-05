"use client";
import { useState, useEffect } from "react";
import { createClient } from "./../Services/supabase/supabase-client";
import TypeBadge from "./TypeBadge";

interface MoveDetail {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effect: string | null;
}

interface MoveListBrowserProps {
  pokemonId: number | null;
  selectedMoves: (string | null)[];
  onMovesChange: (moves: (string | null)[]) => void;
}

export default function MoveListBrowser({ pokemonId, selectedMoves, onMovesChange }: MoveListBrowserProps) {
  const supabase = createClient();
  const [moves, setMoves] = useState<MoveDetail[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemonId) { setMoves([]); return; }

    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("pokemon_moves")
        .select("moves(id, name, type, category, power, accuracy, pp, effect)")
        .eq("pokemon_id", pokemonId);

      if (!mounted) return;
      setLoading(false);

      if (error) { console.error("MoveListBrowser:", error); return; }

      const parsed: MoveDetail[] = (data ?? [])
        .map((row: any) => row.moves)
        .filter(Boolean);
      setMoves(parsed);
    }

    load();
    return () => { mounted = false; };
  }, [pokemonId]);

  // Reset search when pokemon changes
  useEffect(() => { setSearch(""); }, [pokemonId]);

  const filtered = search.length < 2
    ? moves
    : moves.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  function handleClick(moveName: string) {
    // If already selected, deselect it
    if (selectedMoves.includes(moveName)) {
      onMovesChange(selectedMoves.map(m => m === moveName ? null : m));
      return;
    }
    // Fill the first empty slot
    const emptyIdx = selectedMoves.findIndex(m => m === null);
    if (emptyIdx === -1) return; // all 4 slots full
    const next = [...selectedMoves];
    next[emptyIdx] = moveName;
    onMovesChange(next);
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "#06060f", border: "1px solid #2a2a4e",
    borderRadius: 4, color: "#cccce0", fontFamily: "'Courier New', monospace",
    fontSize: 10, padding: "5px 7px", outline: "none",
    boxSizing: "border-box", letterSpacing: "0.04em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#08081a" }}>
      {/* Search bar */}
      <div style={{ padding: "6px 10px", borderBottom: "1px solid #1a1a32", background: "#09091a" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter moves…"
          style={{ ...inp, fontSize: 9 }}
        />
      </div>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 60px 48px 48px 36px 1fr", position: "sticky", top: 0, background: "#09091a", borderBottom: "1px solid #1a1a32", zIndex: 1 }}>
        {["Name", "Type", "Cat", "Pow", "Acc", "PP", "Effect"].map(h => (
          <div key={h} style={{ fontSize: 8, color: "#44445a", textAlign: "center", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 6px", fontWeight: 700 }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {!pokemonId ? (
          <div style={{ padding: 20, textAlign: "center", color: "#2a2a4a", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.1em" }}>
            Select a Pokémon to see its moves
          </div>
        ) : loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#2a2a4a", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.1em" }}>
            Loading…
          </div>
        ) : filtered.slice(0, 40).map((m, idx) => {
          const isSelected = selectedMoves.includes(m.name);
          return (
            <div
              key={m.id}
              onClick={() => handleClick(m.name)}
              style={{ display: "grid", gridTemplateColumns: "2fr 80px 60px 48px 48px 36px 1fr", background: idx % 2 === 0 ? "#08081a" : "#0a0a1e", borderBottom: "1px solid #10101e", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#14143a")}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#08081a" : "#0a0a1e")}
            >
              <div style={{ padding: "5px 6px", fontSize: 10, color: isSelected ? "#ffe066" : "#aaaacc", fontFamily: "'Courier New', monospace" }}>
                {isSelected && <span style={{ color: "#ffe06688", marginRight: 4 }}>✓</span>}
                {m.name}
              </div>
              <div style={{ padding: "5px 6px", display: "flex", alignItems: "center" }}>
                {m.type ? <TypeBadge type={m.type} /> : <span style={{ color: "#44445a" }}>—</span>}
              </div>
              <div style={{ padding: "5px 6px", fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace" }}>{m.category ?? "—"}</div>
              <div style={{ padding: "5px 6px", fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace", textAlign: "center" }}>{m.power ?? "—"}</div>
              <div style={{ padding: "5px 6px", fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace", textAlign: "center" }}>{m.accuracy ?? "—"}</div>
              <div style={{ padding: "5px 6px", fontSize: 9, color: "#44445a", fontFamily: "'Courier New', monospace", textAlign: "center" }}>{m.pp ?? "—"}</div>
              <div style={{ padding: "5px 6px", fontSize: 9, color: "#6666aa", fontFamily: "'Courier New', monospace", lineHeight: 1.4 }}>{m.effect ?? "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
    
  );
}