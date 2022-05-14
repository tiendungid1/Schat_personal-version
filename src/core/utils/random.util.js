/**
 * @returns {String}
 */
export function generateRandomString() {
    return Math.random().toString(36).substring(2, 7);
}
