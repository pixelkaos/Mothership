import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PanelsProvider } from './context/PanelsContext';
import { NavigationProvider } from './context/NavigationContext';
import { CharacterProvider } from './context/CharacterContext';
import { ShipProvider } from './context/ShipContext';
import { InteractionProvider } from './context/InteractionContext';
import { UIStateProvider } from './context/UIStateContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PanelsProvider>
      <InteractionProvider>
        <ShipProvider>
          <NavigationProvider>
            <CharacterProvider>
              <UIStateProvider>
                <App />
              </UIStateProvider>
            </CharacterProvider>
          </NavigationProvider>
        </ShipProvider>
      </InteractionProvider>
    </PanelsProvider>
  </React.StrictMode>
);
