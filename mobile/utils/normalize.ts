
export function normalize(value?: string | null): string {

    if (!value)
        return "";

    return value
        .trim()
        .toLowerCase();
}