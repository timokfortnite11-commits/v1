import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, createDefaultState, SAVE_KEY } from '../types';
import {
  getBossHealth,
  getBossReward,
  getClickDamage,
  getClickDamageCost,
  getGeneratorPrice,
  BALANCE,
} from '../config/gameConfig';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate and fill defaults
      const defaults = createDefaultState();
      const state: GameState = {
        currency: typeof parsed.currency === 'number' && parsed.currency >= 0 ? parsed.currency : defaults.currency,
        bossStage: typeof parsed.bossStage === 'number' && parsed.bossStage >= 1 ? parsed.bossStage : defaults.bossStage,
        bossCurrentHealth: typeof parsed.bossCurrentHealth === 'number' ? parsed.bossCurrentHealth : defaults.bossCurrentHealth,
        clickDamageLevel: typeof parsed.clickDamageLevel === 'number' && parsed.clickDamageLevel >= 0 ? parsed.clickDamageLevel : defaults.clickDamageLevel,
        generatorsOwned: Array.isArray(parsed.generatorsOwned) && parsed.generatorsOwned.length === 5
          ? parsed.generatorsOwned.map((v: unknown) => typeof v === 'number' && v >= 0 ? v : 0)
          : defaults.generatorsOwned,
        bestStage: typeof parsed.bestStage === 'number' && parsed.bestStage >= 1 ? parsed.bestStage : defaults.bestStage,
      };
      // Ensure boss health is valid
      const maxHp = getBossHealth(state.bossStage);
      if (state.bossCurrentHealth <= 0 || state.bossCurrentHealth > maxHp) {
        state.bossCurrentHealth = maxHp;
      }
      return state;
    }
  } catch {
    // ignore
  }
  return createDefaultState();
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save on state change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveState(stateRef.current);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  // Save on unload
  useEffect(() => {
    const handleUnload = () => saveState(stateRef.current);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Calculate total DPS
  const getTotalDps = useCallback(() => {
    let total = 0;
    for (let i = 0; i < BALANCE.generators.length; i++) {
      total += BALANCE.generators[i].dps * state.generatorsOwned[i];
    }
    return total;
  }, [state.generatorsOwned]);

  // Passive damage tick
  const lastTickRef = useRef(performance.now());
  const bossDyingRef = useRef(false);

  useEffect(() => {
    let animFrame: number;
    // Reset tick time to avoid huge delta on effect recreation
    lastTickRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTickRef.current) / 1000, 1); // cap at 1 second
      lastTickRef.current = now;

      if (bossDyingRef.current) {
        animFrame = requestAnimationFrame(tick);
        return;
      }

      const totalDps = getTotalDps();
      if (totalDps <= 0) {
        animFrame = requestAnimationFrame(tick);
        return;
      }

      const passiveDamage = totalDps * delta;

      setState(prev => {
        const bossMaxHealth = getBossHealth(prev.bossStage);
        const newHealth = Math.max(0, prev.bossCurrentHealth - passiveDamage);

        if (newHealth <= 0 && prev.bossCurrentHealth > 0) {
          // Boss died
          bossDyingRef.current = true;
          const reward = getBossReward(prev.bossStage);
          const newStage = prev.bossStage + 1;
          const newBest = Math.max(prev.bestStage, newStage);

          // Schedule state transition
          setTimeout(() => {
            bossDyingRef.current = false;
            setState(p => ({
              ...p,
              bossStage: newStage,
              bossCurrentHealth: getBossHealth(newStage),
              bestStage: newBest,
            }));
          }, 100);

          return {
            ...prev,
            bossCurrentHealth: 0,
            currency: prev.currency + reward,
            bestStage: newBest,
          };
        }

        return { ...prev, bossCurrentHealth: newHealth };
      });

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [getTotalDps]);

  // Click on boss
  const clickBoss = useCallback(() => {
    if (bossDyingRef.current) return;

    setState(prev => {
      const damage = getClickDamage(prev.clickDamageLevel);
      const newHealth = Math.max(0, prev.bossCurrentHealth - damage);

      if (newHealth <= 0 && prev.bossCurrentHealth > 0) {
        // Boss died from click
        bossDyingRef.current = true;
        const reward = getBossReward(prev.bossStage);
        const newStage = prev.bossStage + 1;
        const newBest = Math.max(prev.bestStage, newStage);

        setTimeout(() => {
          bossDyingRef.current = false;
          setState(p => ({
            ...p,
            bossStage: newStage,
            bossCurrentHealth: getBossHealth(newStage),
            bestStage: newBest,
          }));
        }, 100);

        return {
          ...prev,
          bossCurrentHealth: 0,
          currency: prev.currency + reward,
          bestStage: newBest,
        };
      }

      return { ...prev, bossCurrentHealth: newHealth };
    });
  }, []);

  // Buy click damage upgrade
  const buyClickDamage = useCallback(() => {
    setState(prev => {
      const cost = getClickDamageCost(prev.clickDamageLevel);
      if (prev.currency < cost) return prev;
      return {
        ...prev,
        currency: prev.currency - cost,
        clickDamageLevel: prev.clickDamageLevel + 1,
      };
    });
  }, []);

  // Buy generator
  const buyGenerator = useCallback((index: number) => {
    setState(prev => {
      const gen = BALANCE.generators[index];
      if (prev.bossStage < gen.unlockStage) return prev;
      const cost = getGeneratorPrice(index, prev.generatorsOwned[index]);
      if (prev.currency < cost) return prev;

      const newOwned = [...prev.generatorsOwned];
      newOwned[index] = newOwned[index] + 1;

      return {
        ...prev,
        currency: prev.currency - cost,
        generatorsOwned: newOwned,
      };
    });
  }, []);

  // Derived values
  const currentClickDamage = getClickDamage(state.clickDamageLevel);
  const nextClickDamageCost = getClickDamageCost(state.clickDamageLevel);
  const bossMaxHealth = getBossHealth(state.bossStage);
  const bossReward = getBossReward(state.bossStage);
  const totalDps = getTotalDps();

  return {
    state,
    currentClickDamage,
    nextClickDamageCost,
    bossMaxHealth,
    bossReward,
    totalDps,
    clickBoss,
    buyClickDamage,
    buyGenerator,
  };
}
