
export default function uppercaseFirstLetter(str: string): string {
    // Uppercase each first letter of each word in a string
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}