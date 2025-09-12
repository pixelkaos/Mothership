import React, { useState, useEffect, useRef } from 'react';
import { STARTING_EQUIPMENT_TABLES } from '@/constants/rules';
import { TRINKETS, PATCHES, SHOP_ITEMS, ARMOR_ITEMS, WEAPON_ITEMS } from '@/constants/items';

const RuleSection: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold leading-tight text-primary tracking-wider uppercase border-b-2 border-primary/30 pb-2 mb-4">{title}</h2>
        <div className="prose prose-invert max-w-none text-foreground leading-relaxed space-y-4">
            {children}
        </div>
    </section>
);

const AccordionSection: React.FC<{
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className="border-b last:border-b-0 border-muted/30">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left py-4 px-2 text-xl font-semibold text-secondary tracking-wide uppercase hover:bg-secondary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-2 pb-4 animate-fadeIn">
                    {children}
                </div>
            )}
        </div>
    );
};


const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="text-primary font-bold">{children}</strong>;
const KeyTerm: React.FC<{ children: React.ReactNode }> = ({ children }) => <em className="text-secondary not-italic font-semibold">{children}</em>;
const Dice: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-black/50 text-secondary px-1.5 py-0.5 rounded-sm text-sm font-mono">{children}</code>;

const RulesTable: React.FC<{ data: string[], dice: 'd10' | 'd100' }> = ({ data, dice }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b-2 border-primary/50 p-2 w-20"><Dice>{dice}</Dice></th>
                    <th className="border-b-2 border-primary/50 p-2">Items</th>
                </tr>
            </thead>
            <tbody>
                {data.map((items, index) => (
                    <tr key={index} className="border-b border-muted/30">
                        <td className="p-2 align-top font-mono">{index.toString().padStart(2, '0')}</td>
                        <td className="p-2 align-top">{items}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ItemsTable: React.FC = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b-2 border-primary/50 p-2">Item</th>
                    <th className="border-b-2 border-primary/50 p-2 w-28 text-right">Price (Kr)</th>
                    <th className="border-b-2 border-primary/50 p-2">Description</th>
                </tr>
            </thead>
            <tbody>
                {SHOP_ITEMS.map((item) => (
                    <tr key={item.name} className="border-b border-muted/30">
                        <td className="p-2 align-top font-bold text-secondary">{item.name}</td>
                        <td className="p-2 align-top font-mono text-right">{item.price.toLocaleString()}</td>
                        <td className="p-2 align-top text-sm">{item.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ArmorTable: React.FC = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b-2 border-primary/50 p-2">Armor</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">Cost</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">AP</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">O2</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">Speed</th>
                    <th className="border-b-2 border-primary/50 p-2">Special</th>
                </tr>
            </thead>
            <tbody>
                {ARMOR_ITEMS.map((item) => (
                    <tr key={item.name} className="border-b border-muted/30">
                        <td className="p-2 align-top">
                            <div className="font-bold text-secondary">{item.name}</div>
                            {item.description && <div className="text-xs text-muted">{item.description}</div>}
                        </td>
                        <td className="p-2 align-top font-mono text-right">{item.cost}</td>
                        <td className="p-2 align-top font-mono text-right">{item.ap}</td>
                        <td className="p-2 align-top font-mono text-right">{item.o2}</td>
                        <td className="p-2 align-top font-mono text-right">{item.speed}</td>
                        <td className="p-2 align-top text-sm">{item.special}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const WeaponTable: React.FC = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b-2 border-primary/50 p-2">Weapon</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">Cost</th>
                    <th className="border-b-2 border-primary/50 p-2">Range</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">Damage</th>
                    <th className="border-b-2 border-primary/50 p-2 text-right">Shots</th>
                    <th className="border-b-2 border-primary/50 p-2">Wound</th>
                    <th className="border-b-2 border-primary/50 p-2">Special</th>
                </tr>
            </thead>
            <tbody>
                {WEAPON_ITEMS.map((item) => (
                    <tr key={item.name} className="border-b border-muted/30">
                        <td className="p-2 align-top font-bold text-secondary">{item.name}</td>
                        <td className="p-2 align-top font-mono text-right">{item.cost}</td>
                        <td className="p-2 align-top">{item.range}</td>
                        <td className="p-2 align-top font-mono text-right">{item.damage}</td>
                        <td className="p-2 align-top font-mono text-right">{item.shots}</td>
                        <td className="p-2 align-top">{item.wound}</td>
                        <td className="p-2 align-top text-sm">{item.special}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const rulesSections = [
    { id: 'how-to-create-a-character', title: 'How to create a character' },
    { id: 'starting-equipment', title: 'Starting equipment' },
    { id: 'credits', title: 'Credits' },
    { id: 'trinkets', title: 'Trinkets' },
    { id: 'patches', title: 'Patches' },
    { id: 'items', title: 'Items' },
    { id: 'weapon', title: 'Weapon' },
    { id: 'armor', title: 'Armor' },
    { id: 'pets', title: 'Pets' },
    { id: 'how-to-be-a-good-player', title: 'How to be a good player' },
    { id: 'basic-rules', title: 'Basic rules' },
    { id: 'characteristics-and-tests', title: 'Characteristics and tests' },
    { id: 'throw-modification', title: 'Throw modification' },
    { id: 'stress', title: 'Stress' },
    { id: 'panic-checks', title: 'Panic checks' },
    { id: 'skills', title: 'Skills' },
    { id: 'skills-development', title: 'Skills development' },
    { id: 'combat-clashes', title: 'Combat clashes' },
    { id: 'attack-and-defense', title: 'Attack and defense' },
    { id: 'wounds-and-death', title: 'Wounds and death' },
    { id: 'distance-and-range', title: 'Distance and range' },
    { id: 'survival', title: 'Survival' },
    { id: 'medicine', title: 'Medicine' },
    { id: 'example-of-the-game', title: 'Example of the game' },
    { id: 'port', title: 'Port' },
    { id: 'vacation', title: 'Vacation' },
    { id: 'mercenaries', title: 'Mercenaries' },
];

export const RulesView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>(rulesSections[0].id);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const sectionsRef = useRef<Map<string, HTMLElement | null>>(new Map());

    const handleToggleAccordion = (accordionName: string) => {
        setOpenAccordion(prev => (prev === accordionName ? null : accordionName));
    };

    useEffect(() => {
        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            const intersectingEntries = entries.filter(e => e.isIntersecting);
            if (intersectingEntries.length > 0) {
                 // Sort by how much of the element is visible, descending
                intersectingEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                // The "most visible" one becomes the active section
                setActiveSection(intersectingEntries[0].target.id);
            }
        };

        observer.current = new IntersectionObserver(handleIntersect, {
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0.1,
        });

        rulesSections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) {
                sectionsRef.current.set(id, el);
                observer.current?.observe(el);
            }
        });

        return () => {
            sectionsRef.current.forEach(el => {
                if (el && observer.current) {
                    observer.current.unobserve(el);
                }
            });
        };
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Manually set active section on click for instant feedback
            setActiveSection(id);
            // Update URL hash without causing a page reload
            window.history.pushState(null, '', `#${id}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
                <nav>
                    <ul className="space-y-1">
                        {rulesSections.map(({ id, title }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    onClick={(e) => handleNavClick(e, id)}
                                    className={`block text-sm uppercase tracking-wider transition-all duration-200 p-2 border-l-4 ${
                                        activeSection === id
                                            ? 'text-primary border-primary bg-primary/10'
                                            : 'text-muted border-muted/30 hover:text-primary hover:border-primary'
                                    }`}
                                >
                                    {title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="lg:col-span-3">
                <RuleSection id="how-to-create-a-character" title="How to create a character">
                    <p>
                        Character creation in Mothership is a straightforward process designed to get you into the game quickly. Follow these steps to create your unlucky spacefarer.
                    </p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><Highlight>Roll for Stats:</Highlight> There are four stats: <KeyTerm>Strength</KeyTerm>, <KeyTerm>Speed</KeyTerm>, <KeyTerm>Intellect</KeyTerm>, and <KeyTerm>Combat</KeyTerm>. For each, roll <Dice>2d10+25</Dice>.</li>
                        <li><Highlight>Roll for Saves:</Highlight> There are three primary saves: <KeyTerm>Sanity</KeyTerm>, <KeyTerm>Fear</KeyTerm>, and <KeyTerm>Body</KeyTerm>. For each, roll <Dice>2d10+10</Dice>. Your fourth save, <KeyTerm>Armor</KeyTerm>, is determined by your equipment.</li>
                        <li><Highlight>Pick a Class:</Highlight> Choose one of four classes: Marine, Scientist, Android, or Teamster. Your class provides bonuses to certain stats and saves, grants starting skills, and determines how you react to trauma.</li>
                        <li><Highlight>Determine Health & Wounds:</Highlight> Your maximum Health is <Dice>1d10+10</Dice>. All characters start with a maximum of <Highlight>2 Wounds</Highlight>, plus any bonus from their class.</li>
                        <li><Highlight>Spend Skill Points:</Highlight> Every class gets a base of 2 Trained and 1 Expert skill point, plus any bonuses from their class. Spend these to customize your character's abilities.</li>
                        <li><Highlight>Finishing Touches:</Highlight> Roll for your starting equipment from your class's table, roll for a random trinket and patch, determine your starting credits (<Dice>5d10x10</Dice>), and give your character a name. You start with <Highlight>2 Stress</Highlight> and <Highlight>0 Resolve</Highlight>.</li>
                    </ol>
                </RuleSection>

                 <RuleSection id="starting-equipment" title="Starting Equipment">
                    <p>Starting equipment includes weapons, armor, and other gear. Roll <Dice>1d10</Dice> on the appropriate table to find your starting equipment, and record it on your character sheet. Some options are better than others, but all are useful in desperate hands. Equipment underlined in a dotted line is not covered in the Items section — use common sense to determine its purpose.</p>
                    <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="Marines' Basic Equipment"
                            isOpen={openAccordion === 'Marine'}
                            onToggle={() => handleToggleAccordion('Marine')}
                        >
                            <RulesTable data={STARTING_EQUIPMENT_TABLES.Marine} dice="d10" />
                        </AccordionSection>
                        <AccordionSection
                            title="Androids' Starting Equipment"
                            isOpen={openAccordion === 'Android'}
                            onToggle={() => handleToggleAccordion('Android')}
                        >
                            <RulesTable data={STARTING_EQUIPMENT_TABLES.Android} dice="d10" />
                        </AccordionSection>
                        <AccordionSection
                            title="Scientists' Starting Equipment"
                            isOpen={openAccordion === 'Scientist'}
                            onToggle={() => handleToggleAccordion('Scientist')}
                        >
                            <RulesTable data={STARTING_EQUIPMENT_TABLES.Scientist} dice="d10" />
                        </AccordionSection>
                        <AccordionSection
                            title="Teamsters' Initial Equipment"
                            isOpen={openAccordion === 'Teamster'}
                            onToggle={() => handleToggleAccordion('Teamster')}
                        >
                            <RulesTable data={STARTING_EQUIPMENT_TABLES.Teamster} dice="d10" />
                        </AccordionSection>
                    </div>
                </RuleSection>
                <RuleSection id="credits" title="Credits">
                    <p>If you roll for a starting equipment package, you begin with <Dice>5d10</Dice> Credits. If you choose to forgo this and buy equipment individually, you start with <Dice>5d10*10</Dice> Credits.</p>
                </RuleSection>
                <RuleSection id="trinkets" title="Trinkets">
                    <p>Roll a <Dice>d100</Dice> on this table at character creation to gain a random trinket. Perhaps it will bring you good luck in the void of space, or at least provide something to talk about on your next station vacation.</p>
                     <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="D100 Trinkets"
                            isOpen={openAccordion === 'Trinkets'}
                            onToggle={() => handleToggleAccordion('Trinkets')}
                        >
                            <RulesTable data={TRINKETS} dice="d100" />
                        </AccordionSection>
                    </div>
                </RuleSection>
                <RuleSection id="patches" title="Patches">
                    <p>Roll a <Dice>d100</Dice> on this table at character creation to gain a random patch placed on your clothing or equipment. Whether it has any special significance is up to you.</p>
                     <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="D100 Patches"
                            isOpen={openAccordion === 'Patches'}
                            onToggle={() => handleToggleAccordion('Patches')}
                        >
                            <RulesTable data={PATCHES} dice="d100" />
                        </AccordionSection>
                    </div>
                </RuleSection>
                <RuleSection id="items" title="Items">
                    <p>Often the only thing that separates characters from certain death is the right tool at hand. Below is a partial list of the various equipment available for purchase at starports and trading posts.</p>
                    <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="General Equipment & Gear"
                            isOpen={openAccordion === 'Items'}
                            onToggle={() => handleToggleAccordion('Items')}
                        >
                            <ItemsTable />
                        </AccordionSection>
                    </div>
                </RuleSection>
                <RuleSection id="weapon" title="Weapon">
                    <p>Weapons range from simple improvised tools to military-grade firearms. Ammunition is often scarce, and every shot counts. Knowing the capabilities and limitations of your gear can be the difference between a paycheck and a shallow grave.</p>
                    <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="Firearms, Melee & Explosives"
                            isOpen={openAccordion === 'Weapon'}
                            onToggle={() => handleToggleAccordion('Weapon')}
                        >
                            <WeaponTable />
                        </AccordionSection>
                    </div>
                </RuleSection>
                <RuleSection id="armor" title="Armor">
                    <p>Armor provides crucial protection against environmental hazards and hostile encounters. The Protection Bonus (PB) is a direct modifier to your Armor Save. Heavier suits may offer more protection at the cost of speed or oxygen supply.</p>
                    <div className="mt-6 border-t border-muted/30">
                        <AccordionSection
                            title="Suits & Protective Gear"
                            isOpen={openAccordion === 'Armor'}
                            onToggle={() => handleToggleAccordion('Armor')}
                        >
                            <ArmorTable />
                        </AccordionSection>
                    </div>
                </RuleSection>
                 <RuleSection id="pets" title="Pets">
                    <p>Pets can be great companions, but failing to protect them from harm can have psychological consequences.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                        <div className="border border-secondary/50 p-4">
                            <h3 className="text-xl font-bold text-secondary">Organic</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Wounds: 1(10)</li>
                                <li>Instincts: 2d10+40</li>
                                <li>[+] for rest tests.</li>
                                <li>1 stress each time the pet takes damage.</li>
                                <li>Panic roll if pet is killed. +1 to minimum stress.</li>
                            </ul>
                        </div>
                        <div className="border border-secondary/50 p-4">
                            <h3 className="text-xl font-bold text-secondary">Synthetic</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Wounds: 2(15)</li>
                                <li>Instincts: 2d10+30</li>
                                <li>+5 to rest tests.</li>
                                <li>Trial of Sanity or 1 stress each time the pet takes damage.</li>
                                <li>1 stress if the pet is destroyed.</li>
                            </ul>
                        </div>
                    </div>
                </RuleSection>
                <RuleSection id="how-to-be-a-good-player" title="How to be a good player">
                    <ul className="list-disc list-inside space-y-2">
                        <li><Highlight>Embrace the Horror:</Highlight> Your characters are vulnerable. Don't be afraid to run, hide, and be terrified. Smart decisions are more important than heroic ones.</li>
                        <li><Highlight>Work With Your Crew:</Highlight> Mothership is a game about teamwork under pressure. Communicate with your fellow players, make plans, and watch each other's backs.</li>
                        <li><Highlight>Think Creatively:</Highlight> Your equipment list isn't just for combat. A crowbar can open a jammed door, a flare gun can be a signal, and a welding torch can seal a corridor. Use your tools to solve problems.</li>
                        <li><Highlight>Accept Your Fate:</Highlight> Character death is common and expected. Don't get too attached. A new character can always be introduced as a survivor, a mercenary, or a new crew member on the next stop. Your story is about the struggle, not necessarily the victory.</li>
                    </ul>
                </RuleSection>
                <RuleSection id="basic-rules" title="Basic Rules">
                    <p>Mothership operates on a simple d100 (or percentile) system. To perform an action where the outcome is uncertain, you'll make a <KeyTerm>Stat Check</KeyTerm> or a <KeyTerm>Save</KeyTerm>. To succeed, you must roll <Highlight>equal to or under</Highlight> the relevant Stat or Save value on a <Dice>d100</Dice> (represented by two 10-sided dice, one for the tens and one for the ones digit).</p>
                    <p>For example, if your Strength is 35 and you need to make a Strength Check to pry open a door, you must roll 35 or less to succeed.</p>
                </RuleSection>
                <RuleSection id="characteristics-and-tests" title="Characteristics and Tests">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div><Highlight>Strength (STR):</Highlight> Used for tasks requiring physical force, like lifting heavy objects or in melee combat.</div>
                        <div><Highlight>Speed (SPD):</Highlight> Represents agility and reaction time. Used for dodging, piloting, and acting quickly.</div>
                        <div><Highlight>Intellect (INT):</Highlight> Covers problem-solving, scientific knowledge, and technical skills. Used for hacking, repairing, and first aid.</div>
                        <div><Highlight>Combat (CBT):</Highlight> Your skill with ranged weapons. Used for shooting accurately.</div>
                        <div><Highlight>Sanity Save:</Highlight> Used to resist psychological trauma from witnessing indescribable horrors.</div>
                        <div><Highlight>Fear Save:</Highlight> Used to act rationally and courageously in terrifying situations.</div>
                        <div><Highlight>Body Save:</Highlight> Used to resist physical harm like poison, disease, or extreme environments.</div>
                        <div><Highlight>Armor Save:</Highlight> Used to negate damage in combat. Your Armor Save is equal to your Armor's Protection Bonus (PB).</div>
                    </div>
                </RuleSection>
                 <RuleSection id="throw-modification" title="Throw Modification">
                    <p><Highlight>Advantage:</Highlight> When you have an advantage, you roll your <Dice>d100</Dice> twice and take the <Highlight>better (lower) result</Highlight>. You might get Advantage for having the right tool for the job, a helpful crewmate, or a tactical superiority.</p>
                    <p><Highlight>Disadvantage:</Highlight> When you have a disadvantage, you roll your <Dice>d100</Dice> twice and take the <Highlight>worse (higher) result</Highlight>. You might have Disadvantage from poor lighting, being injured, or attempting a task without proper skills.</p>
                    <p><Highlight>Criticals:</Highlight> Rolling doubles (e.g., 11, 22, 33, 88) on a Check or Save results in a <KeyTerm>Critical</KeyTerm>. A <Highlight>Critical Success</Highlight> (a successful roll that's also doubles) means something exceptionally good happens. A <Highlight>Critical Failure</Highlight> (a failed roll that's also doubles) means something exceptionally bad happens.</p>
                </RuleSection>
                <RuleSection id="stress" title="Stress">
                    <p>Stress represents your character's accumulated fear and anxiety. You gain <Highlight>1 Stress</Highlight> every time you:</p>
                    <ul className="list-disc list-inside">
                        <li>Fail a Save (Sanity, Fear, or Body).</li>
                        <li>Witness a crewmate's death or Panic.</li>
                        <li>Go 24 hours without food, water, or sleep.</li>
                        <li>Are critically injured or take a Wound.</li>
                    </ul>
                    <p>Your current Stress level is added to all of your Saves. This means the more Stressed you are, the harder it is to succeed on your Saves, which can lead to a downward spiral of accumulating even more Stress.</p>
                </RuleSection>
                <RuleSection id="panic-checks" title="Panic Checks">
                    <p>When a particularly terrifying event occurs, the Warden (GM) may call for a <KeyTerm>Panic Check</KeyTerm>. To make a Panic Check, roll a <Dice>1d20 (the Panic Die)</Dice>. If the result is <Highlight>greater than</Highlight> your current Stress, you keep your cool. If the result is <Highlight>equal to or less than</Highlight> your Stress, you Panic.</p>
                    <p>When you Panic, you must immediately roll <Dice>1d10</Dice> on the Panic Effect Table and act out the result. Your character is not in control during a Panic episode. After the Panic is resolved, your Stress <Highlight>resets to its minimum value</Highlight> (initially 2, but can increase from trauma).</p>
                </RuleSection>
                <RuleSection id="skills" title="Skills">
                    <p>Skills represent specialized training that makes you better at certain tasks. They are divided into three tiers: Trained, Expert, and Master.</p>
                    <ul className="list-disc list-inside">
                        <li><Highlight>Trained:</Highlight> You are proficient. You gain a <Highlight>+10% bonus</Highlight> to any relevant Stat Checks.</li>
                        <li><Highlight>Expert:</Highlight> You are highly skilled. You gain a <Highlight>+15% bonus</Highlight> to any relevant Stat Checks.</li>
                        <li><Highlight>Master:</Highlight> You are one of the best. You gain a <Highlight>+20% bonus</Highlight> to any relevant Stat Checks.</li>
                    </ul>
                    <p>A character cannot have a skill at a higher tier without having its prerequisite skill at a lower tier. For example, to have the Expert skill <KeyTerm>Hacking</KeyTerm>, you must first have the Trained skill <KeyTerm>Computers</KeyTerm>.</p>
                </RuleSection>
                <RuleSection id="skills-development" title="Skills development">
                    <p>Each time you make a successful Stat Check using one of your skills, mark a tick next to it on your character sheet. Once you have <Highlight>three ticks</Highlight> next to a skill, you can <KeyTerm>level it up</KeyTerm> to the next tier (if applicable) and erase the ticks. This is typically done during downtime between jobs.</p>
                </RuleSection>
                <RuleSection id="combat-clashes" title="Combat clashes">
                    <p>Combat is chaotic and deadly. There is no initiative order. Instead, the Warden describes the situation, and the players state what they want to do. Actions are then resolved in an order that makes sense narratively. A good rule of thumb is that anyone who hesitates acts last.</p>
                </RuleSection>
                <RuleSection id="attack-and-defense" title="Attack and defense">
                    <p>To attack with a ranged weapon, make a <Highlight>Combat Check</Highlight>. To attack with a melee weapon, make a <Highlight>Strength Check</Highlight>.</p>
                    <p>If you are attacked, you can make a <Highlight>Body Save</Highlight> to try and dodge or an <Highlight>Armor Save</Highlight> to absorb the damage. A successful Body Save means you avoid the attack completely. A successful Armor Save means you take no damage, but your armor's PB is reduced by 1 until it can be repaired.</p>
                    <p>If both defense saves fail, you take damage, which is subtracted from your Health.</p>
                </RuleSection>
                <RuleSection id="wounds-and-death" title="Wounds and death">
                    <p>When your Health reaches 0, you don't die immediately. Instead, your Health resets to its maximum, and you take a <KeyTerm>Wound</KeyTerm>. You gain 1 Stress, and must make a <Highlight>Body Save</Highlight> to avoid falling unconscious.</p>
                    <p>Each time you take a Wound, you roll on the relevant Wound Table (e.g., Gunshot, Bleeding, Gore) to determine the specific, debilitating injury you've sustained.</p>
                    <p>When the number of Wounds you have taken <Highlight>exceeds your maximum Wounds</Highlight>, your character is dead. There is no coming back.</p>
                </RuleSection>
                <RuleSection id="distance-and-range" title="Distance and range">
                    <p>Distances are abstract: <KeyTerm>Closely</KeyTerm> (within arm's reach), <KeyTerm>Nearby</KeyTerm> (in the same room), <KeyTerm>Far</KeyTerm> (in sight but at a distance), and <KeyTerm>Out of Sight</KeyTerm>. Weapons have effective ranges based on these categories.</p>
                </RuleSection>
                <RuleSection id="survival" title="Survival">
                    <p>You must consume 1 Ration of food and 1 liter of water every 24 hours. For each day you go without, you gain <Highlight>1 Stress</Highlight> and have <Highlight>Disadvantage</Highlight> on all Checks and Saves until you eat and drink.</p>
                </RuleSection>
                <RuleSection id="medicine" title="Medicine">
                    <p>A successful <Highlight>Intellect Check</Highlight> with the <KeyTerm>First Aid</KeyTerm> skill can stabilize a dying character or restore <Dice>1d10</Dice> Health. Using a <KeyTerm>Medscanner</KeyTerm> or <KeyTerm>Surgery Kit</KeyTerm> can provide Advantage on these checks.</p>
                </RuleSection>
                <RuleSection id="example-of-the-game" title="Example of the game">
                    <p><Highlight>Warden:</Highlight> "The airlock door hisses open onto the bridge of the derelict. It's pitch black, and a foul, coppery smell hangs in the air. A single red light flashes on a console."</p>
                    <p><Highlight>Player 1 (Cori, a Teamster):</Highlight> "I'll pull out my flashlight and sweep it across the room. I'm telling everyone to stay close."</p>
                    <p><Highlight>Warden:</Highlight> "Your beam cuts through the darkness, revealing bodies slumped over consoles, their vaccsuits torn open. The walls are covered in strange, pulsating organic matter. As your light hits the far wall, a slick, multi-limbed creature detaches itself and skitters into the shadows. Everyone make a <KeyTerm>Fear Save</KeyTerm>."</p>
                    <p><Highlight>Player 2 (Zane, an Android):</Highlight> "My Fear is 78. I roll a 45. I'm good."</p>
                    <p><Highlight>Cori:</Highlight> "My Fear is only 32... I rolled a 68. That's a fail. I gain 1 Stress, so I'm at 3 now."</p>
                    <p><Highlight>Warden:</Highlight> "Okay, Cori, you feel a cold dread creep up your spine. Zane, you remain impassive. What do you do?"</p>
                </RuleSection>
                <RuleSection id="port" title="Port">
                    <p>At a port, you can buy and sell equipment, look for new jobs, hire mercenaries, or take shore leave to reduce Stress.</p>
                </RuleSection>
                <RuleSection id="vacation" title="Vacation">
                    <p>For every <Highlight>100 Credits</Highlight> you spend on shore leave (carousing, therapy, etc.), you can make a <KeyTerm>Sanity Save</KeyTerm>. If you succeed, you <Highlight>reduce your Stress by 1d5</Highlight>. If you fail, you gain 1 Stress from a particularly bad hangover or a deal gone wrong.</p>
                </RuleSection>
                <RuleSection id="mercenaries" title="Mercenaries">
                    <p>You can hire NPCs to fill out your crew. A typical mercenary costs around <Highlight>500 Credits per job</Highlight>, plus a share of any profits. They are seldom trustworthy and will likely abandon you if things get too dangerous.</p>
                </RuleSection>
            </main>
        </div>
    );
};
