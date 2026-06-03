import { createClient } from "./supabase/supabase-client";
import { PokemonSet } from "../Constants/PokemonInterface";

const SET_FRAGMENT = `
  id, item, nature, set_name,
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

function shapeSet(s: any): PokemonSet {
  return {
    id: s.id,
    set_name: s.set_name,
    item: s.item,
    nature: s.nature,
    evs: {
      hp: s.hp_ev, 
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
  };
}

export async function getUserSets(trainerId: string): Promise<PokemonSet[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pokemon_sets")
    .select(SET_FRAGMENT)
    .eq("trainer_id", trainerId)
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(shapeSet);
}

export async function getTeams(trainerId: string) {
  const supabase = createClient();
  const SLOT_FRAGMENT = `( ${SET_FRAGMENT} )`;
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id, name, format, created_at, trainer_id,
      pokemon1:pokemon_sets!pokemon1 ${SLOT_FRAGMENT},
      pokemon2:pokemon_sets!pokemon2 ${SLOT_FRAGMENT},
      pokemon3:pokemon_sets!pokemon3 ${SLOT_FRAGMENT},
      pokemon4:pokemon_sets!pokemon4 ${SLOT_FRAGMENT},
      pokemon5:pokemon_sets!pokemon5 ${SLOT_FRAGMENT},
      pokemon6:pokemon_sets!pokemon6 ${SLOT_FRAGMENT}
    `)
    .eq("trainer_id", trainerId);
  if (error) throw error;
  return (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    format: t.format,
    created_at: t.created_at,
    trainer_id: t.trainer_id,
    pokemon1: t.pokemon1 ? shapeSet(t.pokemon1) : null,
    pokemon2: t.pokemon2 ? shapeSet(t.pokemon2) : null,
    pokemon3: t.pokemon3 ? shapeSet(t.pokemon3) : null,
    pokemon4: t.pokemon4 ? shapeSet(t.pokemon4) : null,
    pokemon5: t.pokemon5 ? shapeSet(t.pokemon5) : null,
    pokemon6: t.pokemon6 ? shapeSet(t.pokemon6) : null,
  }));
}