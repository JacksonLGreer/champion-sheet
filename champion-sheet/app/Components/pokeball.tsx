import Image from "next/image";

export default function Pokeball() {
    return (
        <div className="relative w-14 h-14 mb-3">
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
    )
} 

