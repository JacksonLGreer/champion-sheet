"use client";
import { useEffect, useState } from "react";
import { fetchPokemonFromAPI, Pokemon, getAllPokemon } from "./Services/pokemon-service";
import Stat from "./Components/Stat";
import GbaButton, { type GbaButtonItem } from "./Components/gbaButton";


const menuItemsOG = [
  {
    id: "battle",
    label: "BATTLE",
    sublabel: "Event Ongoing!",
    span: "large",
    icon: "`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png`",
    gradient: "from-red-600 via-orange-500 to-yellow-400",
    glow: "shadow-orange-500/50",
    badge: true,
  },
  {
    id: "teams",
    label: "TEAMS",
    sublabel: "Your Pokémon Teams",
    span: "small",
    icon: "📦",
    gradient: "from-blue-500 to-cyan-400",
    glow: "shadow-cyan-400/40",
    badge: false,
  },
  {
    id: "notes",
    label: "NOTES",
    sublabel: "Training Logs & Ideas",
    span: "small",
    icon: "🏋️",
    gradient: "from-green-500 to-emerald-400",
    glow: "shadow-emerald-400/40",
    badge: false,
  },
  {
    id: "calculator",
    label: "CALCULATOR",
    sublabel: "Quick Battle Stats",
    span: "small",
    icon: "🤝",
    gradient: "from-purple-600 to-violet-400",
    glow: "shadow-violet-400/40",
    badge: false,
  },
  {
    id: "profile",
    label: "PROFILE",
    sublabel: "Your Profile Info",
    span: "small",
    icon: "🛍️",
    gradient: "from-yellow-500 to-amber-400",
    glow: "shadow-amber-400/40",
    badge: false,
  },
];

const menuItems: GbaButtonItem[] = [
  {
    id: "battle",
    label: "BATTLE",
    sublabel: "Event Ongoing!",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png`,
    iconAlt: "Battle",
    iconSize: 80,
    topColor: "#e05252",
    bottomColor: "#8b1a1a",
    border: "#3a0a0a",
    textColor: "#fff",
    badge: true,
  },
  {
    id: "teams",
    label: "TEAMS",
    sublabel: "Your Pokémon Teams",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png`,
    iconAlt: "Teams",
    topColor: "#4a9eda",
    bottomColor: "#1a5a8b",
    border: "#0a1a3a",
    textColor: "#fff",
    badge: false,
  },
  {
    id: "notes",
    label: "NOTES",
    sublabel: "Battle Notes",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png`,
    iconAlt: "Notes",
    topColor: "#5aba6a",
    bottomColor: "#1a6b2a",
    border: "#0a2a10",
    textColor: "#fff",
    badge: false,
  },
  {
    id: "calculator",
    label: "CALCULATOR",
    sublabel: "Quick Battle Stats",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png`,
    iconAlt: "Calculator",
    topColor: "#c47cda",
    bottomColor: "#6b1a8b",
    border: "#2a0a3a",
    textColor: "#fff",
    badge: false,
  },
  {
    id: "profile",
    label: "PROFILE",
    sublabel: "Your Profile",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/981.png`,
    iconAlt: "Profile",
    topColor: "#e8b84b",
    bottomColor: "#8b6010",
    border: "#3a2500",
    textColor: "#fff",
    badge: false,
  },
];
export default function Home() {


 
  const [pressed, setPressed] = useState<string | null>(null);
 
  const battle = menuItems[0];
  const grid = menuItems.slice(1);
  
  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{
        background: "#1a1a2e",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #0d0d1a 70%)",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* ── Header ── */}
      <header className="w-full max-w-md mb-8 text-center">
        <div className="flex justify-center mb-3">
          <div className="relative w-14 h-14">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "4px solid #c00",
                animation: "spin-slow 8s linear infinite",
              }}
            />
            <div
              className="absolute inset-2 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg,#e00 50%,#fff 50%)",
                border: "3px solid #333",
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#fff", border: "2px solid #555" }}
              />
            </div>
          </div>
        </div>
 
        <h1
          className="text-3xl font-black tracking-widest uppercase"
          style={{
            fontFamily: "'Courier New', monospace",
            color: "#ffe066",
            textShadow: "0 3px 0 #7a5a00, 0 0 20px rgba(255,200,0,0.3)",
          }}
        >
          Pokémon Champions
        </h1>
        <p
          className="mt-1 text-xs tracking-widest uppercase"
          style={{ color: "#8888aa" }}
        >
          Battle Calculator &amp; Notes
        </p>
 
        <div
          className="mt-3 mx-auto h-0.5 w-32 rounded-full"
          style={{
            background:
              "linear-gradient(to right, transparent, #ffe066, transparent)",
          }}
        />
      </header>
 
      {/* ── Menu Grid ── */}
      <main className="w-full max-w-md grid grid-cols-2 gap-3">
        {/* BATTLE spans 2 rows */}
        <div className="row-span-2">
          <GbaButton
            item={battle}
            tall
            pressed={pressed === battle.id}
            onPress={() => setPressed(battle.id)}
            onRelease={() => setPressed(null)}
          />
        </div>
 
        {grid.map((item) => (
          <GbaButton
            key={item.id}
            item={item}
            pressed={pressed === item.id}
            onPress={() => setPressed(item.id)}
            onRelease={() => setPressed(null)}
          />
        ))}
      </main>
 
      <footer
        className="mt-8 text-xs tracking-wide uppercase"
        style={{ color: "#44445a" }}
      >
        Tap a button to begin · v1.0
      </footer>
 
      <style jsx global>{`
        @keyframes spin-slow {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
      
  );
}
