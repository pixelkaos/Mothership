




import { GoogleGenAI } from "@google/genai";
import type { DerelictShip, Character } from '../types';

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
- **Ship Model & Status:** ${shipData.shipModel} (${shipData.status})
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

export async function generateCharacterPortrait(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Received no images from the API.");
        }
    } catch (error) {
        console.error("Error calling Gemini Image Generation API:", error);
        throw new Error("Failed to generate character portrait.");
    }
}

export async function generateCharacterBackstory(character: Character): Promise<string> {
    const prompt = `
You are a creative writer for the gritty, blue-collar sci-fi horror tabletop RPG "Mothership". Your tone is bleak, tense, and inspired by films like 'Alien', 'Blade Runner', and 'Event Horizon'.

Based on the following character sheet, generate a background profile. The profile must consist of two parts: a bulleted list of key facts, and a narrative backstory.

**Character Data:**
- **Name:** ${character.name}
- **Pronouns:** ${character.pronouns}
- **Class:** ${character.class?.name || 'Unknown'}
- **High Stats:** ${Object.entries(character.stats).filter(([, val]) => val > 45).map(([key]) => key).join(', ') || 'None'}
- **Low Stats:** ${Object.entries(character.stats).filter(([, val]) => val < 35).map(([key]) => key).join(', ') || 'None'}
- **High Saves:** ${Object.entries(character.saves).filter(([, val]) => val > 40).map(([key]) => key).join(', ') || 'None'}
- **Low Saves:** ${Object.entries(character.saves).filter(([, val]) => val < 25).map(([key]) => key).join(', ') || 'None'}
- **Key Skills:** ${[...character.skills.master, ...character.skills.expert, ...character.skills.trained].slice(0, 5).join(', ')}
- **Trinket:** ${character.equipment.trinket}
- **Patch:** ${character.equipment.patch}

**Instructions:**

1.  **Key Facts:** Create a bulleted list of 7 key facts about the character using the specified labels.
2.  **Backstory:** Write a compelling and atmospheric narrative background story of 150-200 words. This story should:
    *   Feel grounded and realistic for the setting.
    *   Weave together some of the key facts from the list.
    *   Hint at the circumstances that led them to take on dangerous, high-risk work in deep space.
    *   Do not just list the stats; create a narrative that reflects them.

**Output Format:**
Format your response exactly as follows, using markdown. Use Level-3 headers for sections and format list items with a leading asterisk and a bolded label ending with a colon.

### Key Facts
* **Age:** [Estimated Age]
* **Homeworld:** [Place of origin, e.g., a specific planet, station, or ship]
* **Background:** [Brief educational or professional background]
* **Defining Event:** [A defining life event or trauma]
* **Motivation:** [Primary motivation, e.g., debt, escape, discovery]
* **Quirk:** [A personal quirk or belief]
* **Trinket's Significance:** [How their trinket is significant to them]

### Backstory
[Your 150-200 word narrative here]
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response && response.text) {
            return response.text.trim();
        } else {
            throw new Error("Received an empty or invalid response from the API for backstory generation.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for backstory:", error);
        throw new Error("Failed to communicate with the Gemini API for backstory generation.");
    }
}