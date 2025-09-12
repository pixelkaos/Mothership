import { ALL_SKILLS, CLASSES_DATA, STARTING_EQUIPMENT_TABLES } from "@/constants/rules";
import { FIRST_NAMES, LAST_NAMES, PRONOUNS } from "@/constants/names";
import { TRINKETS, PATCHES } from "@/constants/items";
import { generateCharacterBackstory, generateCharacterPortrait } from "../services/geminiService";
import type { Character, CharacterClass, CharacterSaveData, SkillDefinition, SkillTier, Stat } from "../types";
import { rollDice } from "./dice";

export const initialCharacter: Character = {
    name: '',
    pronouns: '',
    notes: '',
    backstory: '',
    portrait: '',
    stats: { strength: 0, speed: 0, intellect: 0, combat: 0 },
    saves: { sanity: 0, fear: 0, body: 0 },
    class: null,
    health: { current: 0, max: 0 },
    wounds: { current: 0, max: 2 },
    stress: { current: 2, minimum: 2 },
    skills: { trained: [], expert: [], master: [] },
    skillProgress: {},
    equipment: { loadout: '', trinket: '', patch: '', inventory: [] },
    credits: 0,
};

export const initialSaveData: CharacterSaveData = {
    character: initialCharacter,
    baseStats: initialCharacter.stats,
    baseSaves: initialCharacter.saves,
    androidPenalty: null,
    scientistBonus: null,
    scientistMasterSkill: null,
};

export const getSkillAndPrerequisites = (masterSkillName: string): string[] => {
    const masterSkill = ALL_SKILLS.find(s => s.name === masterSkillName && s.tier === 'master');
    if (!masterSkill || !masterSkill.prerequisites) return [];

    const expertSkillName = masterSkill.prerequisites[0]; // Assume first prereq is the expert one
    const expertSkill = ALL_SKILLS.find(s => s.name === expertSkillName && s.tier === 'expert');
    if (!expertSkill || !expertSkill.prerequisites) return [masterSkillName, expertSkillName];
    
    const trainedSkillName = expertSkill.prerequisites[0];
    return [masterSkillName, expertSkillName, trainedSkillName];
};


export const generateRandomRecruit = async (): Promise<CharacterSaveData> => {
    const randomClass = CLASSES_DATA[Math.floor(Math.random() * CLASSES_DATA.length)];
    
    const baseStats = {
        strength: rollDice('2d10+25'),
        speed: rollDice('2d10+25'),
        intellect: rollDice('2d10+25'),
        combat: rollDice('2d10+25'),
    };
    const baseSaves = {
        sanity: rollDice('2d10+10'),
        fear: rollDice('2d10+10'),
        body: rollDice('2d10+10'),
    };
    
    let androidPenalty: Stat | null = null;
    if (randomClass.name === 'Android') {
        const penaltyOptions: Stat[] = ['strength', 'speed', 'intellect', 'combat'];
        androidPenalty = penaltyOptions[Math.floor(Math.random() * penaltyOptions.length)];
    }
    
    let scientistBonus: Stat | null = null;
    if (randomClass.name === 'Scientist') {
        const bonusOptions: Stat[] = ['strength', 'speed', 'intellect', 'combat'];
        scientistBonus = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
    }
    
    // SKILL GENERATION
    let skills: Character['skills'] = {
        trained: [...randomClass.starting_skills],
        expert: [],
        master: [],
    };
    let scientistMasterSkill: string | null = null;

    const getAvailable = (tier: SkillTier, currentSkills: Character['skills']) => {
        const allSelected = [...currentSkills.trained, ...currentSkills.expert, ...currentSkills.master];
        return ALL_SKILLS.filter(s => {
            if (s.tier !== tier || allSelected.includes(s.name)) return false;
            if (s.prerequisites) {
                 return s.prerequisites.every(p => [...currentSkills.trained, ...currentSkills.expert].includes(p));
            }
            return true;
        });
    };

    if (randomClass.name === 'Scientist') {
        const masterSkills = ALL_SKILLS.filter(s => s.tier === 'master');
        const randomMaster = masterSkills[Math.floor(Math.random() * masterSkills.length)];
        scientistMasterSkill = randomMaster.name;
        
        const skillChain = getSkillAndPrerequisites(scientistMasterSkill);
        
        if (!skills.master.includes(skillChain[0])) skills.master.push(skillChain[0]);
        if (!skills.expert.includes(skillChain[1])) skills.expert.push(skillChain[1]);
        if (!skills.trained.includes(skillChain[2])) skills.trained.push(skillChain[2]);

        const availableTrained = getAvailable('trained', skills);
        if (availableTrained.length > 0) {
            skills.trained.push(availableTrained[Math.floor(Math.random() * availableTrained.length)].name);
        }
    } else if (randomClass.name === 'Teamster') {
        const availableTrained = getAvailable('trained', skills);
        if (availableTrained.length > 0) {
            skills.trained.push(availableTrained[Math.floor(Math.random() * availableTrained.length)].name);
        }
        const availableExpert = getAvailable('expert', skills);
         if (availableExpert.length > 0) {
            skills.expert.push(availableExpert[Math.floor(Math.random() * availableExpert.length)].name);
        }
    } else if (randomClass.name === 'Marine' || randomClass.name === 'Android') {
        if (Math.random() < 0.5) { // 1 expert
            const availableExpert = getAvailable('expert', skills);
            if (availableExpert.length > 0) {
                skills.expert.push(availableExpert[Math.floor(Math.random() * availableExpert.length)].name);
            }
        } else { // 2 trained
            let availableTrained = getAvailable('trained', skills);
            for(let i = 0; i < 2; i++) {
                if(availableTrained.length > 0) {
                    const skillIndex = Math.floor(Math.random() * availableTrained.length);
                    const skillToAdd = availableTrained.splice(skillIndex, 1)[0];
                    skills.trained.push(skillToAdd.name);
                }
            }
        }
    }

    const maxHealth = rollDice('1d10+10');

    // EQUIPMENT & CREDITS
    const equipment = {
        loadout: '',
        trinket: TRINKETS[Math.floor(Math.random() * TRINKETS.length)],
        patch: PATCHES[Math.floor(Math.random() * PATCHES.length)],
        inventory: [],
    };
    
    const equipmentTable = STARTING_EQUIPMENT_TABLES[randomClass.name];
    equipment.loadout = equipmentTable[Math.floor(Math.random() * equipmentTable.length)];
    const credits = rollDice('5d10');

    const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
    const pronouns = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    
    // Calculate final stats for AI prompt generation
    const finalStats = { ...baseStats };
    const finalSaves = { ...baseSaves };
    let finalMaxWounds = 2;

    if (randomClass) {
        finalMaxWounds += randomClass.max_wounds_mod;
         for (const [stat, mod] of Object.entries(randomClass.stats_mods)) {
            finalStats[stat as keyof typeof finalStats] += mod;
        }
        for (const [save, mod] of Object.entries(randomClass.saves_mods)) {
            finalSaves[save as keyof typeof finalSaves] += mod;
        }
        if (randomClass.name === 'Android' && androidPenalty) {
            finalStats[androidPenalty] -= 10;
        }
        if (randomClass.name === 'Scientist' && scientistBonus) {
            finalStats[scientistBonus] += 5;
        }
    }

    const tempCharForPrompt: Character = {
        ...initialCharacter,
        name,
        pronouns,
        class: randomClass,
        stats: finalStats,
        saves: finalSaves,
        health: { current: maxHealth, max: maxHealth },
        wounds: { current: 0, max: finalMaxWounds },
        equipment,
        credits,
        skills,
    };

    const backstory = await generateCharacterBackstory(tempCharForPrompt);
    
    let prompt = `A vibrant cyberpunk illustration in a comic book anime style of a Mothership RPG character. A ${tempCharForPrompt.class.name}.`;
    if (tempCharForPrompt.pronouns) prompt += ` Pronouns: ${tempCharForPrompt.pronouns}.`;
    const topSkills = [...skills.master, ...skills.expert, ...skills.trained].slice(0, 3);
    if (topSkills.length > 0) prompt += ` Key Skills: ${topSkills.join(', ')}.`;
    if (equipment.trinket) prompt += ` They are holding a ${equipment.trinket}.`;
    prompt += ` Art Style: Bold colors, defined line art, high contrast, dramatic neon lighting. Bust shot.`;

    const portrait = await generateCharacterPortrait(prompt);

    const finalCharacter: Character = {
        ...tempCharForPrompt,
        backstory,
        portrait
    };
    
    return {
        character: finalCharacter,
        baseStats,
        baseSaves,
        androidPenalty,
        scientistBonus,
        scientistMasterSkill
    };
};
