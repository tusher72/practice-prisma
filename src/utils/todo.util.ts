/** Utility functions for todo-related operations. */

/** Calculates if a todo is expired based on startedTime and duration. */
export function calculateExpiration(startedTime: Date | null, duration: number | null): boolean {
    if (!startedTime || !duration) {
        return false;
    }
    const expirationTime = new Date(startedTime.getTime() + duration * 60 * 1000);
    return new Date() > expirationTime;
}
