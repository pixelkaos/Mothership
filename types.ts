export interface ShipClassStatus {
  range: [number, number];
  class: string;
  status: string;
  survivors: string;
  systems: string;
  salvage: SalvageItem[];
}

export interface SalvageItem {
    dice: string;
    item: string;
}

export interface DerelictShip {
  name: string;
  shipClass: string;
  status: string;
  systems: string;
  survivors: string;
  causeOfRuination: string;
  weirdTrait: string;
  cargo: string;
  salvage: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}


// Character Creator Types
export type Stat = 'strength' | 'speed' | 'intellect' | 'combat';
export type Save = 'sanity' | 'fear' | 'body';
export type ClassName = 'Marine' | 'Android' | 'Scientist' | 'Teamster';
export type SkillTier = 'trained' | 'expert' | 'master';

export interface CharacterStats {
  strength: number;
  speed: number;
  intellect: number;
  combat: number;
}

export interface CharacterSaves {
  sanity: number;
  fear: number;
  body: number;
}

export interface CharacterClass {
  name: ClassName;
  description: string;
  stats_mods: Partial<CharacterStats>;
  saves_mods: Partial<CharacterSaves>;
  max_wounds_mod: number;
  starting_skills: string[];
  bonus_skills: {
    trained: number;
    expert: number;
    master: number;
  };
  trauma_response: string;
}

export interface Character {
  name: string;
  pronouns: string;
  notes: string;
  backstory: string;
  portrait: string; // base64 data URL
  stats: CharacterStats;
  saves: CharacterSaves;
  class: CharacterClass | null;
  health: {
    current: number;
    max: number;
  };
  wounds: {
    current: number;
    max: number;
  };
  stress: {
    current: number;
    minimum: number;
  };
  skills: {
    trained: string[];
    expert: string[];
    master: string[];
  };
  equipment: {
    loadout: string;
    trinket: string;
    patch: string;
  };
  credits: number;
}

export interface CharacterSaveData {
  character: Character;
  baseStats: CharacterStats;
  baseSaves: CharacterSaves;
  androidPenalty: Stat | null;
  scientistBonus: Stat | null;
}


export interface SkillDefinition {
  name: string;
  description: string;
  prerequisites?: string[];
  effects?: string;
}

// Dice Roller
export interface RollResult {
    total: number;
    rolls: number[];
    modifier: number;
    formula: string;
}