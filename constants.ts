import type { ShipClassStatus, CharacterClass, SkillDefinition } from './types';

export const SHIP_NAME_PART1 = ["IAGO", "HECATE", "OBERON", "WHITEHALL", "DUNCAN", "BANQUO", "WINTER", "MARLOWE", "TEMPEST", "FAUST"];
export const SHIP_NAME_PART2 = ["VALEFOR", "OPHANIM", "MARAX", "MARINER", "LABOLAS", "ASTAROTH", "CHERUBIM", "TYRANT", "BALAAM", "MURMUR"];
export const SHIP_NAME_PART3 = ["ECHO", "ALPHA", "OMEGA", "KING", "BEGGAR", "DELTA", "EPSILON", "JIBRIL", "BRAVO", "TANGO"];


export const SHIP_CLASS_STATUS: ShipClassStatus[] = [
    { range: [0, 0], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Cryopods'}, {dice: '1d100', item: 'Trade Units'}, {dice: '2d10', item: 'Survivors'}] },
    { range: [1, 9], class: 'Mining Frigate', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d100', item: 'Scrap'}, {dice: '4d10', item: 'Ore'}, {dice: '1d10', item: 'Fuel Units'}] },
    { range: [10, 19], class: 'Mining Frigate', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d100', item: 'Scrap'}, {dice: '4d10', item: 'Ore'}, {dice: '1d10', item: 'Fuel Units'}] },
    { range: [20, 24], class: 'Mining Frigate', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d100', item: 'Scrap'}, {dice: '4d10', item: 'Ore'}, {dice: '1d10', item: 'Fuel Units'}] },
    { range: [25, 29], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [30, 34], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [35, 39], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [40, 44], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [45, 49], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [50, 54], class: 'Freighter', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [55, 57], class: 'Shuttle', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [58, 60], class: 'Shuttle', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [61, 63], class: 'Shuttle', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '1d10', item: 'Fuel Units'}, {dice: '3d10', item: 'Metal'}]},
    { range: [64, 66], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [67, 69], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [70, 71], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [72, 73], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [74, 75], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [76, 77], class: 'Courier', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{dice: '2d10', item: 'Galley Stock'}]},
    { range: [78, 79], class: 'Research Vessel', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d100', item: 'Trade Units of Random Cargo'}, {dice: '1d10', item: 'Cryopods'}]},
    { range: [80, 80], class: 'Research Vessel', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d100', item: 'Trade Units of Random Cargo'}, {dice: '1d10', item: 'Cryopods'}]},
    { range: [81, 81], class: 'Research Vessel', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d100', item: 'Trade Units of Random Cargo'}, {dice: '1d10', item: 'Cryopods'}]},
    { range: [82, 82], class: 'Blockade Runner', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Precious Metal'}, {dice: '1d1', item: 'Medbay'}]},
    { range: [83, 83], class: 'Blockade Runner', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Precious Metal'}, {dice: '1d1', item: 'Medbay'}]},
    { range: [84, 84], class: 'Cutter', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d1', item: 'Weapon'}, {dice: '1d10', item: 'Precious Metal'}]},
    { range: [85, 85], class: 'Cutter', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d1', item: 'Weapon'}, {dice: '1d10', item: 'Precious Metal'}]},
    { range: [86, 86], class: 'Cutter', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d1', item: 'Weapon'}, {dice: '1d10', item: 'Precious Metal'}]},
    { range: [87, 87], class: 'Troopship', status: 'Habitable (Non-Functioning)', survivors: '2d10 Survivors (In Cryosleep)', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Contraband'}, {dice: '1d1', item: 'Computer'}]},
    { range: [88, 88], class: 'Troopship', status: 'Habitable (Non-Functioning)', survivors: '2d10 Survivors (In Cryosleep)', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Contraband'}, {dice: '1d1', item: 'Computer'}]},
    { range: [89, 89], class: 'Troopship', status: 'Habitable (Non-Functioning)', survivors: '2d10 Survivors (In Cryosleep)', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{dice: '1d10', item: 'Contraband'}, {dice: '1d1', item: 'Computer'}]},
    { range: [90, 90], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [91, 91], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [92, 92], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [93, 93], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [94, 94], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [95, 95], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [96, 96], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [97, 97], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [98, 98], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
    { range: [99, 99], class: 'Colony Ship', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{dice: '1d1', item: 'Jump Drive'}, {dice: '1d1', item: 'Unstable Core'}]},
];

export const CAUSE_OF_RUINATION = [ "Virus", "Combat", "Raided by Pirates", "Hyperspace Malfunction", "Abandoned Ship", "Insane AI", "Mutiny", "Crash: Other Ship", "Crash: Space Debris", "Crash: Jump Drive Miscalculation", "Engine Failure", "Cannibalism", "Nerve Gas", "Escape Pod Never Returned", "Betrayal/Backstabbing", "Succumbed to Nightmares", "Hatch Opened, No Air", "Cargo Created Mishap", "Starvation", "Part of a Conspiracy", "Thrusters Slagged", "Weapons System Malfunction", "Cryosleep Never Disengaged", "Complex Series of Events", "Suicide Pact", "Parasite Infestation", "Environmental Systems Failure", "Uncontrollable Fire", "Failed Fraud Attempt", "Void Worshipping", "Bizarre Love Triangle", "Fight Spiraled Out of Control", "Chainsaw Rampage", "Drug Addled Debauchery", "Fatal Depressurization", "Nightmares Ending in Heart Attack", "Mob Hit", "Crew Members Vanished", "Prank Taken Too Far", "William Tell Trick", "Virus", "Combat", "Raided by Pirates", "Hyperspace Malfunction", "Abandoned Ship", "Insane AI", "Mutiny", "Crash: Other Ship", "Crash: Space Debris", "Crash: Jump Drive Miscalculation", "Engine Failure", "Cannibalism", "Nerve Gas", "Escape Pod Never Returned", "Betrayal/Backstabbing", "Succumbed to Nightmares", "Hatch Opened, No Air", "Cargo Created Mishap", "Starvation", "Part of a Conspiracy", "Thrusters Slagged", "Weapons System Malfunction", "Cryosleep Never Disengaged", "Complex Series of Events", "Suicide Pact", "Parasite Infestation", "Environmental Systems Failure", "Uncontrollable Fire", "Failed Fraud Attempt", "Void Worshipping", "Bizarre Love Triangle", "Fight Spiraled Out of Control", "Chainsaw Rampage", "Drug Addled Debauchery", "Fatal Depressurization", "Nightmares Ending in Heart Attack", "Mob Hit", "Crew Members Vanished", "Prank Taken Too Far", "William Tell Trick", "Virus", "Combat", "Raided by Pirates", "Hyperspace Malfunction", "Abandoned Ship", "Insane AI", "Mutiny", "Crash: Other Ship", "Crash: Space Debris", "Crash: Jump Drive Miscalculation", "Engine Failure", "Cannibalism", "Nerve Gas", "Escape Pod Never Returned", "Betrayal/Backstabbing", "Succumbed to Nightmares", "Hatch Opened, No Air", "Cargo Created Mishap", "Starvation", "Part of a Conspiracy", "Thrusters Slagged", "Weapons System Malfunction", "Cryosleep Never Disengaged", "Complex Series of Events" ];
export const WEIRD = [ "Haunted", "Inhabited by Alien Life", "Terraformed by Strange Creatures", "Crew Dressed for Costume Party", "Crew All Identical", "Crew was preparing Theatrical Performance", "Morbid Artwork", "Pet Hoarders", "Erotic Sculptures", "Communist Regalia", "Company Uniform", "Cult Members", "Extensive Journals Kept", "Strange Health Obsession", "Unnervingly Clean", "Android was Poisoning Captain", "Ancient Ship", "Temporal Distortions", "Failed Utopia", "Crew Weighed and Measured Weekly", "Extensive Body Modification", "Isolated Physics Anomalies", "Sexual Deviants", "Religious Extremists", "Transhumanist Android Worshippers", "Anti-Android Conspiracists", "Nauseating Stench", "Everything is Jury-Rigged", "Crew Taking Video Through the Catastrophe", "Body Horror", "Scooby-Doo Crew", "Interior Coated in Flesh, Doors are Membranes", "Whispering Echoes Always a Room Ahead", "Dolls in Macabre Tableaux", "Dead Crew: Exploded Heads", "Elaborately Posed Corpses (Hooks & Chains)", "Flickering Lights and Frenzied Screams", "Ship Rearranges Itself Frequently", "Ship Has Infinite Depth", "Fruit Basket, Greeting Card Inexplicably Addressed to Crew", "Haunted", "Inhabited by Alien Life", "Terraformed by Strange Creatures", "Crew Dressed for Costume Party", "Crew All Identical", "Crew was preparing Theatrical Performance", "Morbid Artwork", "Pet Hoarders", "Erotic Sculptures", "Communist Regalia", "Company Uniform", "Cult Members", "Extensive Journals Kept", "Strange Health Obsession", "Unnervingly Clean", "Android was Poisoning Captain", "Ancient Ship", "Temporal Distortions", "Failed Utopia", "Crew Weighed and Measured Weekly", "Extensive Body Modification", "Isolated Physics Anomalies", "Sexual Deviants", "Religious Extremists", "Transhumanist Android Worshippers", "Anti-Android Conspiracists", "Nauseating Stench", "Everything is Jury-Rigged", "Crew Taking Video Through the Catastrophe", "Body Horror", "Scooby-Doo Crew", "Interior Coated in Flesh, Doors are Membranes", "Whispering Echoes Always a Room Ahead", "Dolls in Macabre Tableaux", "Dead Crew: Exploded Heads", "Elaborately Posed Corpses (Hooks & Chains)", "Flickering Lights and Frenzied Screams", "Ship Rearranges Itself Frequently", "Ship Has Infinite Depth", "Fruit Basket, Greeting Card Inexplicably Addressed to Crew", "Haunted", "Inhabited by Alien Life", "Terraformed by Strange Creatures", "Crew Dressed for Costume Party", "Crew All Identical", "Crew was preparing Theatrical Performance", "Morbid Artwork", "Pet Hoarders", "Erotic Sculptures", "Communist Regalia", "Company Uniform", "Cult Members", "Extensive Journals Kept", "Strange Health Obsession", "Unnervingly Clean", "Android was Poisoning Captain", "Ancient Ship", "Temporal Distortions" ];
export const CARGO_TYPE = [ "Body Bags (Full)", "Wine", "Wine", "Wine", "Wine", "Wine", "Wine", "Wine", "Wine", "Wine", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Complex Navigational Equipment", "Ceramics", "Ceramics", "Ceramics", "Ceramics", "Ceramics", "Antique Books", "Antique Books", "Antique Books", "Antique Books", "Antique Books", "Garden Gnomes (Full of Illegal Stimulants)", "Garden Gnomes (Full of Illegal Stimulants)", "Garden Gnomes (Full of Illegal Stimulants)", "Garden Gnomes (Full of Illegal Stimulants)", "Garden Gnomes (Full of Illegal Stimulants)", "Opium", "Opium", "Opium", "Opium", "Opium", "Tea", "Tea", "Tea", "Tea", "Tea", "Silver Bars", "Silver Bars", "Silver Bars", "Silver Bars", "Silver Bars", "Sensitive Documents", "Sensitive Documents", "Sensitive Documents", "Sensitive Documents", "Sensitive Documents", "Anthropology Mission", "Anthropology Mission", "Anthropology Mission", "Botanists/Horticulturists", "Botanists/Horticulturists", "Botanists/Horticulturists", "Industrial Engineers/Architects", "Industrial Engineers/Architects", "Industrial Engineers/Architects", "Terraforming Equipment", "Terraforming Equipment", "Terraforming Equipment", "Hydroponic Plants", "Hydroponic Plants", "Hydroponic Plants", "Rare Wood", "Rare Wood", "Lab Rats", "Lab Rats", "Cultured Cells", "Cultured Cells", "Cremains", "Cremains", "Drug Production Starter Equipment", "Drug Production Starter Equipment", "Common Cloth", "Designer Clothes", "Expensive Fish (food)", "Pets", "Plastic Junk (gewgaws)", "Legionaries (guns & ammo)", "Religious Pilgrims (religious texts & symbols)", "Compressed Algae Blocks", "Disarmed ordinance (lack detonators)", "Cars (high end)", "Medicine", "Cosmetics", "Race Horse Reproductive Material", "Livestock", "Prisoners", "Mobile Black Site", "Census Takers", "Cadmium", "Preserved Fruit", "Refugees" ];

// CHARACTER CREATION CONSTANTS

export const FIRST_NAMES = ["Jax", "Kira", "Zane", "Cora", "Rhys", "Lena", "Milo", "Suri", "Finn", "Orion", "Anya", "Nico", "Zara", "Silas", "Esme"];
export const LAST_NAMES = ["Kade", "Vance", "Orlov", "Chen", "Rios", "Sato", "Khan", "Beckett", "Ito", "Volkov", "Moreau", "Janssen", "Valerius", "Singh"];
export const PRONOUNS = ["they/them", "she/her", "he/him"];


export const CLASSES_DATA: CharacterClass[] = [
    {
        name: 'Marine',
        description: 'Trained soldiers, experts in combat and survival. They are tough but their panic can be contagious.',
        stats_mods: { combat: 10 },
        saves_mods: { fear: 20, body: 10 },
        max_wounds_mod: 1,
        starting_skills: ['Military Training', 'Athletics'],
        bonus_skills: { trained: 2, expert: 1, master: 0 },
        trauma_response: 'Whenever you Panic, every close friendly player must make a Fear Save.'
    },
    {
        name: 'Android',
        description: 'Synthetic beings with superior intellect and resilience to fear, but often at the cost of social graces and physical prowess.',
        stats_mods: { intellect: 20 },
        saves_mods: { fear: 60 },
        max_wounds_mod: 1,
        starting_skills: ['Linguistics', 'Computers', 'Mathematics'],
        bonus_skills: { trained: 2, expert: 1, master: 0 },
        trauma_response: 'Fear Saves made by close friendly players are at Disadvantage.'
    },
    {
        name: 'Scientist',
        description: "Experts in research and analysis. Their deep knowledge can be a boon, or a source of great stress when they uncover things not meant for mortal minds.",
        stats_mods: { intellect: 10 },
        saves_mods: { sanity: 30 },
        max_wounds_mod: 0,
        starting_skills: [], // Pick 3 from a list
        bonus_skills: { trained: 2, expert: 1, master: 1 },
        trauma_response: 'Whenever you fail a Sanity Save, all close friendly players gain 1 Stress.'
    },
    {
        name: 'Teamster',
        description: 'Hard-working space haulers and engineers. They are reliable and versatile, capable of handling industrial equipment and enduring hardships.',
        stats_mods: { strength: 5, speed: 5, intellect: 5, combat: 5 },
        saves_mods: { sanity: 10, fear: 10, body: 10 },
        max_wounds_mod: 0,
        starting_skills: ['Industrial Equipment', 'Zero-G'],
        bonus_skills: { trained: 1, expert: 1, master: 0 },
        trauma_response: 'Once per session, you may take Advantage on a Panic Check.'
    }
];

export const SCIENTIST_SKILL_CHOICES = ['Biology', 'Geology', 'Computers', 'Mathematics', 'Chemistry', 'Industrial Equipment'];

export const ALL_SKILLS: SkillDefinition[] = [
    // Trained
    { name: 'Linguistics', description: 'Fluency in multiple languages and understanding of communication structures.', effects: 'Allows Intellect checks to understand, read, or speak unfamiliar languages.' },
    { name: 'Biology', description: 'The study of life and living organisms, both terrestrial and xeno.', effects: 'Allows Intellect checks to identify species, understand ecosystems, or analyze biological samples.' },
    { name: 'First Aid', description: 'Emergency medical care for injuries and ailments.', effects: 'Allows Intellect checks to stabilize dying characters and treat minor wounds.' },
    { name: 'Geology', description: 'Knowledge of planets, moons, asteroids and their mineral composition.', effects: 'Allows Intellect checks to identify valuable minerals and understand planetary phenomena.' },
    { name: 'Zero-G', description: 'Proficiency in maneuvering and working in a weightless environment.', effects: 'Allows Speed checks to navigate in zero-gravity. Without this skill, all movement checks in Zero-G are at Disadvantage.' },
    { name: 'Scavenging', description: 'The knack for finding useful items and resources from refuse and wreckage.', effects: 'Allows Intellect checks to find specific items or extra resources when searching an area.' },
    { name: 'Industrial Equipment', description: 'Familiarity with operating heavy machinery like forklifts, mag-clamps, and mining drills.', effects: 'Allows Speed checks to operate industrial hardware safely and effectively.' },
    { name: 'Computers', description: 'Competence in using standard computer systems and networks.', effects: 'Allows Intellect checks to access, bypass, or control computer systems and retrieve data.' },
    { name: 'Mechanical Repair', description: 'The ability to diagnose and fix common mechanical problems in equipment and vehicles.', effects: 'Allows Intellect checks to repair damaged machinery. Grants Advantage on jury-rigging.' },
    { name: 'Piloting', description: 'Skill in operating spacecraft and other vehicles.', effects: 'Allows Speed checks to pilot ships and vehicles, especially during complex maneuvers.' },
    { name: 'Mathematics', description: 'Advanced understanding of numbers, logic, and abstract systems.', effects: 'Allows Intellect checks to solve complex logical problems, calculate trajectories, and break simple codes.' },
    { name: 'Art', description: 'Ability in a creative field, such as painting, music, or writing.', effects: 'Allows for the creation of works that can influence morale or communicate complex ideas.' },
    { name: 'Archaeology', description: 'The study of ancient and alien cultures through their material remains.', effects: 'Allows Intellect checks to identify the purpose of ancient artifacts and understand alien ruins.' },
    { name: 'Theology', description: 'Knowledge of religions, cults, and belief systems, both human and xeno.', effects: 'Allows Intellect checks to understand religious motivations, rituals, and hierarchies.' },
    { name: 'Military Training', description: 'Basic knowledge of military conduct, chain of command, and procedures.', effects: 'Allows Intellect checks to understand military orders and tactics. Grants knowledge of military protocol.' },
    { name: 'Rimwise', description: 'Street-smarts and familiarity with the customs of outer rim colonies and fringe societies.', effects: 'Allows Intellect checks to gather rumors, find black markets, and avoid social faux pas on the fringe.' },
    { name: 'Athletics', description: 'Proficiency in physical activities like running, climbing, and jumping.', effects: 'Allows Strength or Speed checks for physical exertion. Grants Advantage on checks to escape grapples.' },
    { name: 'Chemistry', description: 'Understanding of chemical substances and their properties.', effects: 'Allows Intellect checks to analyze unknown substances, synthesize simple compounds, or identify poisons.' },
    // Expert
    { name: 'Psychology', description: 'The study of the mind and behavior.', effects: 'Allows Intellect checks to discern motives, detect lies, or provide basic counseling to reduce Stress.', prerequisites: ['Linguistics'] },
    { name: 'Genetics', description: 'In-depth knowledge of heredity, DNA, and biological variation.', effects: 'Allows Intellect checks to operate gene-sequencing equipment or identify genetic modifications.', prerequisites: ['Biology'] },
    { name: 'Pathology', description: 'The study and diagnosis of disease.', effects: 'Allows Intellect checks to identify diseases, causes of death, and vulnerabilities of alien organisms.', prerequisites: ['First Aid'] },
    { name: 'Botany', description: 'The scientific study of plant life, including alien flora.', effects: 'Allows Intellect checks to identify edible or dangerous plants and cultivate them.', prerequisites: ['Biology'] },
    { name: 'Planetology', description: 'Advanced study of planetary systems, atmospheres, and ecosystems.', effects: 'Allows Intellect checks to predict weather patterns and identify safe zones on alien worlds.', prerequisites: ['Geology'] },
    { name: 'Asteroid Mining', description: 'Specialized knowledge in extracting resources from asteroids.', effects: 'Grants Advantage on checks related to operating mining equipment and identifying rich deposits.', prerequisites: ['Zero-G'] },
    { name: 'Jury-Rigging', description: 'The art of making makeshift repairs with limited resources.', effects: 'Allows an Intellect check to temporarily fix complex equipment or create a one-use item.', prerequisites: ['Scavenging'] },
    { name: 'Engineering', description: 'The design, building, and maintenance of complex systems and structures.', effects: 'Allows Intellect checks to design new equipment or oversee major repairs to a starship.', prerequisites: ['Industrial Equipment'] },
    { name: 'Hacking', description: 'Unauthorized access to secure computer systems.', effects: 'Allows an opposed Intellect check to gain unauthorized access to secure systems and manipulate their data.', prerequisites: ['Computers'] },
    { name: 'Vehicle Specialization', description: 'Mastery of a specific class of vehicle (e.g., ground transport, fighter).', effects: 'Grants Advantage on all checks made to pilot or repair a specific type of vehicle.', prerequisites: ['Mechanical Repair'] },
    { name: 'Astrogation', description: 'The science of navigating a spacecraft through interstellar space.', effects: 'Allows Intellect checks to plot hyperspace jumps. Failure can lead to being lost in space.', prerequisites: ['Piloting'] },
    { name: 'Physics', description: 'Deep understanding of matter, energy, and the fundamental forces of the universe.', effects: 'Allows Intellect checks to understand strange physical phenomena or weaponize scientific equipment.', prerequisites: ['Mathematics'] },
    { name: 'Mysticism', description: 'Understanding of spiritual or esoteric beliefs that may touch upon reality.', effects: 'Allows Sanity Saves to resist certain supernatural horrors or understand esoteric texts.', prerequisites: ['Archaeology'] },
    { name: 'Tactics', description: 'The art of maneuvering military forces in combat.', effects: 'Allows Intellect checks to gain a tactical advantage in combat, such as a surprise round or superior positioning.', prerequisites: ['Theology'] },
    { name: 'Gunnery', description: 'Operation of starship-grade weaponry.', effects: 'Allows Combat checks to fire ship-to-ship weapons accurately.', prerequisites: ['Military Training'] },
    { name: 'Firearms', description: 'Proficiency with a wide range of personal ranged weapons.', effects: 'Allows Combat checks with ranged weapons. Without this skill, you have Disadvantage on all firearm attacks.', prerequisites: ['Rimwise'] },
    { name: 'Hand-to-Hand Combat', description: 'Trained in unarmed and melee combat.', effects: 'Allows Combat checks for melee attacks. Unarmed attacks deal 1d5 damage instead of 1.', prerequisites: ['Athletics'] },
    { name: 'Explosives', description: 'Knowledge of creating, handling, and disarming explosive devices.', effects: 'Allows Intellect checks to safely handle, place, or disarm explosives.', prerequisites: ['Chemistry'] },
    // Master
    { name: 'Sophontology', description: 'The study of the psychology of intelligent alien species.', effects: 'Grants Advantage on checks made to negotiate with or deceive intelligent alien life.', prerequisites: ['Psychology'] },
    { name: 'Exobiology', description: 'The study of extraterrestrial life forms.', effects: 'Allows for an Intellect check to determine an alien creature\'s weaknesses and abilities after a brief observation.', prerequisites: ['Genetics'] },
    { name: 'Surgery', description: 'The ability to perform complex medical operations.', effects: 'Allows an Intellect check to perform surgery, which can heal a Wound or install cybernetics.', prerequisites: ['Pathology'] },
    { name: 'Robotics', description: 'The design, construction, and operation of robots and drones.', effects: 'Allows you to build, modify, and repair robotic assistants.', prerequisites: ['Engineering'] },
    { name: 'Artificial Intelligence', description: 'The creation and understanding of simulated human consciousness.', effects: 'Allows you to create, interface with, or attempt to control true AIs.', prerequisites: ['Hacking'] },
    { name: 'Command', description: 'The ability to lead and inspire others in high-stress situations.', effects: 'Once per session, you can give an order that allows a crewmate to re-roll a failed Panic Check.', prerequisites: ['Vehicle Specialization', 'Tactics'] },
    { name: 'Hyperspace', description: 'Esoteric knowledge of the bizarre realities of faster-than-light travel.', effects: 'Grants Advantage on all checks related to surviving or navigating hyperspace anomalies.', prerequisites: ['Astrogation'] },
    { name: 'Xenoesotericism', description: 'Understanding of obscure alien mysticism, rituals, and their potential effects.', effects: 'Grants a chance to understand and possibly counteract alien curses or psychic attacks.', prerequisites: ['Mysticism'] },
    { name: 'Wilderness Survival', description: 'Mastery of surviving in hostile, alien environments.', effects: 'Grants Advantage on all checks related to finding food, water, and shelter on alien worlds.', prerequisites: ['Firearms'] },
    { name: 'Cybernetics', description: 'The art of interfacing biological beings with machines.', effects: 'Allows you to install, repair, and create cybernetic enhancements.', prerequisites: ['Jury-Rigging'] }
];


export const LOADOUTS = [
    "Excavation: Crowbar, Hand Welder, Laser Cutter, Body Cam, Bioscanner, Infrared Goggles, Lockpick Set, Vaccsuit",
    "Exploration: Vibechete, Rigging Gun, Flare Gun, First Aid Kit, Vaccsuit, Survey Kit, Water Filter, Locator, Rebreather, Binoculars, Camping Gear, 7x MREs",
    "Extermination: SMG, 6x Frag Grenades, Standard Battle Dress, 6x Stimpaks, Electronic Tool Kit",
    "Examination: Scalpel, Tranq Pistol, Stun Baton, Hazard Suit, Medscanner, 6x Automeds, 6x Pain Pills, 6x Stimpaks, Cybernetic Diagnostic Scanner"
];

export const TRINKETS = ["Faded Photograph", "Faded Green Poker Chip", "Antique Company Script", "Dessicated Husk Doll", "Alien Pressed Flower", "Necklace of Shell Casings", "Corroded Android Logic Core", "Pamphlet: Signs of Parasitical Infection", "Manual: Treat Your Rifle Like A Lady", "Bone Knife", "Calendar: Alien Pin-Up Art", "Dog Tags (Heirloom)", "Holographic Serpentine Dancer", "Snake Whiskey", "Medical Container, Purple Powder", "Pills: Male Enhancement, Shoddy", "Casino Playing Cards", "Lagomorph Foot", "Moonstone Ring", "Manual: Mining Safety and You", "Pamphlet: Against Human Simulacrum", "Animal Skull, 3 Eyes, Curled Horns", "Bartender's Certification (Expired)", "Bent Wrench", "Prospecting Mug, Dented", "Eerie Mask", "Vantablack Marble", "Ivory Dice", "Tarot Cards, Worn", "Bag of Assorted Teeth", "Ashes (A Relative)", "DNR Beacon Necklace", "Cigarettes (Grinning Skull)", "Pills: Areca Nut"];
export const PATCHES = ["#1 Worker", "Security Guard patch", "Blood Type (Reference Patch)", "Red Shirt Logo", "“Don't Run You'll Only Die Tired” Backpatch", "Poker Hand: Dead Man's Hand", "Biohazard Symbol", "Mr. Yuck", "Nuclear Symbol", "Eat The Rich", "“Be Sure: Doubletap”", "Flame Emoji", "Smiley Face (Glow in the Dark)", "“Smile: Big Brother is Watching”", "Jolly Roger", "Viking Skull", "APEX PREDATOR (Sabertooth Skull)", "Pin-Up (Ace of Spades)", "Queen of Hearts", "Pin-Up (Mechanic)", "BOHICA", "Front Towards Enemy (Claymore Mine)", "Pin-Up (Riding Missile)", "FUBAR", "“I'm A (Love) Machine”", "Medic Patch (Skull and Crossbones on Logo)", "HELLO MY NAME IS:", "“Powered By Coffee”", "“Take Me To Your Leader” (UFO)", "DO YOUR JOB", "“Take My Life (Please)”", "“All Out of Fucks To Give”", "Allergic To Bullshit (Medical Style Patch)"];