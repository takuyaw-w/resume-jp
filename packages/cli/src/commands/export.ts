import { Command } from "@cliffy/command";
import {
  normalizeResume,
  parseResumeContent,
  renderHtml,
  ResumeParseError,
  validateResume,
} from "@resume/core";
import { ZodError } from "zod";
import { resolveTheme } from "../themes/resolve.ts";
import { renderPdfFromHtml } from "../renderers/pdf.ts";

type ExportFormat = "html" | "pdf";

function isExportFormat(value: string): value is ExportFormat {
  return value === "html" || value === "pdf";
}

export const exportCommand = new Command()
  .arguments("<input:string>")
  .description("Export resume document")
  .option("-f, --format <format:string>", "Output format", {
    default: "html",
  })
  .option("-o, --out <path:string>", "Output path")
  .option("-t, --theme <theme:string>", "Theme id or path", {
    default: "jp-basic",
  })
  .option(
    "--browser-path <path:string>",
    "Chrome/Chromium executable path (overrides auto-detection)",
  )
  .action(async (
    options: {
      format: string;
      out?: string;
      theme: string;
      browserPath?: string;
    },
    input: string,
  ) => {
    if (!isExportFormat(options.format)) {
      console.error(`Unsupported format: ${options.format}`);
      console.error("Allowed values: html, pdf");
      Deno.exit(1);
    }

    let text: string;

    try {
      text = await Deno.readTextFile(input);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.error(`File not found: ${input}`);
        Deno.exit(1);
      }

      throw error;
    }

    try {
      const parsed = parseResumeContent(text, input);
      const validated = validateResume(parsed);
      const document = normalizeResume(validated);
      const theme = await resolveTheme(options.theme);
      const html = await renderHtml(document, theme, {
        format: options.format,
      });

      if (options.format === "html") {
        const outPath = options.out ?? "./dist/resume.html";
        await Deno.mkdir("./dist", { recursive: true });
        await Deno.writeTextFile(outPath, `${html}\n`);

        console.log(`Exported HTML: ${outPath}`);
        console.log(`Theme: ${theme.meta.id}`);
        return;
      }

      const outPath = options.out ?? "./dist/resume.pdf";
      await renderPdfFromHtml(html, outPath, {
        browserPath: options.browserPath,
      });

      console.log(`Exported HTML: ${outPath}`);
      console.log(`Theme: ${theme.meta.id}`);
    } catch (error) {
      if (error instanceof ResumeParseError) {
        console.error(error.message);
        Deno.exit(1);
      }

      if (error instanceof ZodError) {
        console.error(`Schema validation failed: ${input}`);
        for (const issue of error.issues) {
          const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
          console.error(`- ${path}: ${issue.message}`);
        }
        Deno.exit(1);
      }

      if (error instanceof Error) {
        console.error(error.message);
        Deno.exit(1);
      }

      throw error;
    }
  });
