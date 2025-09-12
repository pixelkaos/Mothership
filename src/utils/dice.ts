import type { RollResult } from '@/types';
import * as Roller from '@randsum/roller';

// Be resilient to different export styles across versions
const randsumRoll: (expr: string) => any = (Roller as any).roll ?? (Roller as any).default?.roll ?? (Roller as any).default ?? ((_: string) => { throw new Error('Randsum roller not available'); });

type ParseOptions = { zeroBased?: boolean };

/**
 * Parses a dice expression (e.g., "2d10+25", "1d100", "5d10*10") and rolls via Randsum.
 * Supports +, -, *, / post-operators and optional zero-based normalization.
 */
export function parseAndRoll(formula: string, options: ParseOptions = {}): RollResult {
    const cleaned = formula.replace(/\s/g, '').toLowerCase();

    const dIndex = cleaned.indexOf('d');
    if (dIndex === -1) {
        throw new Error(`Invalid dice formula: "${formula}" (missing 'd')`);
    }

    // Find first operator after 'd'
    const ops = ['+', '-', '*', '/'];
    let opIndex = -1;
    for (const op of ops) {
        const i = cleaned.indexOf(op, dIndex + 1);
        if (i !== -1) { opIndex = i; break; }
    }

    const core = opIndex === -1 ? cleaned : cleaned.slice(0, opIndex);
    const operator = opIndex === -1 ? null : cleaned[opIndex];
    const rhsStr = opIndex === -1 ? '' : cleaned.slice(opIndex + 1);
    const rhsVal = opIndex === -1 ? 0 : parseInt(rhsStr, 10);

    const qty = parseInt(core.slice(0, core.indexOf('d')), 10);
    const sidesStr = core.slice(core.indexOf('d') + 1);
    const sides = parseInt(sidesStr, 10);
    if (!Number.isFinite(qty) || !Number.isFinite(sides) || qty <= 0 || sides <= 0) {
        throw new Error(`Invalid dice formula parts: "${formula}"`);
    }

    // Roll using Randsum
    const rsResult: any = randsumRoll(core);
    // Try to interpret return shape robustly
    const oneBasedValues: number[] = Array.isArray(rsResult)
        ? (rsResult as number[])
        : Array.isArray(rsResult?.result)
            ? (rsResult.result as number[])
            : Array.isArray(rsResult?.rolls)
                ? (rsResult.rolls as number[])
                : [];
    const oneBasedTotal: number = Array.isArray(rsResult)
        ? oneBasedValues.reduce((acc, v) => acc + v, 0)
        : (typeof rsResult?.total === 'number' ? rsResult.total : oneBasedValues.reduce((acc, v) => acc + v, 0));

    const zeroBased = !!options.zeroBased;
    const normalizedRolls = zeroBased ? oneBasedValues.map(v => v - 1) : oneBasedValues.slice();
    let total = zeroBased ? (oneBasedTotal - qty) : oneBasedTotal;

    // Apply arithmetic operator on the normalized total
    let modifier = 0;
    if (operator && rhsStr && !Number.isNaN(rhsVal)) {
        switch (operator) {
            case '+':
                total += rhsVal;
                modifier = rhsVal;
                break;
            case '-':
                total -= rhsVal;
                modifier = -rhsVal;
                break;
            case '*':
                total *= rhsVal;
                break;
            case '/':
                total = Math.floor(total / rhsVal);
                break;
        }
    }

    return { total, rolls: normalizedRolls, modifier, formula: cleaned };
}

/** Returns only the total for a dice expression. */
export const rollDice = (formula: string, options: ParseOptions = {}): number => {
    try {
        return parseAndRoll(formula, options).total;
    } catch (e) {
        console.error(e);
        return 0;
    }
};
