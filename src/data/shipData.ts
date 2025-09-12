import type { ShipData, ShipUpgrade, ShipWeapon } from '@/types';

export const SHIP_DATA: ShipData[] = [
    {
        name: 'Merida Arcane-1',
        modelCode: 'Dropship',
        stats: { thrusters: 0, systems: 0, weapons: 0 },
        cost: '50 MCR',
        crew: 14, cryopods: 0, fuel: 0, escape_pods: '0', hardpoints: '0',
        megadamage: 'N/A', upgrades: '0',
        description: "The Dropship is the standard planetary insertion vehicle built for bringing crews and platoons down to the surface of a planet, asteroid, or moon. While it has a small amount of capability in interplanetary travel, it's small fuel capacity an non-existent combat capabilities make it a last resort option for an interplanetary traveller.",
        image: ''
    },
    {
        name: 'Aava Industrial S5',
        modelCode: 'J1C-I Raider',
        stats: { thrusters: 20, systems: 5, weapons: 5 },
        cost: '75 MCR',
        crew: 8, cryopods: 8, fuel: 12, escape_pods: '1 Coffin Lander', hardpoints: '0/2',
        megadamage: '1', upgrades: '0/4',
        notes: 'Any Dropship added to the Raider does not increase the crew capacity of the Raider.',
        description: "A cheap vessel, barely more than a Dropship strapped to an orbital habitation unit, the Raider is the ultimate choice for cash-strapped firms and anyone looking to fly below the radar. It's heavy modularity makes it incredibly popular with criminals, pirates, and bounty hunters.",
        image: ''
    },
    {
        name: 'Sato GS Grail VI',
        modelCode: 'J2C-I Executive Transport',
        stats: { thrusters: 35, systems: 35, weapons: 5 },
        cost: '350 MCR',
        crew: 16, cryopods: 16, fuel: 14, escape_pods: '4', hardpoints: '0/1',
        megadamage: '0 (Base 1)', upgrades: '3/3',
        notes: 'Rest Saves relieve +1 Stress while aboard.',
        description: 'Equipped with a Jump-2 drive, state-of-the-art medbay, and ample cabin space, the executive transport is envied across the galaxy. Primarily built to shuttle C-Levels to and from the core, the Executive Transport also often serves as a kind of gambling ship, miniature space casino, micro-resort, or hedonistic pirate den.',
        image: ''
    },
    {
        name: 'Valecore T9LC Platypus',
        modelCode: 'J1C-II Freighter',
        stats: { thrusters: 25, systems: 20, weapons: 20 },
        cost: '250 MCR',
        crew: 12, cryopods: 12, fuel: 12, escape_pods: '1', hardpoints: '0/1',
        megadamage: '1d5', upgrades: '1/4',
        notes: "The Freighter's main cargo deck is large enough to serve as a makeshift hangar.",
        description: 'Carrying fifty 20-foot shipping containers, each weighing roughly 20 tons, the freighter is the backbone of the galaxy.',
        image: ''
    },
    {
        name: 'Arma Type-19',
        modelCode: 'J0C-II Patrol Craft',
        stats: { thrusters: 30, systems: 15, weapons: 32, base_weapons: 30 },
        cost: '600 MCR',
        crew: 12, cryopods: 12, fuel: 18, escape_pods: '3', hardpoints: '1/2',
        megadamage: '1d5', upgrades: '1/3',
        notes: 'Most Patrol Craft are fitted for their local system and are not equipped with a Jump Drive.',
        description: "Space is big and resists order. The patrol craft is humanity's feeble attempt to keep things in line. A one-stop-shop for police action, customs checks, trade embargoes, and distress signal response, depending on your situation, the patrol craft is your worst enemy, or your welcome savior.",
        image: ''
    },
    {
        name: 'Sebaco RAS-62',
        modelCode: 'J0C-III Salvage Cutter',
        stats: { thrusters: 15, systems: 20, weapons: 21, base_weapons: 20 },
        cost: '200 MCR',
        crew: 8, cryopods: 12, fuel: 6, escape_pods: '1', hardpoints: '1/1',
        megadamage: '1d5', upgrades: '3/4',
        notes: "The Salvage Cutter's large truss enables heavy customization.",
        description: 'The Salvage Cutter operates as a scrapyard, search & rescue vessel, mobile repair shop, and tugboat. Its spartan deckplan reflects the ever-changing nature of the job.',
        image: ''
    },
    {
        name: 'Gauss FAC-Grendel',
        modelCode: 'J1C-IV Corvette',
        stats: { thrusters: 25, systems: 20, weapons: 35, base_weapons: 30 },
        cost: '200 MCR',
        crew: 24, cryopods: 24, fuel: 6, escape_pods: '6', hardpoints: '2/3',
        megadamage: '1d10', upgrades: '1/4',
        notes: 'The Corvette deals the most MDMG tied with the Troopship.',
        description: "A true warship, and the most common escort vehicle you'll see in a flotilla. The Corvette boasts heavy weaponry, two fighters, and a dropship, that make it a deadly predator in open space.",
        image: ''
    },
    {
        name: 'BAS-Lehman Contessa',
        modelCode: 'J1C-III Jumpliner',
        stats: { thrusters: 25, systems: 20, weapons: 16, base_weapons: 15 },
        cost: '425 MCR',
        crew: 100, cryopods: 800, fuel: 12, escape_pods: '50', hardpoints: '1/1',
        megadamage: '1', upgrades: '2/2',
        notes: 'A fully featured cruise ship, with plenty of space for entertainment for first class passengers.',
        description: 'From interplanetary to interstellar, the gargantuan Jumpliners can get you there, mostly in one piece too. If you’ve got the credits.',
        image: ''
    },
    {
        name: 'Tannhäuser Hōshō',
        modelCode: 'J3C-V Troopship',
        stats: { thrusters: 25, systems: 25, weapons: 37, base_weapons: 30 },
        cost: '2.5 BCR',
        crew: 48, cryopods: 400, fuel: 24, escape_pods: '100+12 HDPs', hardpoints: '3/4',
        megadamage: '1d10', upgrades: '2/5',
        notes: 'Most of the marines awaken from cryo already ejected into their escape pods. They never see the inside of the ship.',
        description: "Built to carry hundreds of marines and deploy them at a moment's notice, the Troopship is a flying base of operations. Sent to pacify entire colonies and planets, the Troopship carries more than enough power to get the job done.",
        image: ''
    },
    {
        name: 'Northstar Paragon',
        modelCode: 'J4C-V Exploration Vessel',
        stats: { thrusters: 20, systems: 40, weapons: 27, base_weapons: 25 },
        cost: '750 MCR',
        crew: 48, cryopods: 200, fuel: 120, escape_pods: '12', hardpoints: '2/2',
        megadamage: '1d5', upgrades: '4/5',
        notes: 'The Exploration Vessel is a jack of all trades. It has to carry more cargo than a Freighter and be good in a fight.',
        description: "Taking samples, running planetary surveys, and tracking down strange deep space signals, Exploration Vessels have seen it all. And that's not always a good thing.",
        image: ''
    }
];

export const SHIP_UPGRADES: ShipUpgrade[] = [
    // Minor
    { type: 'Minor', name: 'Expanded Fuel Bay', cost: '750kcr', install: '3 wks', description: 'Increases maximum fuel capacity by 12.' },
    { type: 'Minor', name: 'Agar Cushioning', cost: '600kcr', install: '2 wks', description: "Upgraded cryopods which cuts Cryosickness from 1 week to 1d10 hours. Stats & Saves don't deteriorate from Cryosickness for the first ten years. Then only every other year after that." },
    { type: 'Minor', name: 'Comms Jammer', cost: '450kcr', install: '1 wk', description: 'Systems Check (Firing Range): Allows for communication jamming and eavesdropping.' },
    { type: 'Minor', name: 'Contraband Hold', cost: '40kcr', install: '1 mo', description: 'Small hidden Cargo Bay. Very hard for boarding parties to detect.' },
    { type: 'Minor', name: 'Cosmetic Remodel', cost: '100kcr+', install: '1+ mos', description: "Upgrade in appearance to the ship's interior including paint, furnishings, and other decorations." },
    { type: 'Minor', name: 'Cryochamber', cost: '250kcr', install: '2 wks', description: 'Increase the number of cryopods by up to 24 per Ship Class (ex: Class-III could have up to 72).' },
    { type: 'Minor', name: 'Dedicated Reactor', cost: '450kcr', install: '1 mo', description: 'Grants +10 Systems.' },
    { type: 'Minor', name: 'Emergency Systems', cost: '1mcr', install: '1 mo', description: 'Grants 1 month of emergenct power and Life Support. Must be replaced after use.' },
    { type: 'Minor', name: 'Deep Space Scanners', cost: '1mcr', install: '2 wks', description: 'Increases the range of all detection abilities by 1 range band (i.e. what you used to be able to scan at Contact range you can now scan at Firing range, etc.).' },
    { type: 'Minor', name: 'Habitat Module', cost: '350kcr', install: '1 mo', description: 'Increases maximum crew capcity by up to 24 per Ship Class (ex: Class-IV could have up to 96).' },
    { type: 'Minor', name: 'Machine Shop', cost: '750kcr', install: '3 wks', description: 'Allows users to repair up to 3 MDMG and 3 Hull without returning to port. Resupply for 200kcr.' },
    { type: 'Minor', name: 'Medbay', cost: '250kcr', install: '3 wks', description: "Rest Saves aboard the ship are at [+], other medical treatments available at Warden's discretion." },
    { type: 'Minor', name: 'Reinforced Plating', cost: '2mcr', install: '1 mo', description: 'Increases Maximum Hull to 1.' },
    { type: 'Minor', name: 'Science Lab', cost: '300kcr', install: '3 wks', description: 'Allows for detailed research, study, testing, and experimentation of samples.' },
    // Major
    { type: 'Major', name: 'Adaptive Armor', cost: '10mcr', install: '1 mo', description: 'Increases Maximum Hull to 2.' },
    { type: 'Major', name: 'Enhanced A.I.', cost: '10mcr', install: '1 wk', description: 'Grants +15 Systems.' },
    { type: 'Major', name: 'Expanded Frame', cost: '20mcr', install: '*', description: 'Structural alterations. Grants +5 Upgrades.' },
    { type: 'Major', name: 'Hangar/Dronebay', cost: '1mcr', install: '1 mo', description: 'Allows for the storage and maintenance of 4 Class-0 Vessels.' },
    { type: 'Major', name: 'Hardpoint', cost: '2mcr', install: '2 wks', description: 'Grants +1 Hardpoint. Each additional Hardpoint costs 3x the previous.' },
    { type: 'Major', name: 'Improved Radiators', cost: '3mcr', install: '3 wks', description: 'Grants +15 Thrusters.' },
    { type: 'Major', name: 'Jump-1 Drive', cost: '5mcr', install: '1 mo', description: 'Standard commercial Jump Drive. Allows for Jump-1 travel.' },
    { type: 'Major', name: 'Jump-2 Drive', cost: '20mcr', install: '2 mo', description: 'Standard military Jump Drive. Allows for Jump-2 travel.' },
    { type: 'Major', name: 'Jump-3 Drive', cost: '40mcr', install: '3 mo', description: 'Long range, cutting edge Jump Drive. Allows for Jump-3 travel.' },
    { type: 'Major', name: 'Jump-4+ Drive', cost: '???', install: '???', description: 'Highly experimental Jump Drives. Not available on the open market.' },
    { type: 'Major', name: 'Redundant Systems', cost: '15mcr', install: '1 mo', description: 'Allows ship to ignore any one Megadamage roll. Must be replaced after use.' },
    { type: 'Major', name: 'Signature Reduction', cost: '35mcr', install: '1 mo', description: 'While activated, your ship is only detectable with a successful Systems Check [-] at Firing Range. Double fuel costs/travel times while in use. Does not work in Core Space.' },
    { type: 'Major', name: 'Streamlined Fuel Injectors', cost: '50mcr', install: '1 mo', description: '1 Fuel lasts for 2 months of space travel. In the movement phase, bidding 1 Fuel also counts as bidding 2 Fuel.' },
    { type: 'Major', name: 'System Overhaul', cost: '20mcr', install: '*', description: "Wide ranging upgrade to the ship's hull and systems. Increase Ship Class by 1." },
    { type: 'Major', name: 'Targeting Sensors', cost: '750kcr', install: '2 wks', description: 'Systems Check (Firing Range): Confers [+] to Weapons Checks made in ship-to-ship combat.' }
];

export const SHIP_WEAPONS: ShipWeapon[] = [
    { name: 'Autocannon', cost: '2.5mcr', bonus: '+2', description: 'Kinetic ballistic weaponry.' },
    { name: 'Electronic Countermeasures', cost: '5mcr', bonus: '+1', description: "Confers [-] to enemy ship's MDMG rolls." },
    { name: 'Laser Cannon', cost: '2mcr', bonus: '+1', description: 'Powerful laser beam used for scrapping hulks and cutting asteroids.' },
    { name: 'Laser Defense System', cost: '1.5mcr', bonus: '+1', description: "Ignore enemy's MDMG bonus from Missile Launchers. If this is your only weapon, you cannot attack." },
    { name: 'Missile Launcher (Light)', cost: '3.6mcr', bonus: '+3', description: 'Grants +1 MDMG.' },
    { name: 'Missile Launcher (Heavy)', cost: '7mcr', bonus: '+5', description: 'Grants +1 MDMG.' },
    { name: 'Particle Beam', cost: '3cr', bonus: '+1', description: 'Enemy must make a Systems Check or Increase their Radiation level by 1.' },
    { name: 'Railgun', cost: '6.2mcr', bonus: '+2', description: 'Can be fired at Detection Range.' }
];
