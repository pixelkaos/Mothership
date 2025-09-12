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
  shipModel: string;
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

export interface ShopItem {
  name: string;
  price: string;
  description: string;
}

export interface ArmorItem {
  name: string;
  description?: string;
  cost: string;
  ap: number;
  o2: string;
  speed: string;
  special: string;
  dr?: number;
}

export interface WeaponItem {
  name: string;
  cost: string;
  range: string;
  damage: string;
  shots: string;
  wound: string;
  special: string;
  aa?: boolean;
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
  flexible_stats_mod?: {
    amount: number;
    description: string;
  };
  max_wounds_mod: number;
  starting_skills: string[];
  bonus_skills: { // Can be a choice or fixed
    choice?: {
      expert: number;
      trained: number;
    };
    fixed?: {
      trained: number;
      expert: number;
      master: number;
    }
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
  // Tracks successful uses per skill (0-3). Optional for backward compatibility with older save files.
  skillProgress?: Record<string, number>;
  equipment: {
    loadout: string;
    trinket: string;
    patch: string;
    inventory: string[];
  };
  credits: number;
}

export interface CharacterSaveData {
  character: Character;
  baseStats: CharacterStats;
  baseSaves: CharacterSaves;
  androidPenalty: Stat | null;
  scientistBonus: Stat | null;
  scientistMasterSkill: string | null; // For tracking the chosen skill branch
}


export interface SkillDefinition {
  name: string;
  tier: SkillTier;
  description: string;
  prerequisites?: string[];
}

// Dice Roller
export interface RollResult {
    total: number;
    rolls: number[];
    modifier: number;
    formula: string;
}

export interface WoundEntry {
    severity: string;
    bluntForce: string;
    bleeding: string;
    gunshot: string;
    fireExplosives: string;
    goreMassive: string;
}

// Shipbreaker's Toolkit Data
export interface ShipData {
  name: string;
  modelCode: string;
  stats: {
    thrusters: number;
    systems: number;
    weapons: number;
    base_weapons?: number;
  };
  cost: string;
  crew: number;
  cryopods: number;
  fuel: number;
  escape_pods: string;
  hardpoints: string;
  megadamage: string;
  upgrades: string;
  notes?: string;
  image: string;
  description: string;
}

export interface ShipUpgrade {
  type: 'Minor' | 'Major';
  name: string;
  cost: string;
  install: string;
  description: string;
}

export interface ShipWeapon {
  name: string;
  cost: string;
  bonus: string;
  description: string;
}

// Ship Manifest Data
export interface ShipManifestData {
  identifier: string;
  captain: string;
  modelInfo: string; // Make / Model / Jump / Class / Type
  transponderOn: boolean;
  stats: {
    thrusters: number;
    battle: number;
    systems: number;
  };
  o2Remaining: number;
  fuel: { current: number; max: number };
  warpCores: number;
  cryopods: number;
  escapePods: number;
  weapons: { base: number; total: number };
  megadamage: { base: number; total: number };
  hardpoints: { installed: number; max: number };
  hullPoints: number;
  megadamageLevel: number; // 0-9+
  deckplan: Record<string, string | null>; // key: "row-col", value: iconName
  upgrades: { installed: number; max: number; list: string };
  cargo: string;
  repairs: { minor: string; major: string };
  crew: { current: number; max: number; list: string };
}
