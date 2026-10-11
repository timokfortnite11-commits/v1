// Все параметры баланса собраны в одном месте для удобства изменения

export const BALANCE = {
  // Босс
  boss: {
    baseHealth: 35,
    healthMultiplier: 1.45,
    baseReward: 15,
    rewardMultiplier: 1.4,
  },

  // Ручной урон
  clickDamage: {
    baseDamage: 1,
    damagePerLevel: 1,
    baseCost: 12,
    costMultiplier: 1.5,
  },

  // Генераторы (пассивный урон)
  generators: [
    {
      id: 'cursed-finger',
      name: 'Cursed Finger',
      description: 'A spectral digit that taps endlessly.',
      basePrice: 30,
      priceMultiplier: 1.25,
      dps: 3,
      unlockStage: 1,
    },
    {
      id: 'glitch-drone',
      name: 'Glitch Drone',
      description: 'A corrupted drone buzzing with malice.',
      basePrice: 120,
      priceMultiplier: 1.25,
      dps: 15,
      unlockStage: 3,
    },
    {
      id: 'nightmare-idol',
      name: 'Nightmare Idol',
      description: 'An ancient idol radiating dread.',
      basePrice: 450,
      priceMultiplier: 1.25,
      dps: 65,
      unlockStage: 6,
    },
    {
      id: 'verity-clone',
      name: 'Verity Clone',
      description: 'A shadow copy of Verity herself.',
      basePrice: 1700,
      priceMultiplier: 1.25,
      dps: 270,
      unlockStage: 10,
    },
    {
      id: 'void-reactor',
      name: 'Void Reactor',
      description: 'A reactor channeling the void itself.',
      basePrice: 6500,
      priceMultiplier: 1.25,
      dps: 1100,
      unlockStage: 15,
    },
  ],
} as const;

// Формулы

export function getBossHealth(stage: number): number {
  return Math.round(
    BALANCE.boss.baseHealth * Math.pow(BALANCE.boss.healthMultiplier, stage - 1)
  );
}

export function getBossReward(stage: number): number {
  return Math.round(
    BALANCE.boss.baseReward * Math.pow(BALANCE.boss.rewardMultiplier, stage - 1)
  );
}

export function getClickDamage(level: number): number {
  return BALANCE.clickDamage.baseDamage + BALANCE.clickDamage.damagePerLevel * level;
}

export function getClickDamageCost(level: number): number {
  return Math.round(
    BALANCE.clickDamage.baseCost * Math.pow(BALANCE.clickDamage.costMultiplier, level)
  );
}

export function getGeneratorPrice(generatorIndex: number, owned: number): number {
  const gen = BALANCE.generators[generatorIndex];
  return Math.round(gen.basePrice * Math.pow(gen.priceMultiplier, owned));
}
