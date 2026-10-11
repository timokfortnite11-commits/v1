import { useState } from 'react';
import { formatNumber } from './Header';

interface BossAreaProps {
  bossStage: number;
  bossCurrentHealth: number;
  bossMaxHealth: number;
  bossReward: number;
  totalDps: number;
  onClickBoss: () => void;
}

const BOSS_NAMES = [
  'Shadow Wisp', 'Corrupted Sprite', 'Glitch Phantom', 'Void Crawler',
  'Nightmare Shade', 'Digital Wraith', 'Pixel Demon', 'Data Serpent',
  'Code Behemoth', 'Null Titan', 'Error Colossus', 'Overflow Beast',
  'Stack Leviathan', 'Memory Horror', 'Kernel Abomination',
];

function getBossName(stage: number): string {
  return BOSS_NAMES[(stage - 1) % BOSS_NAMES.length];
}

export default function BossArea({
  bossStage,
  bossCurrentHealth,
  bossMaxHealth,
  bossReward,
  totalDps,
  onClickBoss,
}: BossAreaProps) {
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const healthPercent = bossMaxHealth > 0 ? (bossCurrentHealth / bossMaxHealth) * 100 : 0;
  const bossName = getBossName(bossStage);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClickBoss();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setClickEffects(prev => [...prev.slice(-5), { id, x, y }]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(ef => ef.id !== id));
    }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Stage info */}
      <div className="text-center">
        <div className="text-purple-300 text-sm font-medium">Stage {bossStage}</div>
        <div className="text-white text-xl font-bold">{bossName}</div>
      </div>

      {/* Boss area */}
      <div
        className="relative w-64 h-64 md:w-80 md:h-80 rounded-full cursor-pointer select-none active:scale-95 transition-transform"
        onClick={handleClick}
        style={{
          background: 'radial-gradient(circle at 40% 40%, #4c1d95, #1e1b4b, #0f0a1e)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Boss icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl md:text-7xl animate-pulse">
            {bossStage <= 5 ? '👾' : bossStage <= 10 ? '🐉' : bossStage <= 15 ? '💀' : '🌑'}
          </div>
        </div>

        {/* Click effects */}
        {clickEffects.map(ef => (
          <div
            key={ef.id}
            className="absolute pointer-events-none text-yellow-300 font-bold text-lg animate-bounce"
            style={{
              left: ef.x,
              top: ef.y,
              animation: 'floatUp 0.8s ease-out forwards',
            }}
          >
            HIT!
          </div>
        ))}
      </div>

      {/* Health bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>HP: {formatNumber(bossCurrentHealth)} / {formatNumber(bossMaxHealth)}</span>
          <span>Reward: 💰{formatNumber(bossReward)}</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full transition-all duration-100 rounded-full"
            style={{
              width: `${Math.max(0, healthPercent)}%`,
              background: healthPercent > 50
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : healthPercent > 25
                  ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                  : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>
      </div>

      {/* DPS indicator */}
      {totalDps > 0 && (
        <div className="text-cyan-400 text-sm font-mono animate-pulse">
          🔥 {formatNumber(totalDps)} DPS active
        </div>
      )}
    </div>
  );
}
