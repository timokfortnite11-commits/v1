import { useGameState } from './hooks/useGameState';
import Header from './components/Header';
import BossArea from './components/BossArea';
import Shop from './components/Shop';

export default function App() {
  const {
    state,
    currentClickDamage,
    bossMaxHealth,
    bossReward,
    totalDps,
    clickBoss,
    buyClickDamage,
    buyGenerator,
  } = useGameState();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <Header
        state={state}
        totalDps={totalDps}
        currentClickDamage={currentClickDamage}
        bossMaxHealth={bossMaxHealth}
        bossReward={bossReward}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-4 overflow-y-auto pb-6">
        {/* Boss area */}
        <div className="w-full lg:w-auto lg:flex-1 flex justify-center pt-4">
          <BossArea
            bossStage={state.bossStage}
            bossCurrentHealth={state.bossCurrentHealth}
            bossMaxHealth={bossMaxHealth}
            bossReward={bossReward}
            totalDps={totalDps}
            onClickBoss={clickBoss}
          />
        </div>

        {/* Shop */}
        <div className="w-full lg:w-96 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto">
          <Shop
            currency={state.currency}
            bossStage={state.bossStage}
            clickDamageLevel={state.clickDamageLevel}
            generatorsOwned={state.generatorsOwned}
            totalDps={totalDps}
            onBuyClickDamage={buyClickDamage}
            onBuyGenerator={buyGenerator}
          />
        </div>
      </div>
    </div>
  );
}
