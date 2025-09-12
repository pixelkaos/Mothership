import React, { useState } from 'react';
import { CharacterHangar } from '@/components/character-creator/CharacterHangar';
import { CharacterWizard } from '@/components/character-creator/CharacterWizard';
import { CharacterManifest } from '@/components/character-creator/CharacterManifest';
import { useCharacter } from '@/context/CharacterContext';
import { usePanels } from '@/context/PanelsContext';

export const CharacterCreatorView: React.FC = () => {
  const { activeCharacterData, setActiveCharacterData } = useCharacter();
  const { open } = usePanels();
  const [mode, setMode] = useState<'hangar' | 'wizard'>('hangar');

  // If a character is already loaded (e.g., from a previous random generation or file load),
  // display the full manifest immediately.
  if (activeCharacterData) {
    return <CharacterManifest characterData={activeCharacterData} onCharacterUpdate={setActiveCharacterData} onOpenSheet={() => open('character-sheet')} />;
  }

  // If the user has started the creation process, show the wizard.
  if (mode === 'wizard') {
    return (
      <CharacterWizard
        onComplete={(data) => {
          // When the wizard is finished, update the app's state with the new character.
          // This will cause this component to re-render and show the CharacterManifest.
          setActiveCharacterData(data);
          setMode('hangar'); // Reset mode for the next time.
        }}
        onExit={() => setMode('hangar')}
      />
    );
  }

  // By default, show the Hangar, which is the new entry point for this view.
  return (
    <CharacterHangar
      onStartNew={() => setMode('wizard')}
      onCharacterReady={setActiveCharacterData}
    />
  );
};
