"use client";
import { useAppStore } from "@/lib/store";

const ITEMS = [
  { id: "hat-crown", name: "Crown Hat", cost: 50 },
  { id: "hat-cap", name: "Blue Cap", cost: 20 },
  { id: "streak-freeze", name: "Streak Freeze (1 day)", cost: 15 },
];

export default function ShopPage() {
  const { coins, inventory, purchase } = useAppStore();
  function buy(itemId: string, cost: number) {
    const ok = purchase(itemId, cost);
    if (!ok) alert("Not enough coins");
  }
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Shop</h1>
      <div className="text-white/70">Coins: {coins}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ITEMS.map((it) => (
          <div key={it.id} className="card p-4 grid gap-2">
            <div className="font-semibold">{it.name}</div>
            <div className="text-sm text-white/70">Cost: {it.cost} 🪙</div>
            <button className="btn btn-primary w-fit" onClick={() => buy(it.id, it.cost)} disabled={inventory.includes(it.id)}>
              {inventory.includes(it.id) ? "Owned" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 