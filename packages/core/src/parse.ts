import { extname } from "@std/path";
import { parse as parseJsonc } from "@std/jsonc";
import { parse as parseYaml } from "@std/yaml";
import { ResumeParseError } from "./error.ts";

export function parseResumeContent(text: string, inputPath: string): unknown {
  const ext = extname(inputPath).toLowerCase();

  try {
    switch (ext) {
      case ".json":
      case ".jsonc":
        return parseJsonc(text);
      case ".yaml":
      case ".yml":
        return parseYaml(text);
      default:
        throw new ResumeParseError(
          `Unsupported file extension: ${ext || "(none)"}`,
        );
    }
  } catch (error) {
    if (error instanceof ResumeParseError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new ResumeParseError(`Invalid ${ext || "input"}: ${message}`);
  }
}
