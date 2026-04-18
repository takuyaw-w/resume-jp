import { Command } from "@cliffy/command";
import { stringify as stringifyYaml } from "@std/yaml";
import skillSheetTemplate from "../templates/skill-sheet.json" with {
  type: "json",
};

type InitFormat = "json" | "yaml";

function isInitFormat(value: string): value is InitFormat {
  return value === "json" || value === "yaml";
}

function renderTemplate(format: InitFormat): string {
  if (format === "json") {
    return `${JSON.stringify(skillSheetTemplate, null, 2)}\n`;
  }

  return `${stringifyYaml(skillSheetTemplate)}`;
}

function defaultOutputPath(format: InitFormat): string {
  return format === "yaml" ? "./resume.yaml" : "./resume.json";
}

export const initCommand = new Command()
  .description("Create starter files")
  .option("-f, --format <format:string>", "Output format: json | yaml", {
    default: "json",
  })
  .option("-F, --force", "Overwrite existing file")
  .action(async (options: { format: string; force?: boolean }) => {
    if (!isInitFormat(options.format)) {
      console.error(`Unsupported format: ${options.format}`);
      Deno.exit(1);
    }

    const outPath = defaultOutputPath(options.format);

    if (!options.force) {
      try {
        await Deno.stat(outPath);
        console.error(`File already exists: ${outPath}`);
        console.error("Use --force to overwrite.");
        Deno.exit(1);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    }

    await Deno.writeTextFile(outPath, renderTemplate(options.format));
    console.log(`Created: ${outPath}`);
  });
