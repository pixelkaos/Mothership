import type { CharacterClass, SkillDefinition, ShopItem, ArmorItem, WeaponItem, WoundEntry } from './types';

export const SHIP_NAME_PART1 = ["IAGO", "HECATE", "OBERON", "WHITEHALL", "DUNCAN", "BANQUO", "WINTER", "MARLOWE", "TEMPEST", "FAUST"];
export const SHIP_NAME_PART2 = ["VALEFOR", "OPHANIM", "MARAX", "MARINER", "LABOLAS", "ASTAROTH", "CHERUBIM", "TYRANT", "BALAAM", "MURMUR"];
export const SHIP_NAME_PART3 = ["ECHO", "ALPHA", "OMEGA", "KING", "BEGGAR", "DELTA", "EPSILON", "JIBRIL", "BRAVO", "TANGO"];

// This table is now used to determine the *model* of the derelict ship, which is then looked up in `data/shipData.ts` for full stats.
// This preserves the original probability distribution of ship types.
export const DERELICT_GENERATION_TABLE: { range: [number, number]; model: string; status: string; survivors: string; systems: string; salvage: { dice: string; item: string }[] }[] = [
    { range: [0, 0], model: 'Northstar Paragon', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{ dice: '1d10', item: 'Cryopods' }, { dice: '1d100', item: 'Trade Units' }, { dice: '2d10', item: 'Survivors' }] },
    { range: [1, 24], model: 'Sebaco RAS-62', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{ dice: '2d100', item: 'Scrap' }, { dice: '4d10', item: 'Ore' }, { dice: '1d10', item: 'Fuel Units' }] },
    { range: [25, 54], model: 'Valecore T9LC Platypus', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{ dice: '1d10', item: 'Fuel Units' }, { dice: '3d10', item: 'Metal' }] },
    { range: [55, 63], model: 'Merida Arcane-1', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{ dice: '1d10', item: 'Fuel Units' }, { dice: '3d10', item: 'Metal' }] },
    { range: [64, 77], model: 'Sato GS Grail VI', status: 'Uninhabitable', survivors: 'No Survivors', systems: 'Engine, Thrusters, Jump Drive non-functioning', salvage: [{ dice: '2d10', item: 'Galley Stock' }] },
    { range: [78, 81], model: 'Northstar Paragon', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{ dice: '1d100', item: 'Trade Units of Random Cargo' }, { dice: '1d10', item: 'Cryopods' }] },
    { range: [82, 83], model: 'Aava Industrial S5', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{ dice: '1d10', item: 'Precious Metal' }, { dice: '1d1', item: 'Medbay' }] },
    { range: [84, 86], model: 'Arma Type-19', status: 'Habitable (Non-Functioning)', survivors: 'No Survivors', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{ dice: '1d1', item: 'Weapon' }, { dice: '1d10', item: 'Precious Metal' }] },
    { range: [87, 89], model: 'Tannhäuser Hōshō', status: 'Habitable (Non-Functioning)', survivors: '2d10 Survivors (In Cryosleep)', systems: 'Stable Engine, Thrusters, Jump Drive', salvage: [{ dice: '1d10', item: 'Contraband' }, { dice: '1d1', item: 'Computer' }] },
    { range: [90, 99], model: 'BAS-Lehman Contessa', status: 'Habitable (Functioning)', survivors: 'Survivors', systems: 'Jump Drive', salvage: [{ dice: '1d1', item: 'Jump Drive' }, { dice: '1d1', item: 'Unstable Core' }] },
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
        description: 'Hardened soldiers of the corporate armies, marines excel at combat and are notoriously difficult to kill. Their panic, however, can be contagious.',
        stats_mods: { combat: 10 },
        saves_mods: { fear: 20, body: 10 },
        max_wounds_mod: 1,
        starting_skills: ['Military Training', 'Athletics'],
        bonus_skills: { choice: { expert: 1, trained: 2 } },
        trauma_response: 'Whenever you Panic, every close friendly player must make a Fear Save.'
    },
    {
        name: 'Android',
        description: 'Synthetic beings with cold inhumanity, Androids possess powerful processors that allow them to overcome fear. However, they often unnerve their organic crewmates.',
        stats_mods: { intellect: 20 },
        saves_mods: { fear: 60 },
        flexible_stats_mod: {
            amount: -10,
            description: "-10 to 1 Stat"
        },
        max_wounds_mod: 1,
        starting_skills: ['Linguistics', 'Computers', 'Mathematics'],
        bonus_skills: { choice: { expert: 1, trained: 2 } },
        trauma_response: 'Fear Saves made by close friendly players are at Disadvantage.'
    },
    {
        name: 'Scientist',
        description: "Doctors, researchers, and academics, Scientists are experts in their chosen fields. Their knowledge can be a great asset, though it often leads them to uncover things not meant to be known.",
        stats_mods: { intellect: 10 },
        saves_mods: { sanity: 30 },
        flexible_stats_mod: {
            amount: 5,
            description: "+5 to 1 Stat"
        },
        max_wounds_mod: 0,
        starting_skills: [], // Handled by master skill choice
        bonus_skills: { fixed: { trained: 1, expert: 0, master: 0 } },
        trauma_response: 'Whenever you fail a Sanity Save, all close friendly players gain 1 Stress.'
    },
    {
        name: 'Teamster',
        description: 'Blue-collar workers of the galaxy, Teamsters are pilots, miners, and engineers. They are tough, reliable, and know their way around heavy machinery.',
        stats_mods: { strength: 5, speed: 5, intellect: 5, combat: 5 },
        saves_mods: { sanity: 10, fear: 10, body: 10 },
        max_wounds_mod: 0,
        starting_skills: ['Industrial Equipment', 'Zero-G'],
        bonus_skills: { fixed: { trained: 1, expert: 1, master: 0 } },
        trauma_response: 'Once per session, you may take Advantage on a Panic Check.'
    }
];

export const ALL_SKILLS: SkillDefinition[] = [
    // Trained (+10)
    { name: 'Archaeology', tier: 'trained', description: 'Ancient cultures and artifacts.' },
    { name: 'Art', tier: 'trained', description: "The expression or application of a species' creative ability and imagination." },
    { name: 'Athletics', tier: 'trained', description: 'Physical fitness, sports, and games.' },
    { name: 'Botany', tier: 'trained', description: 'The study of plant life.' },
    { name: 'Chemistry', tier: 'trained', description: 'The study of matter and its chemical elements and compounds.' },
    { name: 'Computers', tier: 'trained', description: 'Fluent use of computers and their networks.' },
    { name: 'Geology', tier: 'trained', description: 'The study of the solid features of any terrestrial planet or its satellites.' },
    { name: 'Industrial Equipment', tier: 'trained', description: 'The safe and proper use of heavy machinery and tools (exosuits, forklifts, drills, breakers, laser cutters, etc.).' },
    { name: 'Jury-Rigging', tier: 'trained', description: 'Makeshift repair, using only the tools and materials at hand.' },
    { name: 'Linguistics', tier: 'trained', description: 'The study of languages (alive, dead, and undiscovered).' },
    { name: 'Mathematics', tier: 'trained', description: 'The study of numbers, quantity, and space.' },
    { name: 'Military Training', tier: 'trained', description: 'Basic training provided to all military personnel.' },
    { name: 'Rimwise', tier: 'trained', description: 'Practical knowledge and know-how regarding outer Rim colonies, their customs, and the seedier parts of the galaxy.' },
    { name: 'Theology', tier: 'trained', description: 'The study of the divine or devotion to a religion.' },
    { name: 'Zero-G', tier: 'trained', description: 'Practice and know-how of working in a vacuum, orientation, vaccsuit operation, etc.' },
    { name: 'Zoology', tier: 'trained', description: 'The study of animal life.' },

    // Expert (+15)
    { name: 'Asteroid Mining', tier: 'expert', description: 'Training in the tools and procedures used for mining asteroids.', prerequisites: ['Geology'] },
    { name: 'Ecology', tier: 'expert', description: 'The study of organisms and how they relate to their environment.', prerequisites: ['Botany'] },
    { name: 'Explosives', tier: 'expert', description: 'Design and effective use of explosive devices (bombs, grenades, shells, land mines, etc.).', prerequisites: ['Chemistry'] },
    { name: 'Field Medicine', tier: 'expert', description: 'Emergency medical care and treatment.', prerequisites: ['Zoology'] },
    { name: 'Firearms', tier: 'expert', description: 'Safe and effective use of guns.', prerequisites: ['Military Training'] },
    { name: 'Hacking', tier: 'expert', description: 'Unauthorized access to computer systems and networks.', prerequisites: ['Computers'] },
    { name: 'Hand-to-Hand Combat', tier: 'expert', description: 'Melee fighting, brawling, martial arts, etc.', prerequisites: ['Athletics'] },
    { name: 'Mechanical Repair', tier: 'expert', description: 'Fixing broken machines.', prerequisites: ['Industrial Equipment'] },
    { name: 'Mysticism', tier: 'expert', description: 'Spiritual apprehension of hidden knowledge.', prerequisites: ['Art', 'Archaeology'] },
    { name: 'Pathology', tier: 'expert', description: 'Study of the causes and effects of diseases.', prerequisites: ['Field Medicine'] },
    { name: 'Pharmacology', tier: 'expert', description: 'Study of drugs and medication.', prerequisites: ['Chemistry'] },
    { name: 'Physics', tier: 'expert', description: 'Study of matter, motion, energy, and their effects in space and time.', prerequisites: ['Mathematics'] },
    { name: 'Piloting', tier: 'expert', description: 'Operation and control of aircraft, spacecraft, and other vehicles.', prerequisites: ['Zero-G'] },
    { name: 'Psychology', tier: 'expert', description: 'The study of behavior and the human mind.', prerequisites: ['Linguistics'] },
    { name: 'Wilderness Survival', tier: 'expert', description: 'Applicable know-how regarding the basic necessities of life (food, water, shelter) in a natural environment.', prerequisites: ['Theology', 'Rimwise'] },

    // Master (+20)
    { name: 'Artificial Intelligence', tier: 'master', description: 'The study of intelligence as demonstrated by machines.', prerequisites: ['Hacking'] },
    { name: 'Command', tier: 'master', description: 'Leadership, management, and authority.', prerequisites: ['Firearms', 'Hand-to-Hand Combat'] },
    { name: 'Cybernetics', tier: 'master', description: 'The physical and neural interfaces between organisms and machines.', prerequisites: ['Explosives'] },
    { name: 'Engineering', tier: 'master', description: 'The design, building, and use of engines, machines, and structures.', prerequisites: ['Mechanical Repair'] },
    { name: 'Exobiology', tier: 'master', description: 'The study of and search for intelligent alien life.', prerequisites: ['Ecology', 'Pathology'] },
    { name: 'Hyperspace', tier: 'master', description: 'Faster-than-light travel.', prerequisites: ['Physics', 'Piloting'] },
    { name: 'Planetology', tier: 'master', description: 'Study of planets and other celestial bodies.', prerequisites: ['Asteroid Mining'] },
    { name: 'Robotics', tier: 'master', description: 'Design, maintenance, and operation of robots, drones, and androids.', prerequisites: ['Engineering'] },
    { name: 'Sophontology', tier: 'master', description: 'The study of the behavior and mind of inhuman entities.', prerequisites: ['Psychology'] },
    { name: 'Surgery', tier: 'master', description: 'Manually operating on living or dead biological subjects.', prerequisites: ['Exobiology'] },
    { name: 'Xenoesotericism', tier: 'master', description: 'Obscure beliefs, mysticism, and religion regarding non-human entities.', prerequisites: ['Mysticism'] }
];


export const STARTING_EQUIPMENT_TABLES: Record<string, string[]> = {
    'Marine': [
        "Tank Top and Camo Pants (AP 1), Combat Knife (as Scalpel DMG [+]), Stimpak (x5)",
        "Advanced Battle Dress (AP 10), Flamethrower, Boarding Axe",
        "Standard Battle Dress (AP 7), Combat Shotgun (4 rounds), Rucksack, Camping Gear",
        "Standard Battle Dress (AP 7), Pulse Rifle (3 mags), Infrared Goggles",
        "Standard Battle Dress (AP 7), Smart Rifle (3 mags), Binoculars, Personal Locator",
        "Standard Battle Dress (AP 7), SMG (3 mags), MRE (x7)",
        "Fatigues (AP 2), Combat Shotgun (2 rounds), Dog (pet), Leash, Tennis Ball",
        "Fatigues (AP 2), Revolver (12 rounds), Frag Grenade",
        "Dress Uniform (AP 1), Revolver (1 round), Challenge Coin",
        "Advanced Battle Dress (AP 10), General-Purpose Machine Gun (1 Can of ammo), HUD"
    ],
    'Android': [
        "Vaccsuit (AP 3), Smart Rifle (2 mags), Infrared Goggles, Mylar Blanket",
        "Vaccsuit (AP 3), Revolver (12 rounds), Long-range Comms, Satchel",
        "Hazard Suit (AP 5), Revolver (6 rounds), Defibrillator, First Aid Kit, Flashlight",
        "Hazard Suit (AP 5), Foam Gun (2 charges), Sample Collection Kit, Screwdriver (as Assorted Tools)",
        "Standard Battle Dress (AP 7), Tranq Pistol (3 shots), Paracord (100m)",
        "Standard Crew Attire (AP 1), Stun Baton, Small Pet (organic).",
        "Standard Crew Attire (AP 1), Scalpel, Bioscanner",
        "Standard Crew Attire (AP 1), Frag Grenade, Pen Knife",
        "Manufacturer Supplied Attire (AP 1), Jump-9 Ticket (destination blank)",
        "Corporate Attire (AP 1), VIP Corporate Key Card"
    ],
    'Scientist': [
        "Hazard Suit (AP 5), Tranq Pistol (3 shots), Bioscanner, Sample Collection Kit",
        "Hazard Suit (AP 5), Flamethrower (1 charge), Stimpak (x1), Electronic Tool Set",
        "Vaccsuit (AP 3), Rigging Gun, Sample Collection Kit, Flashlight, Lab Rat (pet)",
        "Vaccsuit (AP 3), Foam Gun (2 charges), Foldable Stretcher, First Aid Kit, Radiation Pills",
        "Lab Coat (AP 1), Screwdriver (as Assorted Tools), Medscanner, Vaccine (1 dose)",
        "Lab Coat (AP 1), Cybernetic Diagnostic Scanner, Portable Computer Terminal",
        "Scrubs (AP 1), Scalpel, Automed (x5), Oxygen Tank with Filter Mask",
        "Scrubs (AP 1), Vial of Acid, Mylar Blanket, First Aid Kit",
        "Standard Crew Attire (AP 1), Utility Knife (as Scalpel), Cybernetic Diagnostic Scanner, Duct Tape",
        "Civilian Clothes (AP 1), Briefcase, Prescription Pad, Fountain Pen (Poison Injector)"
    ],
    'Teamster': [
        "Vaccsuit (AP 3), Laser Cutter (1 extra battery), Patch Kit, Toolbelt with assorted tools",
        "Vaccsuit (AP 3), Revolver (6 rounds), Crowbar, Flashlight",
        "Vaccsuit (AP 3), Rigging Gun, Shovel, Salvage Drone",
        "Hazard Suit (AP 5), Vibechete, Spanner, Camping Gear, Water Filter",
        "Heavy Duty Work Clothes (AP 2), Explosives & Detonator, Cigarettes",
        "Heavy Duty Work Clothes (AP 2), Drill (as Assorted Tools), Paracord (100m), Salvage Drone",
        "Standard Crew Attire (AP 1), Combat Shotgun (4 rounds), Extension Cord (20m), Cat",
        "Standard Crew Attire (AP 1), Nail Gun (32 rounds), Head Lamp, Toolbelt with assorted tools, Lunch Box",
        "Standard Crew Attire (AP 1), Flare Gun (2 rounds), Water Filtration Device, Personal Locator, Subsurface Scanner",
        "Lounge Wear (AP 1), Crowbar, Stimpak, Six Pack of Beer"
    ]
};

export const TRINKETS = [
    "Manual: PANIC: Harbinger of Catastrophe", "Antique Company Scrip (Asteroid Mine)", "Manual: SURVIVAL: Eat Soup With a Knife", "Dessicated Husk Doll", "Pressed Alien Flower (common)", "Necklace of Shell Casings", "Corroded Android Logic Core", "Pamphlet: Signs of Parasitical Infection", "Manual: Treat Your Rifle Like A Lady", "Bone Knife", "Calendar: Alien Pin-Up Art", "Rejected Application (Colony Ship)", "Holographic Serpentine Dancer", "Snake Whiskey", "Medical Container, Purple Powder", "Pills: Male Enhancement, Shoddy", "Casino Playing Cards", "Lagomorph Foot", "Moonstone Ring", "Manual: Mining Safety and You", "Pamphlet: Against Human Simulacra", "Animal Skull, 3 Eyes, Curled Horns", "Bartender's Certification (Expired)", "Bunraku Puppet", "Prospecting Mug, Dented", "Eerie Mask", "Ultrablack Marble", "Ivory Dice", "Tarot Cards, Worn, Pyrite Gilded Edges", "Bag of Assorted Teeth", "Ashes (A Relative)", "DNR Beacon Necklace", "Cigarettes (Grinning Skull)", "Pills: Areca Nut", "Pendant: Shell Fragments Suspended in Plastic", "Pamphlet: Zen and the Art of Cargo Arrangement", "Pair of Shot Glasses (Spent Shotgun Shells)", "Key (Childhood Home)", "Dog Tags (Heirloom)", "Token: “Is Your Morale Improving?”", "Pamphlet: The Relic of Flesh", "Pamphlet: The Indifferent Stars", "Calendar: Military Battles", "Manual: Rich Captain, Poor Captain", "Campaign Poster (Home Planet)", "Preserved Insectile Aberration", "Titanium Toothpick", "Gloves, Leather (Xenomorph Hide)", "Smut (Seditious): The Captain, Ordered", "Towel, Slightly Frayed", "Brass Knuckles", "Fuzzy Handcuffs", "Journal of Grudges", "Stylized Cigarette Case", "Ball of Assorted Gauge Wire", "Spanner", "Switchblade, Ornamental", "Powdered Xenomorph Horn", "Bonsai Tree, Potted", "Golf Club (Putter)", "Trilobite Fossil", "Pamphlet: A Lover In Every Port", "Patched Overalls, Personalized", "Fleshy Thing Sealed in a Murky Jar", "Spiked Bracelet", "Harmonica", "Pictorial Pornography, Dog-eared, Well-thumbed", "Coffee Cup, Chipped, reads: HAPPINESS IS MANDATORY", "Manual: Moonshining With Gun Oil & Fuel", "Miniature Chess Set, Bone, Pieces Missing", "Gyroscope, Bent, Tin", "Faded Green Poker Chip", "Ukulele", "Spray Paint", "Wanted Poster, Weathered", "Locket, Hair Braid", "Sculpture of a Rat (Gold)", "Blanket, Fire Retardant", "Hooded Parka, Fleece-Lined", "BB Gun", "Flint Hatchet", "Pendant: Two Astronauts form a Skull", "Rubik's Cube", "Stress Ball, reads: Zero Stress in Zero G", "Sputnik Pin", "Ushanka", "Trucker Cap, Mesh, Grey Alien Logo", "Menthol Balm", "Pith Helmet", "10m x 10m Tarp", "I Ching, Missing Sticks", "Kukri", "Trench Shovel", "Shiv, Sharpened Butter Knife", "Taxidermied Cat", "Pamphlet: Interpreting Sheep Dreams", "Faded Photograph, A Windswept Heath", "Opera Glasses", "Pamphlet: Android Overlords", "Interstellar Compass, Always Points to Homeworld"
];

export const PATCHES = [
    "“I'm Not A Rocket Scientist / But You're An Idiot”", "Medic Patch (Skull and Crossbones over Cross)", "“Don't Run You'll Only Die Tired” Backpatch", "Red Shirt Logo", "Blood Type (Reference Patch)", "“Do I LOOK Like An Expert?”", "Biohazard Symbol", "Mr. Yuck", "Nuclear Symbol", "“Eat The Rich”", "“Be Sure: Doubletap”", "Flame Emoji", "Smiley Face (Glow in the Dark)", "“Smile: Big Brother is Watching”", "Jolly Roger", "Viking Skull", "“APEX PREDATOR” (Sabertooth Skull)", "Pin-Up Model (Ace of Spades)", "Queen of Hearts", "Security Guard", "“LONER”", "“Front Towards Enemy” (Claymore Mine)", "Pin-Up Model (Riding Missile)", "FUBAR", "“I'm A (Love) Machine”", "Pin-Up Model (Mechanic)", "“HELLO MY NAME IS:”", "“Powered By Coffee”", "“Take Me To Your Leader” (UFO)", "“DO YOUR JOB”", "“Take My Life (Please)”", "“Upstanding Citizen”", "“Allergic To Bullshit” (Medical Style Patch)", "“Fix Me First” (Caduceus)", "“I Like My Tools Clean / And My Lovers Dirty”", "“The Louder You Scream the Faster I Come” (Nurse Pin-Up)", "HMFIC (Head Mother Fucker In Charge)", "Dove in Crosshairs", "Chibi Cthulhu", "“Welcome to the DANGER ZONE”", "Skull and Crossed Wrenches", "Pin-Up Model (Succubus)", "“DILLIGAF?”", "“DRINK / FIGHT / FUCK”", "“Work Hard / Party Harder”", "Mudflap Girl", "Fun Meter (reads: Bad Time)", "“GAME OVER” (Bride & Groom)", "Heart", "“IMPROVE / ADAPT / OVERCOME”", "“SUCK IT UP”", "“Cowboy Up” (Crossed Revolvers)", "“Troubleshooter”", "NASA Logo", "Crossed Hammers with Wings", "“Keep Well Lubricated”", "Soviet Hammer & Sickle", "“Plays Well With Others”", "“Live Free and Die”", "“IF I'M RUNNING KEEP UP” Backpatch", "“Meat Bag”", "“I Am Not A Robot”", "Red Gear", "“I Can't Fix Stupid”", "“Space IS My Home” (Sad Astronaut)", "All Seeing Eye", "“Solve Et Coagula” (Baphomet)", "“All Out of Fucks To Give” (Astronaut with Turned Out Pockets)", "“Travel To Distant Places / Meet Unusual Things / Get Eaten”", "BOHICA (Bend Over Here It Comes Again)", "“I Am My Brother's Keeper”", "“Mama Tried”", "Black Widow Spider", "“My Other Ride Married You”", "“One Size Fits All” (Grenade)", "Grim Reaper Backpatch", "отъебись (“Fuck Off,” Russian)", "“Smooth Operator”", "Atom Symbol", "“For Science!”", "“Actually, I AM A Rocket Scientist”", "“Help Wanted”", "Princess", "“NOMAD”", "“GOOD BOY”", "Dice (Snake Eyes)", "“#1 Worker”", "“Good” (Brain)", "“Bad Bitch”", "“Too Pretty To Die”", "“Fuck Forever” (Roses)", "Icarus", "“Girl's Best Friend” (Diamond)", "Risk of Electrocution Symbol", "Inverted Cross", "“Do You Sign My Paychecks?” Backpatch", "“I ♥ Myself”", "Double Cherry", "“Volunteer”", "Poker Hand: Dead Man's Hand* *Aces Full Of Eights"
];

export const SHOP_ITEMS: ShopItem[] = [
    { name: 'Assorted Tools', price: '20cr', description: 'Wrenches, spanners, screwdrivers, etc. Can be used as weapons in a pinch (1d5 DMG).' },
    { name: 'Automed (x5)', price: '1.5kcr', description: 'Nanotech pills that assist your body in repairing Damage by granting Advantage to Body Saves meant to repel disease and poison, as well as attempts to heal from rest.' },
    { name: 'Battery (High Power)', price: '500cr', description: 'Heavy duty battery used for powering laser cutters, salvage drones, and other items. Can be recharged in 1 hour if connected to power or in 6 hours with solar power. Add waterproofing (+500cr).' },
    { name: 'Binoculars', price: '150cr', description: '20x magnification. Add night vision (+300cr) or thermal vision (+1kcr).' },
    { name: 'Bioscanner', price: '3kcr', description: "Long Range. Allows the user to scan for signs of life. Can tell the location of signs of life, but not what that life is. Blocked by some materials at the Warden's discretion." },
    { name: 'Body Cam', price: '50cr', description: "A camera worn on your clothing that can stream video back to a control center so your other crewmembers can see what you're seeing. Add night vision (+300cr) or thermal vision (+1kcr)." },
    { name: 'Chemlight (x5)', price: '5cr', description: 'Small disposable glowsticks capable of dim illumination in a 1m radius.' },
    { name: 'Crowbar', price: '25cr', description: 'Grants Advantage on Strength Checks to open jammed airlocks, lift heavy objects, etc.' },
    { name: 'Cybernetic Diagnostic Scanner', price: '2kcr', description: 'Allows the user to scan androids and other cybernetic organisms in order to diagnose any physical or mental issues they may be having. Often distrusted by androids.' },
    { name: 'Electronic Tool Set', price: '100cr', description: 'A full set of tools for doing detailed repair or construction work on electronics.' },
    { name: 'Emergency Beacon', price: '2kcr', description: 'A small device that sends up a flare and then emits a loud beep every few seconds. Additionally, sends out a call on all radio channels to ships or vehicles in the area, but can be blocked by a radio jammer.' },
    { name: 'Exoloader', price: '100kcr', description: 'Open-air mechanical exoskeleton used for heavy lifting (up to 5000kg). Loader claws deal 1 Wound. User can only wear Standard Crew Attire or Standard Battle Dress while operating. Battery operated (48 hours of use).' },
    { name: 'Explosives & Detonator', price: '500cr', description: 'Explosive charge powerful enough to blow open an airlock. All organisms in Close Range must make a Body Save or take a Wound (Explosive). Detonator works at Long Range, but can be blocked by a radio jammer.' },
    { name: 'First Aid Kit', price: '75cr', description: 'An assortment of dressings and treatments to help stop bleeding, bandage cuts, and treat other minor injuries.' },
    { name: 'Flashlight', price: '30cr', description: 'Handheld or shoulder mounted. Illuminates 10m ahead of the user.' },
    { name: 'Foldable Stretcher', price: '150cr', description: 'Portable stretcher that can fit within a rucksack. Allows the user to safely strap down the patient and carry them to a location where their wounds can be better treated. Unfolds to roughly 2m.' },
    { name: 'Geiger Counter', price: '20cr', description: 'Detects radiation and displays radiation levels.' },
    { name: 'Heads-Up Display (HUD)', price: '100cr', description: 'Often worn by marines, the HUD allows the wearer to see through the body cams of others in their unit, and connect to any smart-link upgaded weapon.' },
    { name: 'Infrared Goggles', price: '1.5kcr', description: 'Allows the wearer to see heat signatures, sometimes up to several hours old. Add night vision (+300cr).' },
    { name: 'Jetpack', price: '75kcr', description: 'Allows wearer to fly up to 100m high and up to a speed of 100km/hr for 2 hours on a tank of fuel. Deals 1d100[+] DMG if destroyed. Fuel can be refilled for 200cr.' },
    { name: 'Lockpick Set', price: '40cr', description: 'A highly advanced set of tools meant for hacking basic airlock and electronic door systems.' },
    { name: 'Long-range Comms', price: '1kcr', description: 'Rucksack-sized communication device for use in surface-to-ship comunication.' },
    { name: 'Mag-boots', price: '350cr', description: 'Grants a magnetic grip to the wearer, allowing them to easily walk on the exterior of a a ship (in space, while docked, or free-floating), metal-based asteroids, or any other magnetic surface.' },
    { name: 'Medscanner', price: '8kcr', description: 'Allows the user to scan a living or dead body to analyze it for disease or abnormalities, without having to do a biopsy or autopsy. Results may not be instaneous and may require a lab for complete analysis.' },
    { name: 'MoHab Unit', price: '1kcr', description: 'Tent, canteen, stove, rucksack, compass, and sleeping bag.' },
    { name: 'MRE (x7)', price: '70cr', description: '"Meal, Ready-to-Eat." Self-contained, individual field rations in lightweight packaging. Each has sufficient sustenance for a single person for one day (does not include water).' },
    { name: 'Mylar Blanket', price: '10cr', description: 'Lightweight blanket made of heat-reflective material. Often used for thermal regulation of patients suffering from extreme cold or other trauma.' },
    { name: 'Oxygen Tank', price: '50cr', description: 'When attached to a vaccsuit provides up to 12 hours of oxygen under normal circumstances, 4 hours under stressful circumstances. Explosive.' },
    { name: 'Paracord (50m)', price: '10cr', description: 'General purpose lightweight nylon rope.' },
    { name: 'Patch Kit (x3)', price: '200cr', description: 'Repairs punctured and torn vaccsuits, restoring their space readiness. Patched vaccsuits have an AP of 1.' },
    { name: 'Personal Locator', price: '200cr', description: 'Allows crewmembers at a control center (or on the bridge of a ship) to track the location of the wearer.' },
    { name: 'Pet (Organic)', price: '200kcr', description: 'Small to medium-sized organic pet animal. Larger or rare pets cost 2d10x base pet cost.' },
    { name: 'Pet (Synthetic)', price: '15kcr', description: 'Small to medium-sized synthetic pet animal. Larger or rare pets cost 2d10x base pet cost.' },
    { name: 'Portable Computer Terminal', price: '1.5kcr', description: 'Flat computer monitor, keyboard and interface which allows the user to hack into pre-existing computers and networks, as well as perform standard computer tasks.' },
    { name: 'Radiation Pills (x5)', price: '200cr', description: 'Take 1d5 DMG and reduce your Radiation Level by 1 for 2d10 minutes.' },
    { name: 'Radio Jammer', price: '4kcr', description: 'Rucksack-sized device which, when activated, renders all radio signals within 100km incomprehensible.' },
    { name: 'Rebreather', price: '500cr', description: 'When worn, filters toxic air and/or allows for underwater breathing for up to 20 minutes at a time without resurfacing. Can be connected to an oxygen tank.' },
    { name: 'Rucksack', price: '50cr', description: 'Large, durable, waterproof backpack.' },
    { name: 'Salvage Drone', price: '10kcr', description: 'Battery operated remote controlled drone. Can fly up to 450m high, to a distance of 3km from operator. Can run for 2 hours. Can be equipped with up to two of the following: binoculars, radio jammer, Geiger counter, laser cutter, medscanner, personal locator, infrared goggles, emergency beacon, cybernetic diagnostic scanner, bioscanner. Can carry up to 20-30kg.' },
    { name: 'Sample Collection Kit', price: '50cr', description: 'Used to research xenoflora and xenofauna in the field. Can take vital signs, DNA samples, and collect other data on foreign material.' },
    { name: 'Short-range Comms', price: '100cr', description: 'Allows communication from ship-to-ship within a reasonable distance, as well as surface-to-surface within a dozen kilometers. Blocked by radio jammer.' },
    { name: 'Smart-link Add-On', price: '10kcr', description: 'Grants remote viewing, recording, and operation of a ranged weapon as well as +5 DMG to the weapon.' },
    { name: 'Stimpak', price: '1kcr ea.', description: 'Cures cryosickness, reduces Stress by 1, restores 1d10 Health, and grants [+] to all rolls for 1d10 min. Roll 1d10. If you roll under the amount of doses you’ve taken in the past 24 hours, make a Death Save.' },
    { name: 'Water Filtration Device', price: '50cr', description: 'Can pump 4 liters of filtered water per hour from even the most brackish swamps.' },
];

export const ARMOR_ITEMS: ArmorItem[] = [
    { name: 'Standard Crew Attire', description: 'Basic clothing.', cost: '100cr', ap: 1, o2: 'None', speed: 'Normal', special: '' },
    { name: 'Vaccsuit', description: 'Designed for outer space operations.', cost: '10kcr', ap: 3, o2: '12 hrs', speed: '[-]', special: 'Includes short-range comms, headlamp, and radiation shielding. Decompression within 1d5 rounds if punctured.' },
    { name: 'Hazard Suit', description: 'Environmental protection while exploring unknown planets.', cost: '4kcr', ap: 5, o2: '1 hr', speed: 'Normal', special: 'Includes air filter, extreme heat/cold protection, hydration reclamation (1L of water lasts 4 days), short-range comms, headlamp, and radiation shielding.' },
    { name: 'Standard Battle Dress', description: 'Lightly-plated armor worn by most marines.', cost: '2kcr', ap: 7, o2: 'None', speed: 'Normal', special: 'Includes short-range comms.' },
    { name: 'Advanced Battle Dress', description: 'Heavy armor for marines deployed in high combat offworld engagements.', cost: '12kcr', ap: 10, o2: '1 hr', speed: '[-]', special: 'Includes short-range comms, body cam, headlamp, HUD, exoskeletal weave (Strength Checks [+]), and radiation shielding.', dr: 3 },
];

export const WEAPON_ITEMS: WeaponItem[] = [
    { name: 'Ammo', cost: '50cr', range: 'N/A', damage: 'N/A', shots: 'N/A', wound: '', special: 'Per magazine/container.' },
    { name: 'Boarding Axe', cost: '150cr', range: 'Adjacent', damage: '2d10 DMG', shots: 'N/A', wound: 'Gore [+]', special: '' },
    { name: 'Combat Shotgun', cost: '1,400cr', range: 'Close', damage: '4d10 DMG', shots: '4', wound: 'Gunshot', special: '1d10 DMG at Long Range or greater.' },
    { name: 'Crowbar', cost: '25cr', range: 'Adjacent', damage: '1d5 DMG', shots: 'N/A', wound: 'Blunt Force [+]', special: 'Grants [+] on Strength Checks to open jammed airlocks, lift heavy objects, etc.' },
    { name: 'Flamethrower', cost: '4kcr', range: 'Close', damage: '2d10 DMG', shots: '4', wound: 'Fire/Explosives [+]', special: 'Body Save [-] or be set on fire (2d10 DMG/round).' },
    { name: 'Flare Gun', cost: '25cr', range: 'Long', damage: '1d5 DMG', shots: '2', wound: 'Fire/Explosives [-]', special: 'High intensity flare visible day and night from Long Range.' },
    { name: 'Foam Gun', cost: '500cr', range: 'Close', damage: '1 DMG', shots: '3', wound: 'Blunt Force', special: 'Body Save or become stuck. Strength Check [-] to escape.' },
    { name: 'Frag Grenade', cost: '400cr ea.', range: 'Close', damage: '3d10 DMG', shots: '1', wound: 'Fire/Explosives', special: 'On a hit, damages all Adjacent to enemy.' },
    { name: 'General-Purpose Machine Gun', cost: '4.5kcr', range: 'Long', damage: '4d10 DMG', shots: '5', wound: 'Gunshot [+]', special: 'Two-handed. Heavy. Barrel can be maneuvered to fire around corners.' },
    { name: 'Hand Welder', cost: '250cr', range: 'Adjacent', damage: '1d10 DMG', shots: 'N/A', wound: 'Bleeding', special: 'Can cut through airlock doors.' },
    { name: 'Laser Cutter', cost: '1,200cr', range: 'Long', damage: '1d100 DMG', shots: '6', wound: 'Bleeding [+] or Gore [+]', special: 'Two-handed. Heavy. 1 round between shots. Reload: 1hr (power), 6hr (solar).' },
    { name: 'Nail Gun', cost: '150cr', range: 'Close', damage: '1d5 DMG', shots: '32', wound: 'Bleeding', special: '' },
    { name: 'Pulse Rifle', cost: '2.4kcr', range: 'Long', damage: '3d10 DMG', shots: '5', wound: 'Gunshot', special: '' },
    { name: 'Revolver', cost: '750cr', range: 'Close', damage: '1d10+1 DMG', shots: '6', wound: 'Gunshot', special: '' },
    { name: 'Rigging Gun', cost: '350cr', range: 'Close', damage: '1d10 DMG + 2d10 DMG when removed', shots: '1', wound: 'Bleeding [+]', special: '100m microfilament. Body Save or become entangled.' },
    { name: 'Scalpel', cost: '50cr', range: 'Adjacent', damage: '1d5 DMG', shots: 'N/A', wound: 'Bleeding [+]', special: '' },
    { name: 'Smart Rifle', cost: '5kcr', range: 'Extreme', damage: '4d10 DMG', shots: '3', wound: 'Gunshot [+]', special: '[-] on Combat Check when fired at Close Range.', aa: true },
    { name: 'SMG', cost: '1kcr', range: 'Long', damage: '2d10 DMG', shots: '5', wound: 'Gunshot', special: 'Can be fired one-handed.' },
    { name: 'Stun Baton', cost: '150cr', range: 'Adjacent', damage: '1d5 DMG', shots: 'N/A', wound: 'Blunt Force', special: 'Body Save or stunned 1 round.' },
    { name: 'Tranq Pistol', cost: '250cr', range: 'Close', damage: '1d5 DMG', shots: '6', wound: 'Blunt Force', special: 'If DMG dealt: enemy must Body Save or be unconscious 1d10 rounds.' },
    { name: 'Unarmed', cost: 'Free', range: 'Adjacent', damage: 'Str/10 DMG', shots: 'N/A', wound: 'Blunt Force', special: '' },
    { name: 'Vibechete', cost: '1kcr', range: 'Adjacent', damage: '3d10 DMG', shots: 'N/A', wound: 'Bleeding + Gore', special: 'When dealing a Wound, roll on BOTH the Bleeding AND Gore columns.', aa: true },
];

export const WOUND_TABLE: WoundEntry[] = [
    { severity: 'Flesh Wound', bluntForce: 'Knocked down.', bleeding: 'Drop held item.', gunshot: 'Grazed. Knocked down.', fireExplosives: 'Hair burnt. Gain 1d5 Stress.', goreMassive: 'Vomit. [-] on next action.' },
    { severity: '', bluntForce: 'Winded. [-] until you catch your breath.', bleeding: 'Lots of blood. Those Close gain 1 Stress.', gunshot: 'Bleeding +1.', fireExplosives: 'Awesome scar. +1 Minimum Stress.', goreMassive: 'Awesome scar. +1 Minimum Stress.' },
    { severity: 'Minor Injury', bluntForce: 'Sprained Ankle. [-] on Speed Checks.', bleeding: 'Blood in eyes. [-] until wiped clean.', gunshot: 'Broken rib.', fireExplosives: 'Singed. [-] on next action.', goreMassive: 'Digit mangled.' },
    { severity: '', bluntForce: 'Concussion. [-] on mental tasks.', bleeding: 'Laceration. Bleeding +1.', gunshot: 'Fractured extremity.', fireExplosives: 'Shrapnel/large burn.', goreMassive: 'Eyes gouged out.' },
    { severity: '', bluntForce: 'Leg or foot broken. [-] on Speed Checks.', bleeding: 'Major cut. Bleeding +2.', gunshot: 'Internal bleeding. Bleeding +2.', fireExplosives: '3rd degree burns.', goreMassive: 'Ripped off flesh. -1d10 Strength.' },
    { severity: 'Major Injury', bluntForce: 'Arm or hand broken. [-] manual tasks.', bleeding: 'Fingers/toes severed. Bleeding +3.', gunshot: 'Lodged bullet. Surgery required.', fireExplosives: 'Major Burn. Body Save -2d10.', goreMassive: 'Paralysed waist down.' },
    { severity: '', bluntForce: 'Snapped collarbone. [-] on Strength Checks.', bleeding: 'Hand/foot severed. Bleeding +4.', gunshot: 'Gunshot wound to the neck.', fireExplosives: 'Skin grafts required. Body Save -2d10.', goreMassive: 'Limb severed. Bleeding +5.' },
    { severity: 'Lethal Injury (Death Save in 1d10 rounds)', bluntForce: 'Back broken. [-] on all rolls.', bleeding: 'Limb severed. Bleeding +5.', gunshot: 'Major blood loss. Bleeding +4.', fireExplosives: 'Limb on fire. 2d10 Damage per round.', goreMassive: 'Impaled. Bleeding +6.' },
    { severity: '', bluntForce: 'Skull fracture. [-] on all rolls.', bleeding: 'Major artery cut. Bleeding +6.', gunshot: 'Sucking chest wound. Bleeding +5.', fireExplosives: 'Body on fire. 3d10 Damage per round.', goreMassive: 'Guts spooled on floor. Bleeding +7.' },
    { severity: 'Fatal Injury (Death Save)', bluntForce: 'Spine or neck broken. Death Save.', bleeding: 'Throat slit or heart pierced. Death Save.', gunshot: 'Headshot. Death Save.', fireExplosives: 'Engulfed in fiery explosion. Death Save.', goreMassive: 'Head explodes. No Death Save. You have died.' }
];

export const DEATH_TABLE = [
    { range: '1', result: 'You are unconscious. You wake up in 2d10 minutes. Reduce your Maximum Health by 1d5.' },
    { range: '2-3', result: 'You are unconscious and dying. You die in 1d5 rounds without intervention.' },
    { range: '4-5', result: 'You are comatose. Only extraordinary measures can return you to the waking world.' },
    { range: '6-10', result: 'You have died. Roll up a new character.' },
];