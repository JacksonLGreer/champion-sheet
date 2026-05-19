"use client";
import { useEffect, useState } from "react";
import { fetchPokemonFromAPIName, Pokemon, getAllPokemon } from "../Services/pokemon-service";
import Stat from "../Components/Stat";
 

export default function basicdex() {

  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedPokemon = pokemon[selectedIndex];

  useEffect(() => {
    getAllPokemon().then(setPokemon).catch(console.error);
    fetchPokemonFromAPIName("venusaur").then(console.log).catch(console.error);

  }, []);
  
  return (
    <div className="w-full h-screen bg-blue-900 flex items-center justify-center">
  
  {/* FRAME */}
  <div className="w-[900px] h-[500px] bg-blue-800 border-4 border-black rounded-xl flex flex-col overflow-hidden">
    
    {/* TOP SECTION */}
    <div className="flex flex-1 min-h-0">

      {/* LEFT PANEL */}
      <div className="w-1/4 bg-blue-700 border-r-2 border-black p-3 text-white text-sm flex flex-col min-h-0">

  {selectedPokemon ? (
    <>
      {/* NAME */}
      <div className="mb-3">
        <h2 className="text-lg font-bold capitalize">
          {selectedPokemon.name}
        </h2>
        <p className="text-xs opacity-70">
          #{selectedPokemon.pokedexNum}
        </p>
      </div>

      {/* TYPES */}
      <div className="mb-4">
        <p className="font-semibold mb-1">TYPE</p>
        <div className="flex gap-2">
          {[selectedPokemon.types?.type1,
            selectedPokemon.types?.type2]
            .filter(Boolean)
            .map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-blue-500 rounded text-xs capitalize"
              >
                {type}
              </span>
            ))}
        </div>
      </div>

      {/* STATS */}
      <div className="space-y-1">
        <p className="font-semibold mb-1">STATS</p>

        <Stat label="HP" value={selectedPokemon.pokemon_stats?.hp} />
        <Stat label="ATK" value={selectedPokemon.pokemon_stats?.attack} />
        <Stat label="DEF" value={selectedPokemon.pokemon_stats?.defense} />
        <Stat label="SPA" value={selectedPokemon.pokemon_stats?.special_attack} />
        <Stat label="SPD" value={selectedPokemon.pokemon_stats?.special_defense} />
        <Stat label="SPD" value={selectedPokemon.pokemon_stats?.speed} />
      </div>
    </>
  ) : (
    <p>Select a Pokémon</p>
  )}
</div>

      {/* CENTER PANEL */}
      <div className="w-2/4 bg-blue-600 flex items-center justify-center border-r-2 border-black min-h-0">
        <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center">
          {selectedPokemon ? (
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.pokedexNum}.png`}
              alt={selectedPokemon.name}
              className="w-32 h-32"
            />
          ) : (
            <span className="text-black">Sprite</span>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/4 bg-blue-700 text-white text-sm flex flex-col min-h-0">

        {/* HEADER */}
        <div className="p-2 border-b border-black font-bold shrink-0">
          POKÉMON
        </div>

        {/* SCROLLABLE LIST */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {pokemon.map((p, i) => (
            <div
              key={p.id}
              onClick={() => setSelectedIndex(i)}
              className={`p-2 border-b border-blue-900 cursor-pointer ${
                selectedIndex === i
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-blue-600"
              }`}
            >
              #{p.id} {p.name}
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* BOTTOM BAR */}
    <div className="h-12 bg-blue-900 border-t-2 border-black flex items-center justify-between px-4 text-white text-xs shrink-0">
      <span>MENU</span>
      <span>SELECT</span>
      <span>EXIT</span>
    </div>

  </div>
</div>
    
  );
}
