import { GoogleGenAI } from "@google/genai";
import type { DerelictShip } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDerelictDescription(shipData: DerelictShip): Promise<string> {
    const prompt = `
You are a creative Gamemaster for the sci-fi horror tabletop RPG "Mothership". Your tone is bleak, tense, and grounded in a gritty, blue-collar vision of the future inspired by films like 'Alien' and 'Event Horizon'.

Based on the following randomly generated details for a derelict spacecraft, write an atmospheric and engaging description for the players. Weave all the provided elements into a cohesive and spooky narrative. The description should be presented as a ship's log entry, a salvage crew's preliminary report, or a direct description to the players as they board the ship.

**Derelict Ship Data:**
- **Ship Name/Identifier:** ${shipData.name}
- **Ship Class & Status:** ${shipData.shipClass} (${shipData.status})
- **Systems:** ${shipData.systems}
- **Survivors:** ${shipData.survivors}
- **Cause of Ruination:** ${shipData.causeOfRuination}
- **Weird Trait:** ${shipData.weirdTrait}
- **Notable Cargo:** ${shipData.cargo}
- **Potential Salvage:** ${shipData.salvage}

Make it scary, mysterious, and full of hooks for a roleplaying game session. For example, if the cause is "Starvation" and the weird trait is "Failed Utopia", describe the grim evidence of a society that turned on itself when its ideals couldn't provide food. If the cargo is "Cremains", perhaps the urns are all mislabeled or contain something other than ash. Do not just list the data; create a story from it.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response && response.text) {
            return response.text;
        } else {
            throw new Error("Received an empty or invalid response from the API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
}