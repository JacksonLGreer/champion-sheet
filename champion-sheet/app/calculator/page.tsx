"use client"
import { useEffect, useState } from "react";
import { fetchPokemonFromAPIName, Pokemon, getAllPokemon } from "../Services/pokemon-service";


export default function Calculator() {

    return (
        <div className="w-full h-screen bg-green-900 flex items-center justify-center">
            <h1 className="text-4xl text-white font-bold">Calculator Page</h1>
        </div>  
    )
}