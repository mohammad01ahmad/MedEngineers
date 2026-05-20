/**
 * Returns the initials of a name
 * @param name The name to get the initials of
 * @returns The initials of the name
 * @example getInitials("John Doe") // "JD"
 */

export function getInitials(name?: string): string {
    if (!name) return "??";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}