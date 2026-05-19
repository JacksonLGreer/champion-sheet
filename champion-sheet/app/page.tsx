"use client";
import { useEffect, useState } from "react";
import { fetchPokemonFromAPIName, Pokemon, getAllPokemon } from "./Services/pokemon-service";
import Stat from "./Components/Stat";
import GbaButton, { type GbaButtonItem } from "./Components/gbaButton";
import { useRouter } from "next/navigation";
import HomePage from "./home/page";
import { createClient } from "./Services/supabase/supabase-client";


export default function Home() {

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        router.push('/home');
      }
  }
  checkSession()
  }, []);

 
  return (
      <div />
  );
}
