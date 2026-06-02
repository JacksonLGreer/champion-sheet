export interface PokemonSetSupa {
    id: number;
    pokemon_id: number;
    item: string;
    ability: number;
    nature: string;
    moves: [number, number, number, number];
    evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
};

export interface PokemonInfo {
    id: number;
    name: string;
    sprite: string;
    types: string[];
    baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    weight: number;
    height: number;
    pokedexNumber: number;
    abilities: number[];
    moves: number[];    
}