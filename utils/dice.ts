import type { RollResult } from '../types';

/**
 * Parses a dice formula string (e.g., "2d10+25", "1d100", "2d10*10") and returns a detailed result.
 * This is a robust parser that handles dice, sides, and an optional modifier with an operator.
 * @param formula The dice formula string.
 * @returns A RollResult object with the total, individual rolls, modifier, and original formula.
 */
export function parseAndRoll(formula: string): RollResult {
    const cleanedFormula = formula.replace(/\s/g, '').toLowerCase();

    const dIndex = cleanedFormula.indexOf('d');
    if (dIndex === -1) {
        throw new Error(`Invalid dice formula: "${formula}" (missing 'd')`);
    }

    const numDice = parseInt(cleanedFormula.substring(0, dIndex), 10);
    
    let modifierPartIndex = -1;
    const operators = ['+', '-', '*', '/'];
    for(const op of operators) {
        const opIndex = cleanedFormula.indexOf(op, dIndex);
        if (opIndex > -1) {
            modifierPartIndex = opIndex;
            break;
        }
    }

    const sidesStr = modifierPartIndex > -1 
        ? cleanedFormula.substring(dIndex + 1, modifierPartIndex)
        : cleanedFormula.substring(dIndex + 1);

    const sides = parseInt(sidesStr, 10);

    if (isNaN(numDice) || isNaN(sides) || numDice <= 0 || sides <= 0) {
        throw new Error(`Invalid dice formula parts: "${formula}"`);
    }

    const rolls: number[] = [];
    let diceTotal = 0;
    for (let i = 0; i < numDice; i++) {
        // Mothership is a d100/percentile system that often uses 0-based results for tables and checks.
        // This unified dice roller will produce 0-based results (e.g., a d10 will be 0-9).
        // This makes integration with tables and stat checks (0-99) much cleaner.
        const roll = Math.floor(Math.random() * sides);
        rolls.push(roll);
        diceTotal += roll;
    }

    let total = diceTotal;
    let modifier = 0;

    if (modifierPartIndex > -1) {
        const operator = cleanedFormula[modifierPartIndex];
        const valueStr = cleanedFormula.substring(modifierPartIndex + 1);
        const value = parseInt(valueStr, 10);

        if (isNaN(value)) {
            throw new Error(`Invalid modifier in formula: "${formula}"`);
        }
        
        switch (operator) {
            case '+':
                total += value;
                modifier = value;
                break;
            case '-':
                total -= value;
                modifier = -value;
                break;
            case '*':
                total *= value;
                // The display logic doesn't handle multipliers well, so modifier is 0 for display. Total is correct.
                modifier = 0; 
                break;
            case '/':
                total = Math.floor(total / value);
                modifier = 0;
                break;
        }
    }
    
    return {
        total,
        rolls,
        modifier,
        formula: cleanedFormula,
    };
}


/**
 * A simple dice roller that takes a formula and returns only the total.
 * It is a wrapper around the more detailed parseAndRoll function.
 * @param formula The dice formula string.
 * @returns The total result of the roll.
 */
export const rollDice = (formula: string): number => {
    try {
        return parseAndRoll(formula).total;
    } catch (e) {
        console.error(e);
        return 0; // Return 0 if the formula is invalid
    }
}