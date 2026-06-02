import { PokemonSet } from "./PokemonInterface";

export interface Team {
  id: string;
  name: string;
  format: string;
  created_at: string;
  trainer_id: string;
  pokemon1: PokemonSet | null;
  pokemon2: PokemonSet | null;
  pokemon3: PokemonSet | null;
  pokemon4: PokemonSet | null;
  pokemon5: PokemonSet | null;
  pokemon6: PokemonSet | null;
}