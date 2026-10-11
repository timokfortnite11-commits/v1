export interface GameState {
  currency: number;
  bossStage: number;
  bossCurrentHealth: number;
  clickDamageLevel: number;
  generatorsOwned: number[]; // количество каждого генератора
  bestStage: number;
}

export const SAVE_KEY = 'verity-boss-clicker-save';

export function createDefaultState(): GameState {
  return {
    currency: 0,
    bossStage: 1,
    bossCurrentHealth: 35,
    clickDamageLevel: 0,
    generatorsOwned: [0, 0, 0, 0, 0],
    bestStage: 1,
  };
}
