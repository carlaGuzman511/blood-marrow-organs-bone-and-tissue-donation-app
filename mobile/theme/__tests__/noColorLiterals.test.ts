import fs from "fs";
import path from "path";

/**
 * US-MOB-08: colors live in one module. Only theme/palette.ts may contain color literals;
 * every screen and component takes them from the theme (useTheme / makeStyles, or the
 * legacy COLORS bridge in constants/theme.ts, which is built from the theme).
 */
const ROOT = path.resolve(__dirname, "../..");
const SCANNED = ["app", "components", "constants", "features", "hooks", "screens", "utils", "theme", "BottonTabNavigation.tsx"];
// palette.ts holds the colors; contrast.ts is the WCAG calculator and works on raw values.
const ALLOWED = new Set([path.join("theme", "palette.ts"), path.join("theme", "contrast.ts")]);

const LITERAL = [
  /#[0-9a-fA-F]{3,8}\b/, // #fff, #E11D48, #00000080
  /\b(rgba?|hsla?)\(/, // rgba(0,0,0,0.5)
  /["'](white|black|red|green|blue|gray|grey|yellow|orange|purple|pink)["']/, // named colors
];

function sourceFiles(entry: string): string[] {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return /\.(ts|tsx)$/.test(entry) ? [entry] : [];
  return fs.readdirSync(full).flatMap((name) =>
    name === "__tests__" || name === "node_modules" ? [] : sourceFiles(path.join(entry, name)),
  );
}

/** Drops comments so documentation can still quote a color. */
function withoutComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("color literals", () => {
  const files = SCANNED.flatMap(sourceFiles).filter((file) => !ALLOWED.has(file));

  it("scans the app source", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("appear only in theme/palette.ts", () => {
    const offenders = files.flatMap((file) =>
      withoutComments(fs.readFileSync(path.join(ROOT, file), "utf8"))
        .split("\n")
        .flatMap((line, i) => (LITERAL.some((re) => re.test(line)) ? [`${file}:${i + 1}  ${line.trim()}`] : [])),
    );
    expect(offenders).toEqual([]);
  });
});
