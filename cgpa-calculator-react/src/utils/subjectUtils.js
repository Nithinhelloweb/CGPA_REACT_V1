/**
 * Logic to detect if a subject is "Blended" based on its course code.
 * Pattern: [Regulation][Dept][Semester][Type][Serial]
 * Example: 21IT321 -> Type '2' indicates Blended.
 */
export const isBlendedSubject = (label) => {
    if (!label) return false;

    // Extract code inside parentheses at the end: e.g. "Discrete Mathematics (21MA305)" -> "21MA305"
    const codeMatch = label.match(/\(([^)]+)\)$/);
    if (!codeMatch) return false;
    const code = codeMatch[1];

    // Pattern: [Regulation][Dept][Semester][Type][Serial]
    // Find the numeric part after department letters
    const numericMatch = code.match(/[A-Z]+(\d+)/i);
    if (numericMatch && numericMatch[1] && numericMatch[1].length >= 2) {
        // numericMatch[1] is "321" or "305"
        // The second digit of this numeric part is the "type" (2 = blended)
        return numericMatch[1][1] === '2';
    }
    return false;
};
