import { defineConfig } from "vitest/config";

// Keep agent worktrees (.claude/worktrees) and build output out of the test run.
export default defineConfig({ test: { exclude: ["**/node_modules/**", "**/.claude/**", "**/dist/**"] } });
