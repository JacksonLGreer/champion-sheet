export default function Stat({ label, value = 0 }: { label: string; value?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-blue-900 h-2 rounded">
        <div
          className="bg-green-400 h-2 rounded"
          style={{ width: `${(value / 150) * 100}%` }}
        />
      </div>
    </div>
  );
}