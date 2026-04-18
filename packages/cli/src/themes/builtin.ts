import type { ThemeModule } from "@resume/theme-api";
import { theme as basicTheme } from "@resume/theme-jp-basic";
import { theme as modernTheme } from "@resume/theme-jp-modern";

const builtinThemes: Record<string, ThemeModule> = {
  "jp-basic": basicTheme,
  "jp-modern": modernTheme,
};

export function getBuiltinTheme(themeId: string): ThemeModule | undefined {
  return builtinThemes[themeId];
}
