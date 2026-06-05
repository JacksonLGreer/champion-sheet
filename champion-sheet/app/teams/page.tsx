"use client";
import { useState, useMemo, useEffect } from "react";
import PokeBall from "../Components/pokeball";
import TeamSidebar from "../Components/Teams/TeamSidebar";
import PokemonSetDetails from "../Components/Teams/PokemonSetDetails";
import { TYPE_COLORS } from "../Constants/TYPE_COLORS";
import TypeBadge from "../Components/TypeBadge";
import { STAT_COLORS, STAT_LABELS } from "../Constants/STAT_CONSTANTS";
import { PokemonSetSupa, PokemonSet } from "../Constants/PokemonInterface";
import { Team } from "../Constants/TeamInterface";
import PokemonExpandedDetails from "../Components/Teams/PokemonExpandedDetails";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "../Services/supabase/supabase-client";
import NewSetModal from "../Components/Teams/NewSetModal";
import NewTeamModal from "../Components/Teams/NewTeamModal";
import router, { useRouter } from "next/navigation";
import { getUserSets, getTeams } from "../Services/teams-service";
// ── Constants ──────────────────────────────────────────────────────────────

const NATURES = ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"];

const SLOT_KEYS = ["pokemon1", "pokemon2", "pokemon3", "pokemon4", "pokemon5", "pokemon6"] as const;

function getSlotsAsArray(team: Team): (PokemonSet | null)[] {
  return SLOT_KEYS.map(k => team[k]);
}


// ── Helpers ────────────────────────────────────────────────────────────────

function calcStat(base: number, ev: number, iv: number, nature: number, isHp: boolean, level = 100) {
  if (isHp) return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
}


// ── Empty Slot ─────────────────────────────────────────────────────────────

function EmptySlot() {
  return (
    <div style={{ background: "#0d0d1a", border: "1px dashed #2a2a4e", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 90, opacity: 0.4 }}>
      <PokeBall />
      <span style={{ fontSize: 8, color: "#44445a", fontFamily: "'Courier New', monospace", letterSpacing: "0.1em" }}>EMPTY</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TeamsPage() {
    
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teams" | "sets">("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showNewSet, setShowNewSet] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);

  // Sets filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterNature, setFilterNature] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    try {
      const [shapedTeams, allSetsData] = await Promise.all([
        getTeams(user.id),
        getUserSets(user.id),
      ]);

      const setMap = new Map(
        shapedTeams
          .flatMap((t: Team) => getSlotsAsArray(t).filter((s): s is PokemonSet => s !== null))
          .map(s => [s.id, s])
      );

      (allSetsData ?? []).forEach((s: PokemonSet) => {
        if (!setMap.has(s.id)) setMap.set(s.id, s);
      });

      const allSets = Array.from(setMap.values());

      setTeams(shapedTeams);
      setSets(allSets);
      setSelectedTeamId(shapedTeams[0]?.id ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  // - Nav -
  const handleBack = () => {
    router.push("/");
  };

  // ── Derived state ────────────────────────────────────────────────────────

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null;

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    sets.forEach(s => s.pokemon.types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [sets]);

  const allTeamNames = useMemo(() =>
    teams.map(t => t.name),
  [teams]);

  const filteredSets = useMemo(() => sets.filter(s => {
    const matchSearch = search === "" ||
      s.pokemon.name.toLowerCase().includes(search.toLowerCase()) ||
      s.moves.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchType    = filterType   === "all" || s.pokemon.types.includes(filterType);
    const matchNature  = filterNature === "all" || s.nature === filterNature;
    const matchTeam    = filterTeam   === "all" || teams.find(t =>
      getSlotsAsArray(t).some(slot => slot?.id === s.id))?.name === filterTeam;
    return matchSearch && matchType && matchNature && matchTeam;
  }), [sets, search, filterType, filterNature, filterTeam, teams]);

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1a2e", backgroundImage: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Courier New', monospace", color: "#ffe066", fontSize: 12, letterSpacing: "0.2em" }}>LOADING...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1a2e", backgroundImage: "radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #0d0d1a 70%)", fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column" }}>

      {/* ── Top Bar ── */}
      <header style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 10, background: "rgba(10,10,25,0.7)", backdropFilter: "blur(4px)" }}>
        <button onClick={() => handleBack()} style={{ background: "none", border: "none", color: "#6666aa", cursor: "pointer", padding: "2px 6px 2px 0", fontFamily: "'Courier New', monospace", fontSize: 18, lineHeight: 1 }} aria-label="Back">←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffe066", lineHeight: 1 }}>My Teams</h1>
          <p style={{ margin: 0, fontSize: 9, color: "#44445a", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{teams.length} teams · {sets.length} sets</p>
        </div>
        <div style={{ marginLeft: "auto", opacity: 0.4 }}><PokeBall/></div>
      </header>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e1e3a", background: "rgba(10,10,25,0.4)" }}>
        {(["teams", "sets"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #ffe066" : "2px solid transparent", color: activeTab === tab ? "#ffe066" : "#44445a", fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
            {tab === "teams" ? `Teams (${teams.length})` : `Sets (${sets.length})`}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ═══ LEFT SIDEBAR ═══ */}
        {activeTab === "teams" ? (
          /* Teams: wider sidebar with rich cards */
          <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid #1e1e3a", display: "flex", flexDirection: "column", background: "rgba(8,8,20,0.6)", overflowY: "auto" }}>
            <div style={{ flex: 1, padding: "8px 0" }}>
              {teams.map(team => {
                const active = selectedTeamId === team.id;
                return (
                  <TeamSidebar     
                    key={team.id}
                    team={team} 
                    active={active} 
                    setSelectedTeamId={setSelectedTeamId} />
                );
              })}
            </div>
            {/* New Team button */}
            <div style={{ padding: 10, borderTop: "1px solid #1e1e3a", background: "rgba(8,8,20,0.9)" }}>
              <button onClick={() => setShowNewTeam(true)} style={{ width: "100%", background: "linear-gradient(180deg, #2a2a4e 0%, #16163a 100%)", border: "1px solid #3a3a6e", borderRadius: 6, color: "#ffe066", fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 3px 0 #0a0a20" }}>
                <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span> New Team
              </button>
            </div>
          </div>
        ) : (
          /* Sets: search + filter panel */
          <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid #1e1e3a", display: "flex", flexDirection: "column", background: "rgba(8,8,20,0.6)", overflowY: "auto" }}>
            <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Search */}
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Search</div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#44445a" }}>⌕</span>
                  <input
                    type="text"
                    placeholder="Pokémon or move..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: "100%", background: "#0a0a1e", border: "1px solid #2a2a4e", borderRadius: 5, color: "#aaaacc", fontFamily: "'Courier New', monospace", fontSize: 9, padding: "6px 6px 6px 22px", outline: "none", boxSizing: "border-box", letterSpacing: "0.04em" }}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: "#1a1a3a" }} />

              {/* Filter by Type */}
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Type</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {["all", ...allTypes].map(t => {
                    const active = filterType === t;
                    const c = t === "all" ? null : TYPE_COLORS[t];
                    return (
                      <button key={t} onClick={() => setFilterType(t)} style={{
                        background: active ? (c ? c.bg : "#1e1e4a") : "#0a0a1a",
                        border: `1px solid ${active ? (c ? c.bg : "#3a3a7a") : "#1e1e2a"}`,
                        borderRadius: 3, color: active ? (c ? c.text : "#ffe066") : "#44445a",
                        fontFamily: "'Courier New', monospace", fontSize: 8, letterSpacing: "0.06em",
                        textTransform: "uppercase", padding: "3px 6px", cursor: "pointer", fontWeight: active ? 700 : 400,
                      }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: "#1a1a3a" }} />

              {/* Filter by Nature */}
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Nature</div>
                <select value={filterNature} onChange={e => setFilterNature(e.target.value)} style={{ width: "100%", background: "#0a0a1e", border: "1px solid #2a2a4e", borderRadius: 5, color: "#aaaacc", fontFamily: "'Courier New', monospace", fontSize: 9, padding: "5px 6px", outline: "none", cursor: "pointer" }}>
                  <option value="all">All Natures</option>
                  {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div style={{ height: 1, background: "#1a1a3a" }} />

              {/* Filter by Team */}
              <div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Team</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {["all", ...allTeamNames].map(t => {
                    const active = filterTeam === t;
                    return (
                      <button key={t} onClick={() => setFilterTeam(t)} style={{
                        background: active ? "#1e1e4a" : "none",
                        border: active ? "1px solid #3a3a7a" : "1px solid transparent",
                        borderRadius: 4, color: active ? "#ffe066" : "#6666aa",
                        fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.06em",
                        textTransform: "uppercase", padding: "5px 8px", cursor: "pointer",
                        textAlign: "left", fontWeight: active ? 700 : 400,
                        borderLeft: active ? "2px solid #ffe066" : "2px solid transparent",
                      }}>
                        {t === "all" ? "All Teams" : t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: "#1a1a3a" }} />

              {/* Reset */}
              <button onClick={() => { setSearch(""); setFilterType("all"); setFilterNature("all"); setFilterTeam("all"); }} style={{ background: "none", border: "1px solid #2a2a4e", borderRadius: 5, color: "#6666aa", fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px", cursor: "pointer" }}>
                ✕ Clear Filters
              </button>
            </div>

            {/* New Set button */}
            <div style={{ marginTop: "auto", padding: 10, borderTop: "1px solid #1e1e3a", background: "rgba(8,8,20,0.9)" }}>
              <button   onClick={() => setShowNewSet(true)}
                        style={{ width: "100%", background: "linear-gradient(180deg, #2a2a4e 0%, #16163a 100%)", border: "1px solid #3a3a6e", borderRadius: 6, color: "#ffe066", fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 3px 0 #0a0a20" }}>
                <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span> New Set
              </button>
            </div>
          </div>
        )}

        {/* ═══ RIGHT PANEL ═══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, minWidth: 0 }}>
          {activeTab === "teams" ? (
            selectedTeam ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 15, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase"}}>{selectedTeam.name}</div>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#4a9eda", background: "#0a1a3a", border: "1px solid #1a2a4a", borderRadius: 3, padding: "1px 6px", letterSpacing: "0.06em" }}>{selectedTeam.format}</span>
                  </div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#33334a", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>
                    Created {selectedTeam.created_at} · {getSlotsAsArray(selectedTeam).filter(Boolean).length} Pokémon
                  </div>
                  <div style={{ marginTop: 8, height: 1, background: "linear-gradient(to right, #ffe06644, transparent)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {getSlotsAsArray(selectedTeam).map((slot, i) =>
                    slot
                      ? <PokemonExpandedDetails key={`${selectedTeam.id}-${slot.id}`} pokemon={slot} />
                      : <EmptySlot key={`${selectedTeam.id}-empty-${i}`} />
                  )}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                  {["Edit Team", "Export", "Delete"].map((label, i) => (
                    <button key={label} style={{ flex: i === 0 ? 2 : 1, background: i === 2 ? "linear-gradient(180deg, #3a1010, #1a0808)" : "linear-gradient(180deg, #1e1e3a, #12122a)", border: `1px solid ${i === 2 ? "#6e2a2a" : "#2a2a5a"}`, borderRadius: 6, color: i === 2 ? "#cc6666" : "#8888bb", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 4px", cursor: "pointer", boxShadow: `0 2px 0 ${i === 2 ? "#100404" : "#080814"}` }}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", marginTop: 40, color: "#33334a", fontFamily: "'Courier New', monospace", fontSize: 11 }}>No teams yet</div>
            )
          ) : (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  All Sets <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#44445a", fontWeight: 400, marginLeft: 8 }}>{filteredSets.length} result{filteredSets.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ marginTop: 6, height: 1, background: "linear-gradient(to right, #ffe06644, transparent)" }} />
              </div>
              {filteredSets.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {filteredSets.map(s => 
                  <PokemonSetDetails key={`${s.id}-${s.pokemon.id}`} set={s} />
                )}                </div>
              ) : (
                <div style={{ textAlign: "center", marginTop: 40, color: "#33334a", fontFamily: "'Courier New', monospace", fontSize: 11 }}>No sets match your filters</div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a18; }
        ::-webkit-scrollbar-thumb { background: #2a2a50; border-radius: 4px; border: 1px solid #1a1a38; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a6a; }
        input::placeholder { color: #33334a; }
        select option { background: #0d0d1e; }
      `}</style>
      {showNewSet && (
        <NewSetModal
          onClose={() => setShowNewSet(false)}
          onSaved={async () => {
            await load();
            setShowNewSet(false);
            // Re-run load to refresh sets
          }}
        />
      )}
      {showNewTeam && (
        <NewTeamModal
          onClose={() => setShowNewTeam(false)}
          onSaved={async () => {
            await load();
            setShowNewTeam(false);
          }}
        />
      )}       
    </div>
  );
}