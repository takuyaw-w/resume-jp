import type { ThemeModule } from "@resume/theme-api";
import { getBuiltinTheme } from "./builtin.ts";

type ThemeModuleNamespace = {
  default?: unknown;
  theme?: unknown;
};

function isThemeModule(value: unknown): value is ThemeModule {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.render === "function" &&
    typeof candidate.meta === "object" &&
    candidate.meta !== null
  );
}

function pickThemeExport(namespace: ThemeModuleNamespace): ThemeModule {
  if (isThemeModule(namespace.default)) {
    return namespace.default;
  }

  if (isThemeModule(namespace.theme)) {
    return namespace.theme;
  }

  throw new Error(
    "Theme module must export a ThemeModule as default export or named export `theme`.",
  );
}

function isLocalPath(specifier: string): boolean {
  return (
    specifier.startsWith("./") ||
    specifier.startsWith("../") ||
    specifier.startsWith("/") ||
    specifier.startsWith("file://")
  );
}

function toImportSpecifier(themeRef: string): string {
  if (themeRef.startsWith("file://")) {
    return themeRef;
  }

  if (isLocalPath(themeRef)) {
    return new URL(themeRef, `file://${Deno.cwd()}/`).href;
  }

  if (
    themeRef.startsWith("jsr:") ||
    themeRef.startsWith("npm:") ||
    themeRef.startsWith("http://") ||
    themeRef.startsWith("https://")
  ) {
    return themeRef;
  }

  return import.meta.resolve(themeRef);
}

export async function resolveTheme(themeRef: string): Promise<ThemeModule> {
  const builtin = getBuiltinTheme(themeRef);
  if (builtin) {
    return builtin;
  }

  const specifier = toImportSpecifier(themeRef);
  const namespace = await import(specifier) as ThemeModuleNamespace;

  return pickThemeExport(namespace);
}
