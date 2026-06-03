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

// ── Micro-components ───────────────────────────────────────────────────────

function StatBar({ stat, value, max = 255 }: { stat: number; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: STAT_COLORS[stat], width: 30, fontWeight: 700, letterSpacing: "0.05em" }}>{STAT_LABELS[stat]}</span>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#8888bb", width: 28, textAlign: "right" }}>{value}</span>
      <div style={{ flex: 1, height: 4, background: "#0d0d1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: STAT_COLORS[stat], borderRadius: 2, opacity: 0.85 }} />
      </div>
    </div>
  );
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const SET_FRAGMENT = `
        id, set_name, item, nature, 
        hp_ev, atk_ev, def_ev, spa_ev, spd_ev, spe_ev,
        ability:abilities!ability ( name ),
        move1:moves!move1 ( name ),
        move2:moves!move2 ( name ),
        move3:moves!move3 ( name ),
        move4:moves!move4 ( name ),
        pokemon:pokemon!pokemon_id (
          id, name, pokedexNum,
          stats:pokemon_stats ( hp, attack, defense, special_attack, special_defense, speed ),
          types:types ( type1, type2 )
        )
      `;

      const [teamRes, setsRes] = await Promise.all([
        supabase
          .from("teams")
          .select(`
            id, name, format, created_at, trainer_id,
            pokemon1:pokemon_sets!pokemon1 ( ${SET_FRAGMENT} ),
            pokemon2:pokemon_sets!pokemon2( ${SET_FRAGMENT} ),
            pokemon3:pokemon_sets!pokemon3 ( ${SET_FRAGMENT} ),
            pokemon4:pokemon_sets!pokemon4 ( ${SET_FRAGMENT} ),
            pokemon5:pokemon_sets!pokemon5 ( ${SET_FRAGMENT} ),
            pokemon6:pokemon_sets!pokemon6 ( ${SET_FRAGMENT} )
          `)
          .eq("trainer_id", user.id),
        supabase
          .from("pokemon_sets")
          .select(SET_FRAGMENT)
          .eq("trainer_id", user.id)
      ]);

      const { data: teamData, error: teamError } = teamRes;
      const { data: allSetsData, error: setsError } = setsRes;

      if (teamError) { console.error(teamError); console.error("Message: " + teamError.message); setLoading(false); return; }
      if (setsError) { console.error(setsError); console.error("Message: " + setsError.message); setLoading(false); return; }

      // Shape each slot's raw response into PokemonSet
      const shapeSlot = (s: any): PokemonSet => ({
        id: s.id,
        set_name: s.set_name,
        item: s.item,
        nature: s.nature,
        evs: {
          hp:  s.hp_ev,
          atk: s.atk_ev,
          def: s.def_ev,
          spa: s.spa_ev,
          spd: s.spd_ev,
          spe: s.spe_ev,
        },
        ability: s.ability.name,
        moves: [s.move1.name, s.move2.name, s.move3.name, s.move4.name],
        pokemon: {
          id: s.pokemon.id,
          name: s.pokemon.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.pokemon.pokedexNum}.png`,
          types: [s.pokemon.types.type1, s.pokemon.types.type2].filter(Boolean),
          baseStats: {
            hp:  s.pokemon.stats.hp,
            atk: s.pokemon.stats.attack,
            def: s.pokemon.stats.defense,
            spa: s.pokemon.stats.special_attack,
            spd: s.pokemon.stats.special_defense,
            spe: s.pokemon.stats.speed,
          },
        },
      });

      
      const shapedTeams: Team[] = (teamData ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        format: t.format,
        created_at: t.created_at,
        trainer_id: t.trainer_id,
        pokemon1: t.pokemon1 ? shapeSlot(t.pokemon1) : null,
        pokemon2: t.pokemon2 ? shapeSlot(t.pokemon2) : null,
        pokemon3: t.pokemon3 ? shapeSlot(t.pokemon3) : null,
        pokemon4: t.pokemon4 ? shapeSlot(t.pokemon4) : null,
        pokemon5: t.pokemon5 ? shapeSlot(t.pokemon5) : null,
        pokemon6: t.pokemon6 ? shapeSlot(t.pokemon6) : null,
      }));

      // Flatten all non-null slots into the sets list, then add all other sets from DB
      const setMap = new Map(
        shapedTeams
          .flatMap(t => getSlotsAsArray(t).filter((s): s is PokemonSet => s !== null))
          .map(s => [s.id, s])
      );

      // Add all sets from DB (including those not on any team)
      (allSetsData ?? []).forEach((rawSet: any) => {
        if (!setMap.has(rawSet.id)) {
          setMap.set(rawSet.id, shapeSlot(rawSet));
        }
      });

      const allSets = Array.from(setMap.values());

      setTeams(shapedTeams);
      setSets(allSets);
      setSelectedTeamId(shapedTeams[0]?.id ?? null);
      setLoading(false);
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
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffe066", textShadow: "0 2px 0 #7a5a00", lineHeight: 1 }}>My Teams</h1>
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
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 15, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 2px 0 #7a5a00" }}>{selectedTeam.name}</div>
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
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 2px 0 #7a5a00" }}>
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