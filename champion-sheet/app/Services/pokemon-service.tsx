import { createClient } from "./supabase-client";

const supabase = createClient();


// Interface for pokemon data
export interface Pokemon {
  id: number;
  name: string;
  pokedexNum: string;

  pokemon_stats?: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };

  types?: {
    type1: string;
    type2: string | null;
  };
}

// Returns a list of all the pokemon
export async function getAllPokemon(): Promise<Pokemon[]> {
  const { data, error } = await supabase
    .from("pokemon")
    .select(`
      id,
      name,
      pokedexNum,
      pokemon_stats (
        hp,
        attack,
        defense,
        special_attack,
        special_defense,
        speed
      ),
      types (
        type1,
        type2
      )
    `)
    .order("pokedexNum", { ascending: true });

  if (error) throw error;

  //normalize Supabase response
  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    pokedexNum: p.pokedexNum,

    pokemon_stats: Array.isArray(p.pokemon_stats)
      ? p.pokemon_stats[0]
      : p.pokemon_stats,

    types: Array.isArray(p.types)
      ? p.types[0]
      : p.types,
  }));
}

// This is a helper function I used to get the pokemon data from the API. Not needed anymore but keeping for reference
export async function fetchPokemonFromAPI(pokedexNum: number) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokedexNum}`
  );

  if (!res.ok) throw new Error(`Failed ${pokedexNum}`);

  const data = await res.json();

  return {
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      special_attack: data.stats[3].base_stat,
      special_defense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    types: data.types.map((t: any) => t.type.name),
    abilties: data.abilities.map((a: any) => a.ability.name),
    moves: data.moves.map((m: any) => m.move.name),
  };
}

export async function getAbilities(abilityId: number) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/ability/${abilityId}`
  );
  const data = await res.json();
  return {
    name: data.name,
    description: data.effect_entries.find((entry: any) => entry.language.name === "en")?.effect || "",
    pokemon: data.pokemon.map((p: any) => ({
      name: p.pokemon.name,
      url: p.pokemon.url,
    })),
  }
}
// This was used to seed the stats and types tables after we added them. Not needed anymore but keeping for reference
export async function seedPokemonData() {
  const pokemonList = await getAllPokemon();

  for (const p of pokemonList) {
    const api = await fetchPokemonFromAPI(Number(p.pokedexNum));

    // 1. Insert stats
    const { error: statsError } = await supabase
      .from("pokemon_stats")
      .upsert({
        pokemon_id: p.id,
        hp: api.stats.hp,
        attack: api.stats.attack,
        defense: api.stats.defense,
        special_attack: api.stats.special_attack,
        special_defense: api.stats.special_defense,
        speed: api.stats.speed,
      });

    if (statsError) {
      console.error(`Stats error for ${p.name}`, statsError);
    }

    // 2. Insert types (simple table version)
    const { error: typeError } = await supabase
      .from("types")
      .upsert({
        pokemon_id: p.id,
        type1: api.types[0],
        type2: api.types[1] ?? null,
      });

    if (typeError) {
      console.error(`Type error for ${p.name}`, typeError);
    }

    console.log(`Seeded ${p.name}`);
  }
}

