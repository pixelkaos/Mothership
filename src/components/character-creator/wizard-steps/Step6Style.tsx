

import React, { useState } from 'react';
import { StepProps } from '@/components/character-creator/wizard-steps/Step1Stats';
import { FIRST_NAMES, LAST_NAMES, PRONOUNS } from '@/constants/names';
import { generateCharacterBackstory, generateCharacterPortrait } from '@/services/geminiService';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/Button';
import { PortraitPicker } from '@/components/character-creator/PortraitPicker';

export const Step6Style: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character } = saveData;
    const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
    const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleRandomizeIdentity = async () => {
        setIsGeneratingIdentity(true);
        try {
            const randomFirstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const randomLastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            const randomName = `${randomFirstName} ${randomLastName}`;
            const randomPronouns = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
            
            onUpdate('character.name', randomName);
            onUpdate('character.pronouns', randomPronouns);
            
            const tempCharacterForBackstory = { ...character, name: randomName, pronouns: randomPronouns };
            const backstory = await generateCharacterBackstory(tempCharacterForBackstory);
            onUpdate('character.backstory', backstory);
        } catch(e: any) {
            alert(`AI identity generation failed. ${e?.message ?? ''}`.trim());
        } finally {
            setIsGeneratingIdentity(false);
        }
    };
    
    const handleGeneratePortrait = async () => {
        setIsGeneratingPortrait(true);
        try {
            let prompt = `A vibrant cyberpunk illustration in a comic book anime style of a Mothership RPG character. A ${character.class?.name}. Pronouns: ${character.pronouns}.`;
            const imageUrl = await generateCharacterPortrait(prompt);
            onUpdate('character.portrait', imageUrl);
        } catch(e) {
            alert("AI portrait generation failed. Please try again.");
        } finally {
            setIsGeneratingPortrait(false);
        }
    };

    const handlePickPortrait = () => setIsPickerOpen(true);
    const handlePortraitSelected = (url: string) => {
        onUpdate('character.portrait', url);
    };
    
    const handleUploadPortrait = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                onUpdate('character.portrait', e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-semibold text-primary uppercase tracking-wider">Character Style</h2><p className="text-sm text-muted mt-2">Define your character's identity. Use the AI to generate a portrait and backstory based on your choices.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <div className="text-right -mb-2">
                        <Button variant="secondary" size="sm" onClick={handleRandomizeIdentity} disabled={isGeneratingIdentity}>
                            {isGeneratingIdentity ? 'Generating...' : 'Randomize Identity'}
                        </Button>
                    </div>
                    <Field label="Name">
                        <Input type="text" placeholder="Name" value={character.name} onChange={e => onUpdate('character.name', e.target.value)} />
                    </Field>
                    <Field label="Pronouns">
                        <select className="w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" value={character.pronouns} onChange={e => onUpdate('character.pronouns', e.target.value)}>
                            <option value="" disabled>Select Pronouns</option>
                            {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </Field>
                    <Field label="Backstory">
                        <Textarea placeholder="Backstory (or let the AI write one!)" rows={8} value={character.backstory} onChange={e => onUpdate('character.backstory', e.target.value)} />
                    </Field>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="aspect-square w-48 bg-black/50 border border-muted flex items-center justify-center relative overflow-hidden">
                        {character.portrait ? <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover"/> : <span className="text-muted text-xs">No Portrait</span>}
                        {(isGeneratingIdentity || isGeneratingPortrait) && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-primary animate-pulse">{isGeneratingPortrait ? 'Rendering...' : 'Writing...'}</div>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handlePickPortrait} className="w-48">
                            Choose Portrait
                        </Button>
                        <Button variant="tertiary" size="sm" onClick={handleGeneratePortrait} disabled={isGeneratingPortrait} className="w-48">
                            {isGeneratingPortrait ? 'Generating...' : 'AI Generate'}
                        </Button>
                    </div>
                    <PortraitPicker
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        onSelect={handlePortraitSelected}
                        className={character.class?.name ?? null}
                        pronouns={character.pronouns}
                    />
                    <Button as="label" variant="tertiary" size="sm" className="w-48 cursor-pointer">
                        Upload Portrait
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadPortrait} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
