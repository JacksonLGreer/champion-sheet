import { useState } from "react";
import Image from "next/image";

export interface GbaButtonItem {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  iconAlt?: string;
  iconSize?: number;
  topColor: string;
  bottomColor: string;
  border: string;
  textColor: string;
  badge?: boolean;
}

interface GbaButtonProps {
  item: GbaButtonItem;
  tall?: boolean;
  pressed: boolean;
  onPress: () => void;
  onRelease: () => void;
}

export default function GbaButton({
  item,
  tall = false,
  pressed,
  onPress,
  onRelease,
}: GbaButtonProps) {
  const [hovered, setHovered] = useState(false);
 
  // Dark split starts at 65% (lower) normally, rises to 45% on hover
  const splitPoint = hovered ? "45%" : "65%";
  const iconSize = item.iconSize ?? (tall ? 72 : 64);

  return (
    <button
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={() => { onRelease(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full select-none focus:outline-none"
      style={{
        minHeight: tall ? "220px" : "104px",
        borderRadius: "10px",
        border: `4px solid ${item.border}`,
        boxShadow: pressed
          ? `0 1px 0 2px ${item.border}`
          : `0 5px 0 2px ${item.border}`,
        transform: pressed ? "translateY(4px)" : "translateY(0)",
        transition: "transform 80ms, box-shadow 80ms",
        overflow: "hidden",
        padding: 0,
        cursor: "pointer",
      }}
    >
      {/* Full background — light color base */}
      <div className="absolute inset-0" style={{ background: item.topColor }} />
 
      {/* Dark bottom section — clip rises on hover */}
      <div
        className="absolute inset-0"
        style={{
          background: item.bottomColor,
          clipPath: `inset(${splitPoint} 0 0 0)`,
          transition: "clip-path 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
 
      {/* Thin highlight line at top */}
      <div
        className="absolute left-2 right-2 top-1.5 h-[3px] rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.35)" }}
      />
 
      {/* Hover sheen sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 200ms",
        }}
      />
 
      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full"
        style={{ minHeight: tall ? "220px" : "104px", padding: "12px 8px" }}
      >
        {item.badge && (
          <span
            className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
            style={{
              background: "#ffe066",
              color: "#7a3a00",
              border: "2px solid #b06000",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Event!
          </span>
        )}
 
        {/* Icon image */}
        <div
          className="relative drop-shadow-lg"
          style={{
            width: iconSize,
            height: iconSize,
            flexShrink: 0,
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Image
            src={item.icon}
            alt={item.iconAlt ?? item.label}
            fill
            sizes={`${iconSize}px`}
            className="object-contain"
            draggable={false}
          />
        </div>
 
        <span
          className="font-black tracking-widest uppercase"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: tall ? "1.6rem" : "1rem",
            color: item.textColor,
            textShadow: `0 2px 0 ${item.border}, 0 -1px 0 rgba(255,255,255,0.15)`,
            letterSpacing: "0.12em",
          }}
        >
          {item.label}
        </span>
 
        <span
          className="uppercase tracking-widest"
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "0.6rem",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {item.sublabel}
        </span>
      </div>
    </button>
  );
}