import { GoogleGenAI } from "@google/genai";
import type { DerelictShip, Character } from '@/types';

// Lazily initialize the Gemini client to avoid crashing the app at import time.
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!_ai) {
        if (!apiKey) {
            throw new Error("Gemini API key not configured. Set VITE_GEMINI_API_KEY in your environment.");
        }
        _ai = new GoogleGenAI({ apiKey });
    }
    return _ai;
}

// --- Ollama client for local storytelling model ---
const OLLAMA_BASE_URL_ENV = (import.meta.env.VITE_OLLAMA_BASE_URL as string | undefined) || '';
const OLLAMA_MODEL = (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ?? 'tohur/natsumura-storytelling-rp-llama-3.1';

let RESOLVED_OLLAMA_BASE: string | null = null;

async function tryFetch(url: string, opts: { timeoutMs: number }): Promise<{ ok: boolean; message?: string; status?: number }> {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), opts.timeoutMs);
    try {
        const res = await fetch(url, { signal: ac.signal });
        return { ok: res.ok, status: res.status, message: res.ok ? undefined : `HTTP ${res.status}` };
    } catch (err: any) {
        const msg = err?.name === 'AbortError' ? 'Timed out' : (err?.message || 'Fetch failed');
        return { ok: false, message: msg };
    } finally {
        clearTimeout(timer);
    }
}

async function resolveOllamaBase(timeoutMs: number): Promise<string> {
    if (RESOLVED_OLLAMA_BASE) return RESOLVED_OLLAMA_BASE;
    const candidates = [
        ...(OLLAMA_BASE_URL_ENV ? [OLLAMA_BASE_URL_ENV] : []),
        '/ollama',
        'http://localhost:11434',
        'http://127.0.0.1:11434',
    ];
    const looksLikeHtml = (s: string) => /<\s*!?doctype|<\s*html[\s>]/i.test(s);
    for (const base of candidates) {
        try {
            // Prefer tags endpoint to validate real Ollama JSON
            const res = await fetch(`${base}/api/tags`);
            if (!res.ok) throw new Error('not ok');
            const data = await res.json().catch(() => null) as any;
            if (data && (Array.isArray(data.models) || Array.isArray(data?.models?.models))) {
                RESOLVED_OLLAMA_BASE = base;
                return base;
            }
        } catch {}
        try {
            // Fallback: version endpoint must not be HTML
            const res = await fetch(`${base}/api/version`);
            if (!res.ok) throw new Error('not ok');
            const txt = await res.text();
            if (txt && !looksLikeHtml(txt) && txt.length < 64) {
                RESOLVED_OLLAMA_BASE = base;
                return base;
            }
        } catch {}
    }
    // default back to env or proxy path for messaging
    return OLLAMA_BASE_URL_ENV || '/ollama';
}

function baseModelName(name: string): string {
    return name.split(':')[0];
}

export async function checkOllamaHealth(opts: { ensureModel?: boolean; timeoutMs?: number } = {}): Promise<{ ok: boolean; version?: string; modelPresent?: boolean; message?: string; base?: string }>{
    const { ensureModel = false, timeoutMs = 2000 } = opts;
    try {
        const base = await resolveOllamaBase(timeoutMs);
        const versionRes = await fetch(`${base}/api/version`);
        if (!versionRes.ok) throw new Error(`HTTP ${versionRes.status}`);
        // Check server is reachable
        const version = await versionRes.text().catch(() => undefined);

        if (!ensureModel) return { ok: true, version, base };

        // Check model availability
        const tagsRes = await fetch(`${base}/api/tags`);
        if (!tagsRes.ok) return { ok: true, version, modelPresent: false, message: 'Ollama reachable but failed to list models.', base };
        const tags = await tagsRes.json().catch(() => null) as any;
        const models: any[] = Array.isArray(tags?.models) ? tags.models : [];
        const targetFull = baseModelName(OLLAMA_MODEL).toLowerCase(); // e.g., 'tohur/natsumura-storytelling-rp-llama-3.1'
        const targetShort = targetFull.split('/').pop() || targetFull; // e.g., 'natsumura-storytelling-rp-llama-3.1'
        const present = models.some(m => {
            const raw = (m?.name ?? m?.model ?? '').toString();
            const n = raw.toLowerCase();
            return n === targetFull || n.startsWith(`${targetFull}:`) || n.includes(`/${targetShort}:`) || n.endsWith(`/${targetShort}`) || n === targetShort || n.startsWith(`${targetShort}:`);
        });
        return { ok: true, version, modelPresent: present, base };
    } catch (err: any) {
        const msg = err?.name === 'AbortError' ? 'Timed out connecting to Ollama.' : (err?.message || 'Failed to reach Ollama.');
        return { ok: false, message: msg };
    }
}

async function ollamaGenerate(prompt: string): Promise<string> {
    // quick health check to produce helpful errors
    const health = await checkOllamaHealth({ ensureModel: true });
    if (!health.ok) {
        throw new Error(`Ollama not reachable. Tried base: ${health.base ?? (RESOLVED_OLLAMA_BASE || OLLAMA_BASE_URL_ENV || '/ollama')}. Ensure it's running (ollama serve). ${health.message ? 'Details: ' + health.message : ''}`);
    }
    if (health.modelPresent === false) {
        throw new Error(`Ollama is running but model not found: ${OLLAMA_MODEL}. Pull it via: ollama pull ${OLLAMA_MODEL}`);
    }

    const attempt = async () => {
        const base = health.base || (RESOLVED_OLLAMA_BASE || await resolveOllamaBase(1500));
        const res = await fetch(`${base}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                options: { temperature: 0.7, top_p: 0.9 },
            }),
        });
        if (!res.ok) throw new Error(`Ollama request failed: ${res.status} ${res.statusText}`);
        const data = await res.json();
        const text: unknown = (data && (data.response ?? data.message?.content)) as unknown;
        if (typeof text !== 'string' || !text.trim()) throw new Error('Invalid response from Ollama');
        return text.trim();
    };

    try {
        return await attempt();
    } catch (e: any) {
        // one quick retry
        try {
            return await attempt();
        } catch (err: any) {
            const reason = err?.message || 'Unknown error';
            throw new Error(`Local generation failed. ${reason}`);
        }
    }
}

export async function generateDerelictDescription(shipData: DerelictShip): Promise<string> {
    const prompt = `
You are a creative Gamemaster for the sci-fi horror tabletop RPG "Mothership". Your tone is bleak, tense, and grounded in a gritty, blue-collar vision of the future inspired by films like 'Alien' and 'Event Horizon'.

Based on the following randomly generated details for a derelict spacecraft, write an atmospheric and engaging description for the players. Weave all the provided elements into a cohesive and spooky narrative. The description should be presented as a ship's log entry, a salvage crew's preliminary report, or a direct description to the players as they board the ship.

Derelict Ship Data:
- Ship Name/Identifier: ${shipData.name}
- Ship Model & Status: ${shipData.shipModel} (${shipData.status})
- Systems: ${shipData.systems}
- Survivors: ${shipData.survivors}
- Cause of Ruination: ${shipData.causeOfRuination}
- Weird Trait: ${shipData.weirdTrait}
- Notable Cargo: ${shipData.cargo}
- Potential Salvage: ${shipData.salvage}

Make it scary, mysterious, and full of hooks for a roleplaying game session. If the cause is "Starvation" and the weird trait is "Failed Utopia", describe the grim evidence of a society that turned on itself when its ideals couldn't provide food. If the cargo is "Cremains", perhaps the urns are all mislabeled or contain something other than ash. Do not just list the data; create a story from it.
`;

    try {
        return await ollamaGenerate(prompt);
    } catch (error) {
        console.error('Error calling Ollama for derelict description:', error);
        throw new Error('Failed to communicate with the local Ollama model.');
    }
}

export async function generateCharacterPortrait(prompt: string): Promise<string> {
    try {
        const ai = getAI();
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

Character Data:
- Name: ${character.name}
- Pronouns: ${character.pronouns}
- Class: ${character.class?.name || 'Unknown'}
- High Stats: ${Object.entries(character.stats).filter(([, val]) => val > 45).map(([key]) => key).join(', ') || 'None'}
- Low Stats: ${Object.entries(character.stats).filter(([, val]) => val < 35).map(([key]) => key).join(', ') || 'None'}
- High Saves: ${Object.entries(character.saves).filter(([, val]) => val > 40).map(([key]) => key).join(', ') || 'None'}
- Low Saves: ${Object.entries(character.saves).filter(([, val]) => val < 25).map(([key]) => key).join(', ') || 'None'}
- Key Skills: ${[...character.skills.master, ...character.skills.expert, ...character.skills.trained].slice(0, 5).join(', ')}
- Trinket: ${character.equipment.trinket}
- Patch: ${character.equipment.patch}

Instructions:
1. Key Facts: Create a bulleted list of 7 key facts about the character using the specified labels.
2. Backstory: Write a compelling and atmospheric narrative background story of 150–200 words. It should feel grounded, weave in the key facts, and hint at why they take dangerous contracts in deep space.

Output Format (Markdown exactly):
### Key Facts
* **Age:** [Estimated Age]
* **Homeworld:** [Place of origin]
* **Background:** [Brief educational/professional background]
* **Defining Event:** [A defining life event or trauma]
* **Motivation:** [Debt, escape, discovery, etc.]
* **Quirk:** [A personal quirk or belief]
* **Trinket's Significance:** [What the trinket means to them]

### Backstory
[Your 150–200 word narrative here]
`;

    try {
        return await ollamaGenerate(prompt);
    } catch (error) {
        console.error('Error calling Ollama for backstory:', error);
        throw new Error('Failed to communicate with the local Ollama model for backstory generation.');
    }
}

// Quick test helper for the local storytelling model
export async function testStoryModel(): Promise<string> {
    try {
        const health = await checkOllamaHealth({ ensureModel: true });
        if (!health.ok) throw new Error(health.message || 'Ollama not reachable');
        if (health.modelPresent === false) throw new Error(`Model missing: ${OLLAMA_MODEL}`);
        const sample = await ollamaGenerate('Reply with exactly: OK');
        return sample;
    } catch (e: any) {
        throw new Error(e?.message || 'Test failed');
    }
}
