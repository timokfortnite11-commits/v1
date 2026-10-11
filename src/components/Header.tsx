import { GameState } from '../types';
import { getBossHealth, getBossReward } from '../config/gameConfig';

interface HeaderProps {
  state: GameState;
  totalDps: number;
  currentClickDamage: number;
  bossMaxHealth: number;
  bossReward: number;
}

function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export default function Header({ state, totalDps, currentClickDamage, bossMaxHealth, bossReward }: HeaderProps) {
  return (
    <div className="bg-gray-900/80 border-b border-purple-500/30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold text-lg">VERITY</span>
          <span className="text-gray-400 text-sm">BOSS CLICKER</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">💰</span>
            <span className="text-yellow-300 font-mono font-bold">{formatNumber(state.currency)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-400">⚔️</span>
            <span className="text-red-300 font-mono">{formatNumber(currentClickDamage)}/click</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-cyan-400">🔥</span>
            <span className="text-cyan-300 font-mono">{formatNumber(totalDps)}/s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-400">🏆</span>
            <span className="text-purple-300 font-mono">Best: {state.bestStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { formatNumber };
