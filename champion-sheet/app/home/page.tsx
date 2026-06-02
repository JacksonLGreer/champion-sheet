"use client";
import { useEffect, useState } from "react";
import { fetchPokemonFromAPIName, Pokemon, getAllPokemon, seedPokemonData } from "../Services/pokemon-service";
import Stat from "../Components/Stat";
import GbaMenuButton, { type GbaButtonItem } from "../Components/gbaMenuButton";
import Pokeball from "../Components/pokeball";
import { useRouter } from "next/navigation";

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
    badge: false,
  },
  {
    id: "teams",
    label: "TEAMS",
    sublabel: "Your Pokémon Teams and Builds",
    icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png`,
    iconAlt: "Teams",
    topColor: "#4a9eda",
    bottomColor: "#1a5a8b",
    border: "#0a1a3a",
    textColor: "#fff",
    badge: false,
  },
  {
    id: "log",
    label: "LOG",
    sublabel: "Battle Logs and Notes",
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

const routes: Record<string, string> = {
    battle: "/battle",
    teams: "/teams",
    notes: "/notes",
    calculator: "/calculator",
    profile: "/profile",
  };

export default function Home() {


  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);
 
  const battle = menuItems[0];
  const grid = menuItems.slice(1);
  

   
  useEffect(() => {
    async function loadPokemon() {
      try {
        const pokemon = await fetchPokemonFromAPIName("charizard-mega-x");

        console.log(pokemon);
      } catch (error) {
        console.error(error);
      }
    }

    loadPokemon();
  }, []);

   
  
  

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
          <Pokeball />
        </div>
 
        <h1
          className="text-3xl font-black tracking-widest uppercase"
          style={{
            fontFamily: "'Courier New', monospace",
            color: "#ffe066",
            textShadow: "0 3px 0 #7a5a00, 0 0 20px rgba(255,200,0,0.3)",
          }}
        >
          Champions Sheet
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
          <GbaMenuButton
            item={battle}
            tall
            pressed={pressed === battle.id}
            onPress={() => setPressed(battle.id)}
            onRelease={() => { 
              if (pressed === battle.id) {
                router.push(routes[battle.id]);
              }
              setPressed(null);
            }}
          />
        </div>
 
        {grid.map((item) => (
          <GbaMenuButton
            key={item.id}
            item={item}
            pressed={pressed === item.id}
            onPress={() => setPressed(item.id)}
            onRelease={() => { 
              if (pressed === item.id) {   // ← only navigate if THIS button was pressed
                router.push(routes[item.id]);
              }
              setPressed(null);
            }}
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
