import React, { useState, useEffect, useRef } from 'react';
import { STARTING_EQUIPMENT_TABLES, TRINKETS, PATCHES } from '../constants';

const RuleSection: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold text-primary tracking-wider uppercase border-b-2 border-primary/30 pb-2 mb-4">{title}</h2>
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
                className="w-full flex justify-between items-center text-left py-4 px-2 text-xl font-bold text-secondary tracking-wide uppercase hover:bg-secondary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus"
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
const Dice: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-black/50 text-secondary px-1.5 py-0.5 rounded-sm text-sm">{children}</code>;

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
                        <td className="p-2">{items}</td>
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
                    <p>Gear is crucial for survival. Key items include <Highlight>Vaccsuits</Highlight> for surviving in space, <Highlight>First Aid Kits</Highlight> for healing, <Highlight>Flashlights</Highlight> for exploring dark corners, and <Highlight>MREs</Highlight> (Meal, Ready-to-Eat) for sustenance.</p>
                </RuleSection>
                <RuleSection id="weapon" title="Weapon">
                    <p>Weapons range from simple <Highlight>Crowbars</Highlight> (<Dice>1d10</Dice> damage) to military-grade <Highlight>Pulse Rifles</Highlight> (<Dice>5d10</Dice> damage). Ammunition is scarce, so every shot counts. Many weapons have special properties, like being fully automatic or dealing extra damage on a critical hit.</p>
                </RuleSection>
                <RuleSection id="armor" title="Armor">
                    <p>Armor improves your <KeyTerm>Armor Save</KeyTerm>. Standard crew attire offers no bonus (+0%), while a <Highlight>Vaccsuit</Highlight> provides +7% and full <Highlight>Advanced Battle Dress</Highlight> gives +15%. Heavier armor often comes with penalties, like Disadvantage on Speed Checks.</p>
                </RuleSection>
                <RuleSection id="how-to-be-a-good-player" title="How to be a good player">
                    <ul className="list-disc list-inside space-y-2">
                        <li><Highlight>Embrace the Horror:</Highlight> Your characters are vulnerable. Don't be afraid to run, hide, and be terrified. Smart decisions are more important than heroic ones.</li>
                        <li><Highlight>Work With Your Crew:</Highlight> Mothership is a game about teamwork under pressure. Communicate with your fellow players, make plans, and watch each other's backs.</li>
                        <li><Highlight>Think Creatively:</Highlight> Your equipment list isn't just for combat. A crowbar can open a jammed door, a flare gun can be a signal, and a welding torch can seal a corridor. Use your tools to solve problems.</li>
                        <li><Highlight>Accept Your Fate:</Highlight> Character death is common and expected. Don't get too attached. A new character can always be introduced as a survivor, a mercenary, or a new crew member on the next stop. Your story is about survival, not victory.</li>
                    </ul>
                </RuleSection>
                <RuleSection id="basic-rules" title="Basic Rules">
                     <p>Mothership plays like many other RPGs. One of you, the Warden, creates a scenario, and the rest of you, the players, interact with it. The rules below outline how to resolve the most common situations.</p>
                </RuleSection>
                <RuleSection id="characteristics-and-tests" title="Characteristics and tests">
                    <p>Whenever you want to do something and the price for failure is high, you must roll under the appropriate <KeyTerm>Stat</KeyTerm> on <Dice>d%</Dice>; otherwise you fail. This is called a <KeyTerm>Stat Check</KeyTerm>. Your four Stats are:</p>
                    <ul className="list-disc list-inside">
                        <li><Highlight>Strength:</Highlight> How able-bodied you are. Lifting, pushing, hitting things hard, etc.</li>
                        <li><Highlight>Speed:</Highlight> How quickly you can act and react under pressure.</li>
                        <li><Highlight>Intellect:</Highlight> How knowledgeable and experienced you are.</li>
                        <li><Highlight>Combat:</Highlight> How good you are at fighting.</li>
                    </ul>
                </RuleSection>
                <RuleSection id="throw-modification" title="Throw modification">
                     <p>Situational modifiers are handled with <KeyTerm>Advantage</KeyTerm> and <KeyTerm>Disadvantage</KeyTerm>.</p>
                     <ul className="list-disc list-inside">
                         <li><Highlight>Advantage:</Highlight> Roll <Dice>two d%</Dice> and take the <Highlight>better (lower)</Highlight> result. You might get this from having help, a good tool, or the element of surprise.</li>
                         <li><Highlight>Disadvantage:</Highlight> Roll <Dice>two d%</Dice> and take the <Highlight>worse (higher)</Highlight> result. This might come from being injured, working in a hazardous environment, or attempting a very difficult task.</li>
                     </ul>
                </RuleSection>
                <RuleSection id="stress" title="Stress">
                    <p>Stress is a measure of your accumulated fear and anxiety. It starts at 2 and increases when you fail Saves, get critically injured, or face terrifying situations. While Stress doesn't do anything on its own, it makes you more vulnerable to Panic.</p>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-secondary tracking-wide uppercase mb-2">Relieving Stress</h3>
                        <p>You can attempt to relieve Stress by resting for at least six hours. After resting, you can make a <KeyTerm>Fear Save</KeyTerm>. If you succeed, you relieve 1 Stress for every 10 points you succeeded by. Other activities like carousing in a safe port can also relieve Stress at the GM's discretion.</p>
                    </div>
                </RuleSection>
                <RuleSection id="panic-checks" title="Panic checks">
                     <p>When things get bad, the GM may call for a <KeyTerm>Panic Check</KeyTerm>. To make one, you roll <Dice>2d10</Dice>.</p>
                     <ul className="list-disc list-inside">
                         <li>If the result is <Highlight>GREATER</Highlight> than your current Stress, you keep your cool. You relieve 1 Stress.</li>
                         <li>If the result is <Highlight>EQUAL TO OR LESS THAN</Highlight> your current Stress, you panic. You gain 1 Stress, and must immediately roll on the Panic Effect Table to see what your character does.</li>
                     </ul>
                </RuleSection>
                <RuleSection id="skills" title="Skills">
                    <p>Skills represent specialized training. If you have a relevant skill for a Stat Check, you add its bonus to your Stat, making the check easier. A character can be at one of three ranks in a skill:</p>
                     <ul className="list-disc list-inside">
                        <li><KeyTerm>Trained:</KeyTerm> You add <Highlight>+10%</Highlight> to your Stat for the check.</li>
                        <li><KeyTerm>Expert:</KeyTerm> You add <Highlight>+15%</Highlight> to your Stat for the check.</li>
                        <li><KeyTerm>Master:</KeyTerm> You add <Highlight>+20%</Highlight> to your Stat for the check.</li>
                    </ul>
                    <p>To acquire an Expert or Master skill, you must first have its prerequisite skill(s).</p>
                </RuleSection>
                <RuleSection id="skills-development" title="Skills development">
                    <p>Characters gain Experience Points (XP) for surviving sessions and accomplishing goals. With enough XP, you <KeyTerm>Level Up</KeyTerm>. When you level up, you get to make improvements to your character and gain skill points to learn new skills or improve existing ones.</p>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-secondary tracking-wide uppercase mb-2">Leveling Up</h3>
                        <ol className="list-decimal list-inside space-y-1">
                            <li><Highlight>Pick one Major Improvement:</Highlight> Either improve one Stat by 5 and another by 3, OR improve two Saves by 4 each.</li>
                            <li><Highlight>Pick one Minor Improvement:</Highlight> Either gain 1 Resolve, remove a phobia, or heal all your Stress.</li>
                            <li><Highlight>Gain 2 Skill Points:</Highlight> Spend these points to acquire new skills. Trained skills cost 1 point, Expert costs 2, and Master costs 3.</li>
                        </ol>
                    </div>
                </RuleSection>
                <RuleSection id="combat-clashes" title="Combat clashes">
                    <p>At the start of combat, everyone makes a <KeyTerm>Speed Check</KeyTerm>. Those who succeed act before the enemies; those who fail act after. On your turn, you can take <Highlight>two significant actions</Highlight> (e.g., attack, move, use an item, operate a machine). Simple actions like speaking or taking cover are often free.</p>
                </RuleSection>
                <RuleSection id="attack-and-defense" title="Attack and defense">
                     <p>Attacking is an <KeyTerm>Opposed Check</KeyTerm>. The attacker makes a <KeyTerm>Combat Check</KeyTerm>. The defender makes an <KeyTerm>Armor Save</KeyTerm>. If both succeed, the one who rolled <Highlight>higher</Highlight> (but still under their stat) wins. If one succeeds and one fails, the successful one wins. Criticals beat regular successes.</p>
                </RuleSection>
                <RuleSection id="wounds-and-death" title="Wounds and death">
                    <p>Damage reduces your <KeyTerm>Health</KeyTerm>. When your Health reaches 0, it resets to maximum but you gain 1 <KeyTerm>Wound</KeyTerm>. Wounds are serious, debilitating injuries determined by a roll on a table. If you ever gain more Wounds than your maximum, you die.</p>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-secondary tracking-wide uppercase mb-2">Death</h3>
                        <p>When you reach 0 Health (before gaining a wound), you must make a <KeyTerm>Body Save</KeyTerm>. Failure means you die. Success means you fall unconscious. Taking more Wounds than your maximum is also a common way to die. Death is permanent.</p>
                    </div>
                </RuleSection>
                <RuleSection id="distance-and-range" title="Distance and range">
                     <p>Ranged weapons have three ranges: Short, Medium, and Long.</p>
                     <ul className="list-disc list-inside">
                        <li><Highlight>Short Range:</Highlight> No penalty to your Combat Check.</li>
                        <li><Highlight>Medium Range:</Highlight> A -10% penalty to your Combat Check.</li>
                        <li><Highlight>Long Range:</Highlight> You have Disadvantage on your Combat Check.</li>
                    </ul>
                </RuleSection>
                <RuleSection id="survival" title="Survival">
                    <p>Basic needs are a constant threat in space.</p>
                    <ul className="list-disc list-inside">
                        <li><Highlight>Food:</Highlight> After 24 hours without food, you are at Disadvantage to all rolls.</li>
                        <li><Highlight>Water:</Highlight> You need 1 liter of water per day. If you're rationing, any strenuous activity forces a Body Save or you pass out.</li>
                        <li><Highlight>Oxygen:</Highlight> You can last 15 seconds without oxygen before falling unconscious. A standard vaccsuit oxygen tank lasts 12 hours.</li>
                    </ul>
                </RuleSection>
                <RuleSection id="medicine" title="Medicine">
                     <p>You can heal naturally by resting for at least six hours and making a successful <KeyTerm>Body Save</KeyTerm>. The amount of Health healed is equal to the amount you succeeded the save by. Stimpaks, Medbays, and the First Aid skill can also heal Health. Wounds can only be healed by surgery or advanced medical care.</p>
                </RuleSection>
                <RuleSection id="example-of-the-game" title="Example of the game">
                    <blockquote className="border-l-4 border-secondary pl-4 italic text-muted">
                        <p>Lilith showed up late and her Warden was busy ordering pizza, so he handed her a character sheet. First, she rolls for each Stat and writes them down. Next she picks a class. She always loved Kaylee from Firefly, so she decides to pick Teamster. She fills in her starting Saves and then adjusts her Strength and Speed by 5 each (a bonus from being a Teamster).</p>
                        <p>Next, she picks some skills. As a Teamster, Lilith already gets Zero-G and Mechanical Repair. She picks Astrogation and Vehicle Specialization. Then, she rolls for her starting equipment, a random Trinket, and Patch. Finally, she fills in her Max Health, Stress, and Resolve and rolls <Dice>5d10</Dice> for her starting credits. She's ready to play.</p>
                    </blockquote>
                </RuleSection>
                <RuleSection id="port" title="Port">
                    <p>Ports are the hubs of civilization in Mothership. They are places to repair your ship, buy and sell goods, hire crew, and find work. They can range from gleaming corporate-run stations to seedy, dangerous asteroid bases.</p>
                </RuleSection>
                <RuleSection id="vacation" title="Vacation">
                    <p>Spending time at a safe, civilized starport is one of the primary ways to relieve <KeyTerm>Stress</KeyTerm>. Carousing, getting a good meal, and sleeping in a real bed can all help your character recover from the horrors of the void. The Warden determines how much Stress is relieved.</p>
                </RuleSection>
                <RuleSection id="mercenaries" title="Mercenaries">
                    <p>If your crew is short-handed, you can hire mercenaries at most starports. They are simpler characters with four stats: <KeyTerm>Combat</KeyTerm>, <KeyTerm>Instinct</KeyTerm>, <KeyTerm>Hits</KeyTerm>, and <KeyTerm>Loyalty</KeyTerm>. To hire a mercenary, you make an Intellect Check, modified by factors like how dangerous the job is and how much you're paying. Be careful—mercenaries can be disloyal and may have their own hidden motivations.</p>
                </RuleSection>
            </main>
        </div>
    );
};
