"use client";
import { useState, useMemo } from "react";
import PokeBall from "../Components/pokeball";
import TeamSidebar from "../Components/Teams/TeamSidebar";
import PokemonSetDetails from "../Components/Teams/PokemonSetDetails";
import { TYPE_COLORS } from "../Constants/TYPE_COLORS";
import TypeBadge from "../Components/TypeBadge";
import { STAT_COLORS, STAT_LABELS } from "../Constants/STAT_CONSTANTS";

// ── Types ──────────────────────────────────────────────────────────────────

interface PokemonSlot {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  level: number;
  item: string;
  ability: string;
  nature: string;
  moves: [string, string, string, string];
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

interface Team {
  id: string;
  name: string;
  format: string;
  pokemon: PokemonSlot[];
  createdAt: string;
}

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

// ── Constants ──────────────────────────────────────────────────────────────




const NATURES = ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"];

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TEAMS: Team[] = [
  {
    id: "t1", name: "Rain Team", format: "OU", createdAt: "May 2025",
    pokemon: [
      {
        id: 249, name: "Lugia", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png",
        types: ["psychic", "flying"], level: 100, item: "Leftovers", ability: "Multiscale", nature: "Bold",
        moves: ["Aeroblast", "Calm Mind", "Roost", "Thunder Wave"],
        evs: { hp: 252, atk: 0, def: 168, spa: 0, spd: 88, spe: 0 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 106, atk: 90, def: 130, spa: 90, spd: 154, spe: 110 },
      },
      {
        id: 130, name: "Gyarados", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
        types: ["water", "flying"], level: 100, item: "Lum Berry", ability: "Intimidate", nature: "Adamant",
        moves: ["Waterfall", "Ice Fang", "Dragon Dance", "Earthquake"],
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
        baseStats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
      },
      {
        id: 135, name: "Jolteon", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png",
        types: ["electric"], level: 100, item: "Choice Specs", ability: "Volt Absorb", nature: "Timid",
        moves: ["Thunderbolt", "Shadow Ball", "Signal Beam", "Volt Switch"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 65, atk: 65, def: 60, spa: 110, spd: 95, spe: 130 },
      },
      {
        id: 282, name: "Gardevoir", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png",
        types: ["psychic", "fairy"], level: 100, item: "Gardevoirite", ability: "Telepathy", nature: "Timid",
        moves: ["Moonblast", "Psyshock", "Calm Mind", "Focus Blast"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 68, atk: 65, def: 65, spa: 125, spd: 115, spe: 80 },
      },
      {
        id: 248, name: "Tyranitar", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
        types: ["rock", "dark"], level: 100, item: "Choice Band", ability: "Sand Stream", nature: "Jolly",
        moves: ["Stone Edge", "Crunch", "Earthquake", "Ice Punch"],
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
        baseStats: { hp: 100, atk: 134, def: 110, spa: 95, spd: 100, spe: 61 },
      },
      {
        id: 6, name: "Charizard", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
        types: ["fire", "flying"], level: 100, item: "Life Orb", ability: "Blaze", nature: "Modest",
        moves: ["Fire Blast", "Air Slash", "Focus Blast", "Roost"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
      },
    ],
  },
  {
    id: "t2", name: "Sun Squad", format: "Ubers", createdAt: "Apr 2025",
    pokemon: [
      {
        id: 383, name: "Groudon", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png",
        types: ["ground"], level: 100, item: "Red Orb", ability: "Drought", nature: "Adamant",
        moves: ["Precipice Blades", "Fire Punch", "Stone Edge", "Swords Dance"],
        evs: { hp: 160, atk: 252, def: 0, spa: 0, spd: 0, spe: 96 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
        baseStats: { hp: 100, atk: 150, def: 140, spa: 100, spd: 90, spe: 90 },
      },
      {
        id: 445, name: "Garchomp", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png",
        types: ["dragon", "ground"], level: 100, item: "Rocky Helmet", ability: "Rough Skin", nature: "Jolly",
        moves: ["Earthquake", "Dragon Claw", "Stone Edge", "Swords Dance"],
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
        baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
      },
      {
        id: 376, name: "Metagross", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png",
        types: ["steel", "psychic"], level: 100, item: "Metagrossite", ability: "Clear Body", nature: "Jolly",
        moves: ["Meteor Mash", "Bullet Punch", "Earthquake", "Ice Punch"],
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
        baseStats: { hp: 80, atk: 135, def: 130, spa: 95, spd: 90, spe: 70 },
      },
      {
        id: 196, name: "Espeon", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png",
        types: ["psychic"], level: 100, item: "Choice Scarf", ability: "Magic Bounce", nature: "Timid",
        moves: ["Psychic", "Dazzling Gleam", "Shadow Ball", "Trick"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 65, atk: 65, def: 60, spa: 130, spd: 95, spe: 110 },
      },
      {
        id: 3, name: "Venusaur", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
        types: ["grass", "poison"], level: 100, item: "Black Sludge", ability: "Chlorophyll", nature: "Modest",
        moves: ["Solar Beam", "Sludge Bomb", "Sleep Powder", "Growth"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
      },
      {
        id: 157, name: "Typhlosion", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/157.png",
        types: ["fire"], level: 100, item: "Choice Specs", ability: "Blaze", nature: "Timid",
        moves: ["Fire Blast", "Focus Blast", "Hidden Power Ice", "Extrasensory"],
        evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
        baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
      },
    ],
  },
  {
    id: "t3", name: "Trick Room", format: "VGC", createdAt: "Mar 2025",
    pokemon: [
      {
        id: 94, name: "Gengar", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
        types: ["ghost", "poison"], level: 50, item: "Focus Sash", ability: "Cursed Body", nature: "Quiet",
        moves: ["Shadow Ball", "Sludge Bomb", "Trick Room", "Destiny Bond"],
        evs: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 0 },
        baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
      },
      {
        id: 143, name: "Snorlax", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
        types: ["normal"], level: 50, item: "Assault Vest", ability: "Thick Fat", nature: "Brave",
        moves: ["Return", "Earthquake", "Ice Punch", "Heavy Slam"],
        evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 0 },
        baseStats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
      },
      {
        id: 448, name: "Lucario", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png",
        types: ["fighting", "steel"], level: 50, item: "Lucarionite", ability: "Justified", nature: "Quiet",
        moves: ["Close Combat", "Flash Cannon", "Bullet Punch", "Swords Dance"],
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 0 },
        baseStats: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 },
      },
      {
        id: 609, name: "Chandelure", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/609.png",
        types: ["ghost", "fire"], level: 50, item: "Choice Specs", ability: "Flash Fire", nature: "Quiet",
        moves: ["Overheat", "Shadow Ball", "Energy Ball", "Trick Room"],
        evs: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 0 },
        baseStats: { hp: 60, atk: 55, def: 90, spa: 145, spd: 90, spe: 80 },
      },
      {
        id: 534, name: "Conkeldurr", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/534.png",
        types: ["fighting"], level: 50, item: "Flame Orb", ability: "Guts", nature: "Brave",
        moves: ["Drain Punch", "Mach Punch", "Ice Punch", "Knock Off"],
        evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 0 },
        baseStats: { hp: 105, atk: 140, def: 95, spa: 55, spd: 65, spe: 45 },
      },
      {
        id: 365, name: "Walrein", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png",
        types: ["ice", "water"], level: 50, item: "Leftovers", ability: "Thick Fat", nature: "Sassy",
        moves: ["Blizzard", "Surf", "Toxic", "Protect"],
        evs: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 0 },
        baseStats: { hp: 110, atk: 80, def: 90, spa: 95, spd: 90, spe: 65 },
      },
    ],
  },
];

const MOCK_SETS: PokemonSet[] = [
  { id: "s1", pokemonName: "Gengar", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", moves: ["Shadow Ball", "Sludge Bomb", "Destiny Bond", "Thunderbolt"], nature: "Timid", item: "Choice Specs", ability: "Cursed Body", evSpread: "252 SpA / 4 SpD / 252 Spe", types: ["ghost", "poison"], teamName: "Trick Room" },
  { id: "s2", pokemonName: "Garchomp", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png", moves: ["Earthquake", "Dragon Claw", "Stone Edge", "Swords Dance"], nature: "Jolly", item: "Rocky Helmet", ability: "Rough Skin", evSpread: "4 HP / 252 Atk / 252 Spe", types: ["dragon", "ground"], teamName: "Sun Squad" },
  { id: "s3", pokemonName: "Gyarados", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png", moves: ["Waterfall", "Ice Fang", "Dragon Dance", "Earthquake"], nature: "Adamant", item: "Lum Berry", ability: "Intimidate", evSpread: "4 HP / 252 Atk / 252 Spe", types: ["water", "flying"], teamName: "Rain Team" },
  { id: "s4", pokemonName: "Gardevoir", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png", moves: ["Moonblast", "Psyshock", "Calm Mind", "Focus Blast"], nature: "Timid", item: "Gardevoirite", ability: "Telepathy", evSpread: "4 HP / 252 SpA / 252 Spe", types: ["psychic", "fairy"], teamName: "Rain Team" },
  { id: "s5", pokemonName: "Metagross", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png", moves: ["Meteor Mash", "Bullet Punch", "Earthquake", "Ice Punch"], nature: "Jolly", item: "Metagrossite", ability: "Clear Body", evSpread: "4 HP / 252 Atk / 252 Spe", types: ["steel", "psychic"], teamName: "Sun Squad" },
  { id: "s6", pokemonName: "Lugia", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png", moves: ["Aeroblast", "Calm Mind", "Roost", "Thunder Wave"], nature: "Bold", item: "Leftovers", ability: "Multiscale", evSpread: "252 HP / 168 Def / 88 SpD", types: ["psychic", "flying"], teamName: "Rain Team" },
  { id: "s7", pokemonName: "Snorlax", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", moves: ["Return", "Earthquake", "Ice Punch", "Heavy Slam"], nature: "Brave", item: "Assault Vest", ability: "Thick Fat", evSpread: "252 HP / 252 Atk / 4 SpD", types: ["normal"], teamName: "Trick Room" },
  { id: "s8", pokemonName: "Espeon", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png", moves: ["Psychic", "Dazzling Gleam", "Shadow Ball", "Trick"], nature: "Timid", item: "Choice Scarf", ability: "Magic Bounce", evSpread: "4 HP / 252 SpA / 252 Spe", types: ["psychic"], teamName: "Sun Squad" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function calcStat(base: number, ev: number, iv: number, nature: number, isHp: boolean, level = 100) {
  if (isHp) return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
}

// ── Micro-components ───────────────────────────────────────────────────────




function StatBar({ stat, value, max = 255 }: { stat: string; value: number; max?: number }) {
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

// ── Expanded Pokémon Card (Teams tab right panel) ──────────────────────────

function ExpandedPokemonCard({ pokemon }: { pokemon: PokemonSlot }) {
  const natMult = (stat: string) => {
    const boosts: Record<string, [string, string]> = {
      Adamant: ["atk", "spa"], Modest: ["spa", "atk"], Jolly: ["spe", "spa"],
      Timid: ["spe", "atk"], Bold: ["def", "atk"], Impish: ["def", "spa"],
      Careful: ["spd", "spa"], Calm: ["spd", "atk"], Brave: ["atk", "spe"],
      Quiet: ["spa", "spe"], Relaxed: ["def", "spe"], Sassy: ["spd", "spe"],
      Hasty: ["spe", "def"], Naive: ["spe", "spd"], Naughty: ["atk", "spd"],
      Rash: ["spa", "spd"], Lax: ["def", "spd"], Mild: ["spa", "def"],
      Lonely: ["atk", "def"], Gentle: ["spd", "def"],
    };
    const entry = boosts[pokemon.nature];
    if (!entry) return 1;
    if (entry[0] === stat) return 1.1;
    if (entry[1] === stat) return 0.9;
    return 1;
  };

  const stats = {
    hp:  calcStat(pokemon.baseStats.hp,  pokemon.evs.hp,  pokemon.ivs.hp,  1,               true,  pokemon.level),
    atk: calcStat(pokemon.baseStats.atk, pokemon.evs.atk, pokemon.ivs.atk, natMult("atk"),   false, pokemon.level),
    def: calcStat(pokemon.baseStats.def, pokemon.evs.def, pokemon.ivs.def, natMult("def"),   false, pokemon.level),
    spa: calcStat(pokemon.baseStats.spa, pokemon.evs.spa, pokemon.ivs.spa, natMult("spa"),   false, pokemon.level),
    spd: calcStat(pokemon.baseStats.spd, pokemon.evs.spd, pokemon.ivs.spd, natMult("spd"),   false, pokemon.level),
    spe: calcStat(pokemon.baseStats.spe, pokemon.evs.spe, pokemon.ivs.spe, natMult("spe"),   false, pokemon.level),
  };

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

      {/* Header strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 0", position: "relative" }}>
        <img src={pokemon.sprite} alt={pokemon.name} style={{ width: 64, height: 64, imageRendering: "pixelated", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.7))" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 900, color: "#ffe066", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: "0 1px 0 #7a5a00" }}>
            {pokemon.name}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
            {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#6666aa", marginTop: 4 }}>
            Lv.{pokemon.level} · {pokemon.nature} · {pokemon.ability}
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

      {/* Moves + Stats columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px 10px" }}>
        {/* Moves */}
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Moves</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {pokemon.moves.map((m, i) => (
              <div key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#aaaacc", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#ffe06666", fontSize: 8 }}>{"▸"}</span>
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Stats</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(["hp", "atk", "def", "spa", "spd", "spe"] as const).map(s => (
              <StatBar key={s} stat={s} value={stats[s]} />
            ))}
          </div>
        </div>
      </div>

      {/* EV / IV row */}
      <div style={{ borderTop: "1px solid #16163a", padding: "6px 12px" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#44445a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>EVs · IVs</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["hp", "atk", "def", "spa", "spd", "spe"] as const).map(s => (
            (pokemon.evs[s] > 0 || pokemon.ivs[s] < 31) ? (
              <div key={s} style={{ background: "#0a0a1e", border: "1px solid #1e1e3a", borderRadius: 4, padding: "2px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: STAT_COLORS[s], fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{STAT_LABELS[s]}</div>
                <div style={{ fontSize: 8, color: "#6666aa", fontFamily: "'Courier New', monospace" }}>{pokemon.evs[s]} / {pokemon.ivs[s]}</div>
              </div>
            ) : null
          ))}
        </div>
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
  const [activeTab, setActiveTab] = useState<"teams" | "sets">("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(MOCK_TEAMS[0].id);

  // Sets filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterNature, setFilterNature] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");

  const selectedTeam = MOCK_TEAMS.find(t => t.id === selectedTeamId)!;

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    MOCK_SETS.forEach(s => s.types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, []);

  const filteredSets = useMemo(() => {
    return MOCK_SETS.filter(s => {
      const matchSearch = search === "" || s.pokemonName.toLowerCase().includes(search.toLowerCase()) || s.moves.some(m => m.toLowerCase().includes(search.toLowerCase()));
      const matchType = filterType === "all" || s.types.includes(filterType);
      const matchNature = filterNature === "all" || s.nature === filterNature;
      const matchTeam = filterTeam === "all" || s.teamName === filterTeam;
      return matchSearch && matchType && matchNature && matchTeam;
    });
  }, [search, filterType, filterNature, filterTeam]);

  const allTeamNames = useMemo(() => Array.from(new Set(MOCK_SETS.map(s => s.teamName).filter(Boolean))) as string[], []);

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", backgroundImage: "radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #0d0d1a 70%)", fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column" }}>

      {/* ── Top Bar ── */}
      <header style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1e1e3a", display: "flex", alignItems: "center", gap: 10, background: "rgba(10,10,25,0.7)", backdropFilter: "blur(4px)" }}>
        <button style={{ background: "none", border: "none", color: "#6666aa", cursor: "pointer", padding: "2px 6px 2px 0", fontFamily: "'Courier New', monospace", fontSize: 18, lineHeight: 1 }} aria-label="Back">←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffe066", textShadow: "0 2px 0 #7a5a00", lineHeight: 1 }}>My Teams</h1>
          <p style={{ margin: 0, fontSize: 9, color: "#44445a", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{MOCK_TEAMS.length} teams · {MOCK_SETS.length} sets</p>
        </div>
        <div style={{ marginLeft: "auto", opacity: 0.4 }}><PokeBall/></div>
      </header>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e1e3a", background: "rgba(10,10,25,0.4)" }}>
        {(["teams", "sets"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #ffe066" : "2px solid transparent", color: activeTab === tab ? "#ffe066" : "#44445a", fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
            {tab === "teams" ? `Teams (${MOCK_TEAMS.length})` : `Sets (${MOCK_SETS.length})`}
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
              {MOCK_TEAMS.map(team => {
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
              <button style={{ width: "100%", background: "linear-gradient(180deg, #2a2a4e 0%, #16163a 100%)", border: "1px solid #3a3a6e", borderRadius: 6, color: "#ffe066", fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 3px 0 #0a0a20" }}>
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
              <button style={{ width: "100%", background: "linear-gradient(180deg, #2a2a4e 0%, #16163a 100%)", border: "1px solid #3a3a6e", borderRadius: 6, color: "#ffe066", fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 3px 0 #0a0a20" }}>
                <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span> New Set
              </button>
            </div>
          </div>
        )}

        {/* ═══ RIGHT PANEL ═══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14, minWidth: 0 }}>
          {activeTab === "teams" ? (
            <>
              {/* Team heading */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 15, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 2px 0 #7a5a00" }}>{selectedTeam.name}</div>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#4a9eda", background: "#0a1a3a", border: "1px solid #1a2a4a", borderRadius: 3, padding: "1px 6px", letterSpacing: "0.06em" }}>{selectedTeam.format}</span>
                </div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#33334a", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>Created {selectedTeam.createdAt} · {selectedTeam.pokemon.length} Pokémon</div>
                <div style={{ marginTop: 8, height: 1, background: "linear-gradient(to right, #ffe06644, transparent)" }} />
              </div>

              {/* Expanded Pokémon cards — single column for detail */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const p = selectedTeam.pokemon[i];
                  return p ? <ExpandedPokemonCard key={p.id} pokemon={p} /> : <EmptySlot key={i} />;
                })}
              </div>

              {/* Actions */}
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                {["Edit Team", "Export", "Delete"].map((label, i) => (
                  <button key={label} style={{ flex: i === 0 ? 2 : 1, background: i === 2 ? "linear-gradient(180deg, #3a1010, #1a0808)" : "linear-gradient(180deg, #1e1e3a, #12122a)", border: `1px solid ${i === 2 ? "#6e2a2a" : "#2a2a5a"}`, borderRadius: 6, color: i === 2 ? "#cc6666" : "#8888bb", fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 4px", cursor: "pointer", boxShadow: `0 2px 0 ${i === 2 ? "#100404" : "#080814"}` }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Sets grid header */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 900, color: "#ffe066", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 2px 0 #7a5a00" }}>
                  All Sets
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#44445a", fontWeight: 400, marginLeft: 8 }}>{filteredSets.length} result{filteredSets.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ marginTop: 6, height: 1, background: "linear-gradient(to right, #ffe06644, transparent)" }} />
              </div>
              {filteredSets.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {filteredSets.map(s => <PokemonSetDetails key={s.id} set={s} />)}
                </div>
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
    </div>
  );
}