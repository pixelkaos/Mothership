

import React, { useState } from 'react';
import type { CharacterSaveData } from '../types';
import { CharacterHangar } from '../components/character-creator/CharacterHangar';
import { CharacterWizard } from '../components/character-creator/CharacterWizard';
import { CharacterManifest } from '../components/character-creator/CharacterManifest';

export const CharacterCreatorView: React.FC<{
  characterData: CharacterSaveData | null;
  onCharacterUpdate: (data: CharacterSaveData | null) => void;
  onOpenSheet: () => void;
}> = ({ characterData, onCharacterUpdate, onOpenSheet }) => {
  const [mode, setMode] = useState<'hangar' | 'wizard'>('hangar');

  // If a character is already loaded (e.g., from a previous random generation or file load),
  // display the full manifest immediately.
  if (characterData) {
    return <CharacterManifest characterData={characterData} onCharacterUpdate={onCharacterUpdate} onOpenSheet={onOpenSheet} />;
  }

  // If the user has started the creation process, show the wizard.
  if (mode === 'wizard') {
    return (
      <CharacterWizard
        onComplete={(data) => {
          // When the wizard is finished, update the app's state with the new character.
          // This will cause this component to re-render and show the CharacterManifest.
          onCharacterUpdate(data);
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
      onCharacterReady={onCharacterUpdate}
    />
  );
};