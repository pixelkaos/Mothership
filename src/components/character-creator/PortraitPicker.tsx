import React, { useMemo } from 'react';
import type { ClassName } from '@/types';
import { Modal } from '@/components/ui/Modal';

// Eagerly import all portraits as URLs at build time
// Adjust glob if your folder differs; alias '@' works with Vite.
// Expected structure: src/data/CharacterPictures/<Class>/<pronouns_slug>/*.png
// Example pronouns_slug: he_him, she_her, they_them
// Supported extensions: png, jpg, jpeg, webp, gif
const ALL_IMAGES = import.meta.glob('/src/data/CharacterPictures/**/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
const unify = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

function extractMeta(path: string): { cls: string; pronoun: string } {
  const segs = path.toLowerCase().split('/')
    .filter(Boolean);
  const idx = segs.lastIndexOf('characterpictures');
  const cls = segs[idx + 1] || '';
  const pronoun = segs[idx + 2] || '';
  return { cls, pronoun };
}

interface PortraitPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  className: ClassName | null;
  pronouns: string;
}

export const PortraitPicker: React.FC<PortraitPickerProps> = ({ isOpen, onClose, onSelect, className, pronouns }) => {
  const classKey = className ? normalize(className) : '';
  const pronounKey = pronouns ? normalize(pronouns) : '';

  const candidates = useMemo(() => {
    const entries = Object.entries(ALL_IMAGES);
    if (!classKey) return entries.map(([, url]) => url);

    const wantClass = unify(classKey);
    const wantPron = pronounKey ? unify(pronounKey) : '';

    const byMeta = entries.filter(([p]) => {
      const meta = extractMeta(p);
      if (unify(meta.cls) !== wantClass) return false;
      if (!wantPron) return true;
      return unify(meta.pronoun) === wantPron;
    });
    if (byMeta.length > 0) return byMeta.map(([, url]) => url);

    // Fallback: class only (meta-based)
    const classOnly = entries.filter(([p]) => unify(extractMeta(p).cls) === wantClass);
    if (classOnly.length > 0) return classOnly.map(([, url]) => url);

    // Fallback: substring check (very permissive)
    const loose = entries.filter(([p]) => p.toLowerCase().includes(`/${classKey}/`));
    if (loose.length > 0) return loose.map(([, url]) => url);

    return entries.map(([, url]) => url);
  }, [classKey, pronounKey]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Portrait" className="w-full max-w-4xl">
      <div className="space-y-3">
        {className ? (
          <p className="text-sm text-muted">Showing portraits for <span className="text-primary font-semibold">{className}</span>{pronouns ? <> · <span className="text-primary font-semibold">{pronouns}</span></> : null}</p>
        ) : (
          <p className="text-sm text-muted">Select a class first to filter portraits.</p>
        )}
        {candidates.length === 0 ? (
          <p className="text-muted text-center italic">No portraits found for the current filters.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {candidates.map((url) => (
              <button
                key={url}
                onClick={() => { onSelect(url); onClose(); }}
                className="relative aspect-square border border-primary/40 hover:border-primary transition-colors overflow-hidden"
              >
                <img src={url} alt="Portrait option" className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
