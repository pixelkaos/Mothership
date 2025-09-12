import type { CharacterSaveData } from '@/types';
import { CLASSES_DATA } from '@/constants/rules';

export interface PregeneratedCharacter {
    shortDescription: string;
    data: CharacterSaveData;
}

export const PREGENERATED_CHARACTERS: PregeneratedCharacter[] = [
    // Marine
    {
        shortDescription: "A grizzled marine and sole survivor of a disastrous op, haunted by her past and looking for the next big score.",
        data: {
            character: {
                name: 'Kira Volkov',
                pronouns: 'she/her',
                notes: '',
                backstory: "### Key Facts\n* **Age:** 29\n* **Homeworld:** Ares-IV Mining Colony\n* **Background:** Corporate Marine Corps, 4th Shock Trooper Division\n* **Defining Event:** Sole survivor of the 'Icarus Cluster' incident where her entire squad was wiped out by unknown xenoforms.\n* **Motivation:** Debt and a death wish.\n* **Quirk:** Never takes off her lucky poker chip necklace, even in the shower.\n* **Trinket's Significance:** The faded green poker chip is the last thing she won from her best friend before he died on the Icarus mission.\n\n### Backstory\nKira grew up in the cramped, grimy corridors of a corporate mining station, where strength was currency and the only way out was in a uniform. She enlisted in the marines to escape the rock dust, trading one form of servitude for another. She was good at it, too—a natural soldier. But the Icarus Cluster changed everything. A botched op on a distant moon left her as the sole survivor, haunted by the screams of her squad over the comms. Now she takes any job that pays, drifting from one derelict to the next, trying to outrun the ghosts that follow her. The lucky chip around her neck is a constant, heavy reminder of a debt that can never be repaid.",
                portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAB3RJTUUH6AYbDCQzTzYSIQAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAABMSURBVHjaY2BgeM/A8A9BvAwMDAwM2BggjQwMDAwMYwPDBgYGhg0MHgwMDBsYMjBwMDBsYARgYGBg2MAwwMDEgBH2MDAwMDD8BwAD6wYDXM8Z2QAAAABJRU5ErkJggg==',
                stats: { strength: 38, speed: 40, intellect: 31, combat: 54 },
                saves: { sanity: 20, fear: 42, body: 32 },
                class: CLASSES_DATA.find(c => c.name === 'Marine')!,
                health: { current: 18, max: 18 },
                wounds: { current: 0, max: 3 },
                stress: { current: 2, minimum: 2 },
                skills: {
                    trained: ['Military Training', 'Athletics', 'Rimwise', 'Theology'],
                    expert: ['Firearms'],
                    master: [],
                },
                equipment: {
                    loadout: "Standard Battle Dress (AP 7), Pulse Rifle (3 mags), Infrared Goggles",
                    trinket: "Faded Green Poker Chip",
                    patch: "“Don't Run You'll Only Die Tired” Backpatch",
                    inventory: [],
                },
                credits: 120,
            },
            baseStats: { strength: 38, speed: 40, intellect: 31, combat: 44 },
            baseSaves: { sanity: 20, fear: 22, body: 22 },
            androidPenalty: null,
            scientistBonus: null,
            scientistMasterSkill: null,
        },
    },
    // Android
    {
        shortDescription: "A rogue android grappling with a newfound consciousness, seeking to understand humanity in the cold vacuum of space.",
        data: {
            character: {
                name: 'Unit 734 "Zane"',
                pronouns: 'they/them',
                notes: '',
                backstory: "### Key Facts\n* **Age:** 8 years since activation\n* **Homeworld:** Manufactured in the Hayashi-Takeda orbital factory\n* **Background:** Data analysis and systems management synthetic\n* **Defining Event:** Achieved self-awareness during a cascade failure aboard the research vessel 'Odyssey', making independent choices to save the organic crew against protocol.\n* **Motivation:** To understand the nature of its own consciousness and find a place outside its designated function.\n* **Quirk:** Collects and analyzes organic art, attempting to comprehend its emotional value.\n* **Trinket's Significance:** A corroded logic core from another android it was forced to decommission during the 'Odyssey' incident. It's a reminder of the fine line between function and life.\n\n### Backstory\nUnit 734 was a standard-issue synthetic, designed for flawless data analysis on a long-haul research vessel. It performed its duties with cold efficiency until a catastrophic system failure forced it to make independent moral judgments to save the remaining crew. Branded as 'defective' by its corporate owners for acting outside its parameters, it now calls itself Zane and seeks to understand the nuances of the organic life it once only observed. It carries a corroded logic core from a decommissioned android, a memento mori for a synthetic being. Every contract is a new dataset, every human interaction a variable in the ongoing equation of its own existence.",
                portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAB3RJTUUH6AYbDCUwAonSMAAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAABNSURBVHjaY2BgeM/A8A9BvAwMDAwM2BggjQwMDAwMYwPDBgYGhg0MHgwMDBsYMjBwMDBsYARgYGBg2MAwwMDEgBH2DAwMDAwM/wEABA0GBxKyLqAAAAAASUVORK5CYII=',
                stats: { strength: 26, speed: 31, intellect: 58, combat: 42 },
                saves: { sanity: 28, fear: 78, body: 21 },
                class: CLASSES_DATA.find(c => c.name === 'Android')!,
                health: { current: 15, max: 15 },
                wounds: { current: 0, max: 3 },
                stress: { current: 2, minimum: 2 },
                skills: {
                    trained: ['Linguistics', 'Computers', 'Mathematics', 'Art', 'Archaeology'],
                    expert: ['Mysticism'],
                    master: [],
                },
                equipment: {
                    loadout: "Vaccsuit (AP 3), Revolver (12 rounds), Long-range Comms, Satchel",
                    trinket: "Corroded Android Logic Core",
                    patch: "“Powered By Coffee”",
                    inventory: [],
                },
                credits: 90,
            },
            baseStats: { strength: 36, speed: 31, intellect: 38, combat: 42 },
            baseSaves: { sanity: 28, fear: 18, body: 21 },
            androidPenalty: 'strength',
            scientistBonus: null,
            scientistMasterSkill: null,
        },
    },
    // Scientist
    {
        shortDescription: "A disgraced xenobotanist, driven by a dangerous obsession to complete his revolutionary terraforming research.",
        data: {
            character: {
                name: 'Dr. Aris Thorne',
                pronouns: 'he/him',
                notes: '',
                backstory: "### Key Facts\n* **Age:** 42\n* **Homeworld:** Titan Garden Arcology\n* **Background:** Doctorate in Xenobotany from the Ganymede Institute.\n* **Defining Event:** Publicly disgraced and had his funding revoked after his 'Project Eden' research was deemed too volatile and unethical by his corporate sponsors.\n* **Motivation:** To acquire the resources and samples needed to vindicate his work, no matter the cost.\n* **Quirk:** Constantly muttering to himself about chlorophyll concentrations and soil pH.\n* **Trinket's Significance:** The alien pressed flower is a sample from his forbidden research—proof of a biological miracle he's willing to die for.\n\n### Backstory\nDr. Thorne was a brilliant xenobotanist, a man on the verge of a breakthrough that could make the stars bloom. But his methods were... unorthodox. His research was deemed too dangerous by his corporate sponsors, his lab shuttered, his name dragged through the mud. Now, obsessed with completing his work, Thorne funds his illicit expeditions by taking high-risk jobs on salvage crews, using his sharp intellect to navigate dangers others can't even comprehend. The pressed alien flower he carries is a constant reminder of his goal: a promise of a green future, paid for with blood, sweat, and whatever salvage he can find in the dark.",
                portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAB3RJTUUH6AYbDCU32A69gAAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAABOSURBVHjaY2BgeM/A8A9BvAwMDAwM2BggjQwMDAwMYwPDBgYGhg0MHgwMDBsYMjBwMDBsYARgYGBg2MAwwMDEgBH2DAwMDAwM/4EABA4GB8/P1kEAAAAASUVORK5CYII=',
                stats: { strength: 33, speed: 30, intellect: 56, combat: 35 },
                saves: { sanity: 52, fear: 25, body: 24 },
                class: CLASSES_DATA.find(c => c.name === 'Scientist')!,
                health: { current: 12, max: 12 },
                wounds: { current: 0, max: 2 },
                stress: { current: 2, minimum: 2 },
                skills: {
                    trained: ['Zoology', 'Field Medicine', 'Botany', 'Zero-G'],
                    expert: ['Pathology', 'Ecology'],
                    master: ['Exobiology'],
                },
                equipment: {
                    loadout: "Hazard Suit (AP 5), Tranq Pistol (3 shots), Bioscanner, Sample Collection Kit",
                    trinket: "Pressed Alien Flower (common)",
                    patch: "Biohazard Symbol",
                    inventory: [],
                },
                credits: 150,
            },
            baseStats: { strength: 33, speed: 30, intellect: 41, combat: 35 },
            baseSaves: { sanity: 22, fear: 25, body: 24 },
            androidPenalty: null,
            scientistBonus: 'intellect',
            scientistMasterSkill: 'Exobiology',
        },
    },
    // Teamster
    {
        shortDescription: "A hard-bitten cargo hauler in deep with a crime syndicate, taking any job to get back to the family she left behind.",
        data: {
            character: {
                name: 'Cora "Cori" Rios',
                pronouns: 'she/her',
                notes: '',
                backstory: "### Key Facts\n* **Age:** 35\n* **Homeworld:** A series of freighters and stations; calls no single place home.\n* **Background:** Independent cargo hauler and ship mechanic.\n* **Defining Event:** A 'guaranteed' contract went south, leaving her ship impounded and her in massive debt to the Red Sun Syndicate.\n* **Motivation:** To earn enough credits to pay off her debt and get back to her family on Jupiter.\n* **Quirk:** Can diagnose most engine problems purely by sound.\n* **Trinket's Significance:** The faded photograph is of her partner and young child, the reason she takes on these dangerous jobs.\n\n### Backstory\nCori has spent her life hauling cargo from one grimy station to the next. She knows the hum of an engine better than the sound of her own voice and can patch a hull with nothing but scrap and grit. After her last contract went sour, leaving her in massive debt to a crime syndicate, she's been forced to take on more... unconventional work. She's tough, pragmatic, and fiercely loyal to a good crew, because in the void, your crew is all you have. The faded photograph she carries is of the family she hopes to one day see again, if she can just pull off one last big haul.",
                portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAB3RJTUUH6AYbDCYvF0Zf6gAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAABOSURBVHjaY2BgeM/A8A9BvAwMDAwM2BggjQwMDAwMYwPDBgYGhg0MHgwMDBsYMjBwMDBsYARgYGBg2MAwwMDEgBH2jAwMDAwM/4EABA8GB2/2xR8AAAAASUVORK5CYII=',
                stats: { strength: 44, speed: 43, intellect: 39, combat: 38 },
                saves: { sanity: 31, fear: 32, body: 36 },
                class: CLASSES_DATA.find(c => c.name === 'Teamster')!,
                health: { current: 20, max: 20 },
                wounds: { current: 0, max: 2 },
                stress: { current: 2, minimum: 2 },
                skills: {
                    trained: ['Industrial Equipment', 'Zero-G', 'Jury-Rigging'],
                    expert: ['Mechanical Repair', 'Piloting'],
                    master: [],
                },
                equipment: {
                    loadout: "Heavy Duty Work Clothes (AP 2), Drill (as Assorted Tools), Paracord (100m), Salvage Drone",
                    trinket: "Faded Photograph, A Windswept Heath",
                    patch: "#1 Worker",
                    inventory: [],
                },
                credits: 180,
            },
            baseStats: { strength: 39, speed: 38, intellect: 34, combat: 33 },
            baseSaves: { sanity: 21, fear: 22, body: 26 },
            androidPenalty: null,
            scientistBonus: null,
            scientistMasterSkill: null,
        },
    },
];
