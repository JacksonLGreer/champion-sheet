import { TYPE_COLORS } from "../Constants/TYPE_COLORS";

export default function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.normal;
  return (
    <span style={{ background: c.bg, 
      color: c.text, 
      fontSize: 10, 
      fontFamily: "'Courier New', monospace", 
      letterSpacing: "0.2em", 
      textTransform: "uppercase", 
      padding: "2px 4px", 
      borderRadius: 6, 
      border: `1px solid ${c.bg}`, fontWeight: 700 }}>
      {type}
    </span>
  );
}