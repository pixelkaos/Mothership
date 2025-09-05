import { ALL_SKILLS, CLASSES_DATA, FIRST_NAMES, LAST_NAMES, STARTING_EQUIPMENT_TABLES, PATCHES, PRONOUNS, SCIENTIST_SKILL_CHOICES, TRINKETS } from "../constants";
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
    equipment: { loadout: '', trinket: '', patch: '' },
    credits: 0,
};

export const initialSaveData: CharacterSaveData = {
    character: initialCharacter,
    baseStats: initialCharacter.stats,
    baseSaves: initialCharacter.saves,
    androidPenalty: null,
    scientistBonus: null,
};

export const autoSelectSkills = (characterClass: CharacterClass, allSkills: SkillDefinition[]): Character['skills'] => {
    const BASE_SKILLS = { trained: 2, expert: 1, master: 0 };
    const skillMap = new Map(allSkills.map(s => [s.name, s]));
    
    // Categorize skills by tier
    const categorizedSkills: Record<SkillTier, SkillDefinition[]> = { trained: [], expert: [], master: [] };
    for (const skill of allSkills) {
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
            categorizedSkills.trained.push(skill);
        } else {
            const isMaster = skill.prerequisites.some(pName => {
                const prereq = skillMap.get(pName);
                return prereq?.prerequisites && prereq.prerequisites.length > 0;
            });
            if (isMaster) {
                categorizedSkills.master.push(skill);
            } else {
                categorizedSkills.expert.push(skill);
            }
        }
    }

    let selectedSkills: Character['skills'] = {
        trained: [...characterClass.starting_skills],
        expert: [],
        master: [],
    };

    // Special handling for Scientist starting picks
    if (characterClass.name === 'Scientist') {
        const availableScientistSkills = [...SCIENTIST_SKILL_CHOICES];
        for (let i = 0; i < 3; i++) {
            if (availableScientistSkills.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableScientistSkills.length);
            const skillToAdd = availableScientistSkills.splice(randomIndex, 1)[0];
            selectedSkills.trained.push(skillToAdd);
        }
    }
    
    const isFlexibleClass = characterClass.name === 'Marine' || characterClass.name === 'Android';

    if (isFlexibleClass) {
        // Add base skills first
        let availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
        for (let i = 0; i < BASE_SKILLS.trained; i++) {
            if (availableTrained.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableTrained.length);
            selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
        }
        
        let availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
        if (availableExpert.length > 0) {
             const randomIndex = Math.floor(Math.random() * availableExpert.length);
             selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
        }

        // Then add flexible bonus
        if (Math.random() < 0.5) { // Choose 1 Expert
            availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
            if (availableExpert.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableExpert.length);
                selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
            }
        } else { // Choose 2 Trained
            availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
            for (let i = 0; i < 2; i++) {
                if (availableTrained.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableTrained.length);
                selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
            }
        }
    } else {
        // Handle standard skill selection for other classes
        const totalSkillsToSelect = {
            trained: BASE_SKILLS.trained + characterClass.bonus_skills.trained,
            expert: BASE_SKILLS.expert + characterClass.bonus_skills.expert,
            master: BASE_SKILLS.master + characterClass.bonus_skills.master,
        };

        let availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
        for (let i = 0; i < totalSkillsToSelect.trained; i++) {
            if (availableTrained.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableTrained.length);
            selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
        }
        
        let availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
        for (let i = 0; i < totalSkillsToSelect.expert; i++) {
            if (availableExpert.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableExpert.length);
            selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
        }
        
        const allSelectedLowerSkills = [...selectedSkills.trained, ...selectedSkills.expert];
        let availableMaster = categorizedSkills.master.filter(s => !selectedSkills.master.includes(s.name) && s.prerequisites?.every(p => allSelectedLowerSkills.includes(p)));
        for (let i = 0; i < totalSkillsToSelect.master; i++) {
            if (availableMaster.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableMaster.length);
            selectedSkills.master.push(availableMaster.splice(randomIndex, 1)[0].name);
        }
    }
    
    return selectedSkills;
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
    
    const skills = autoSelectSkills(randomClass, ALL_SKILLS);
    const maxHealth = rollDice('1d10+10');

    const equipmentTable = STARTING_EQUIPMENT_TABLES[randomClass.name];
    const rolledEquipment = equipmentTable[Math.floor(Math.random() * equipmentTable.length)];

    const equipment = {
        loadout: rolledEquipment,
        trinket: TRINKETS[Math.floor(Math.random() * TRINKETS.length)],
        patch: PATCHES[Math.floor(Math.random() * PATCHES.length)],
    };
    const credits = rollDice('2d10') * 10;
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
    };
};