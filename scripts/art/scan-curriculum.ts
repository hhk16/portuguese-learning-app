/**
 * Finds every emoji used in string/template literals under src/curriculum/**.ts.
 *   node scripts/art/scan-curriculum.ts          → prints the glyphs (one line)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { extractEmoji } from "../../src/art/glyph.ts";
import { REPO } from "./common.ts";

function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return tsFiles(p);
    return /\.tsx?$/.test(name) ? [p] : [];
  });
}

const LITERALS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
]);

/** Unique emoji (first-seen order) found in string literals of the curriculum sources. */
export function scanCurriculumEmoji(root = join(REPO, "src/curriculum")): string[] {
  const seen = new Set<string>();
  for (const file of tsFiles(root)) {
    const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, false);
    const visit = (node: ts.Node): void => {
      if (LITERALS.has(node.kind)) for (const e of extractEmoji((node as ts.LiteralLikeNode).text)) seen.add(e);
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return [...seen];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const glyphs = scanCurriculumEmoji();
  console.log(`${glyphs.length} emoji:\n${glyphs.join(" ")}`);
}
