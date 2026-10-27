/**
 * How a screen reader should say a blood group. "O-" is otherwise read as "O dash" or "O minus".
 * Accepts "O-", "O−" (minus sign), "AB+", "O NEG", "A POS".
 */
export function spokenBloodType(name: string): string {
  const value = name.trim().toUpperCase().replace("−", "-");
  const match = value.match(/^(AB|A|B|O)\s*(\+|-|POS|NEG)$/);
  if (!match) return name.trim();
  const sign = match[2] === "+" || match[2] === "POS" ? "positivo" : "negativo";
  return `${match[1]} ${sign}`;
}
