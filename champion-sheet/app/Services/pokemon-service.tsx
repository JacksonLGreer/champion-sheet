import { createClient } from "./supabase/supabase-client";

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

  abilities?: string[];
  moves?: string[];
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
      ),
      pokemon_abilities (
        abilities (
          id,
          name
        )
      ),

      pokemon_moves (
        moves (
          id,
          name
        )
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

    abilities:
      p.pokemon_abilities?.map((row: any) => row.abilities).filter(Boolean) ?? [],

    moves:
      p.pokemon_moves?.map((row: any) => row.moves).filter(Boolean) ?? [],
  }));
}

// This is a helper function I used to get the pokemon data from the API. Not needed anymore but keeping for reference
export async function fetchPokemonFromAPIPokedex(pokedexNum: number) {
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

// This is a helper function I used to get the pokemon data from the API. Not needed anymore but keeping for reference
export async function fetchPokemonFromAPIName(name: string) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name}`
  );

  if (!res.ok) throw new Error(`Failed ${name}`);

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
    abilities: data.abilities?.map((a: any) => a.ability.name) ?? [],
    moves: data.moves?.map((m: any) => m.move.name) ?? [],
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

// This was used to seed the stats and types tables after we added them.
export async function seedPokemonData() {
  const pokemonList = await getAllPokemon();

  for (const p of pokemonList) {
    const api = await fetchPokemonFromAPIName(String(p.name));

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

    // 3. Insert Abilities
      console.log("API abilities:", api.abilities);

    if (api.abilities?.length) {
      // Convert API names to DB format
      const formattedAbilities = api.abilities.map(formatNameForDB);

      // Find matching abilities in DB
      const { data: abilityRows, error: abilityLookupError } =
        await supabase
          .from("abilities")
          .select("id, name")
          .in("name", formattedAbilities);

      if (abilityLookupError) {
        console.error(
          `Ability lookup error for ${p.name}`,
          abilityLookupError
        );
      } else if (abilityRows?.length) {
        // Create relation rows
        const abilityRelations = abilityRows.map((a) => ({
          pokemon_id: p.id,
          ability_id: a.id,
        }));

        // Insert into junction table
        const { error: abilityInsertError } = await supabase
          .from("pokemon_abilities")
          .upsert(abilityRelations, {
            onConflict: "pokemon_id,ability_id",
          });

        if (abilityInsertError) {
          console.error(
            `Ability relation error for ${p.name}`,
            abilityInsertError
          );
        }
      }
    }

    // 4. Moves
    if (api.moves?.length) {
      // Convert API names to DB format
      const formattedMoves = api.moves.map(formatNameForDB);

      // Find matching moves in DB
      const { data: moveRows, error: moveLookupError } =
        await supabase
          .from("moves")
          .select("id, name")
          .in("name", formattedMoves);

      if (moveLookupError) {
        console.error(
          `Move lookup error for ${p.name}`,
          moveLookupError
        );
      } else if (moveRows?.length) {
        // Create relation rows
        const moveRelations = moveRows.map((m) => ({
          pokemon_id: p.id,
          move_id: m.id,
        }));

        // Insert into junction table
        const { error: moveInsertError } = await supabase
          .from("pokemon_moves")
          .upsert(moveRelations, {
            onConflict: "pokemon_id,move_id",
          });

        if (moveInsertError) {
          console.error(
            `Move relation error for ${p.name}`,
            moveInsertError
          );
        }
      }
    }

    console.log(`Seeded ${p.name}`);
  }
}

// Used to normalize names of moves/abilities to fit into DB
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");
}

// Used to normalize names of moves/abilities to fit into DB
function formatNameForDB(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

