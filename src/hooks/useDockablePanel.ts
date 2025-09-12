
import { useCallback } from 'react';
import { usePanels, PanelId, PanelState } from '@/context/PanelsContext';

export function useDockablePanel(id: PanelId) {
  const panels = usePanels();
  const state: PanelState = panels.getState(id);

  const open = useCallback(() => panels.open(id), [id, panels]);
  const close = useCallback(() => panels.close(id), [id, panels]);
  const minimize = useCallback(() => panels.minimize(id), [id, panels]);
  const restore = useCallback(() => panels.restore(id), [id, panels]);
  const bringToFront = useCallback(() => panels.bringToFront(id), [id, panels]);
  const setPosition = useCallback((p: { x: number; y: number }) => panels.setPosition(id, p), [id, panels]);

  return { state, open, close, minimize, restore, bringToFront, setPosition };
}
