import { BALANCE, getClickDamage, getClickDamageCost, getGeneratorPrice } from '../config/gameConfig';
import { formatNumber } from './Header';

interface ShopProps {
  currency: number;
  bossStage: number;
  clickDamageLevel: number;
  generatorsOwned: number[];
  totalDps: number;
  onBuyClickDamage: () => void;
  onBuyGenerator: (index: number) => void;
}

export default function Shop({
  currency,
  bossStage,
  clickDamageLevel,
  generatorsOwned,
  totalDps,
  onBuyClickDamage,
  onBuyGenerator,
}: ShopProps) {
  const clickDmg = getClickDamage(clickDamageLevel);
  const clickCost = getClickDamageCost(clickDamageLevel);
  const canAffordClick = currency >= clickCost;

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <h2 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
        <span>🛒</span> Shop
        <span className="text-xs text-gray-400 font-normal ml-auto">DPS: {formatNumber(totalDps)}/s</span>
      </h2>

      {/* Click Damage upgrade */}
      <div className="bg-gray-800/60 border border-purple-500/20 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">👆</span>
              <span className="text-white font-semibold text-sm">Click Damage</span>
              <span className="text-gray-500 text-xs">Lv.{clickDamageLevel}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Damage: {clickDmg} → {clickDmg + 1} per click
            </div>
          </div>
          <button
            onClick={onBuyClickDamage}
            disabled={!canAffordClick}
            className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              canAffordClick
                ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            💰 {formatNumber(clickCost)}
          </button>
        </div>
      </div>

      {/* Generators */}
      <div className="space-y-2">
        {BALANCE.generators.map((gen, index) => {
          const owned = generatorsOwned[index];
          const price = getGeneratorPrice(index, owned);
          const unlocked = bossStage >= gen.unlockStage;
          const canAfford = currency >= price && unlocked;
          const genDps = gen.dps * owned;

          return (
            <div
              key={gen.id}
              className={`border rounded-lg p-3 transition-all ${
                unlocked
                  ? 'bg-gray-800/60 border-purple-500/20'
                  : 'bg-gray-900/60 border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">
                      {index === 0 ? '🖐️' : index === 1 ? '🤖' : index === 2 ? '🗿' : index === 3 ? '👤' : '⚛️'}
                    </span>
                    <span className="text-white font-semibold text-sm">{gen.name}</span>
                    <span className="text-gray-500 text-xs">×{owned}</span>
                    {!unlocked && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                        🔒 Stage {gen.unlockStage}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{gen.description}</div>
                  <div className="text-xs text-cyan-400 mt-1">
                    +{gen.dps}/s each
                    {owned > 0 && (
                      <span className="text-gray-500 ml-2">| Total: {formatNumber(genDps)}/s</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onBuyGenerator(index)}
                  disabled={!canAfford}
                  className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    canAfford
                      ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                      : unlocked
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  💰 {formatNumber(price)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
