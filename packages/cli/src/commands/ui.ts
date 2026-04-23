import { Command } from "@cliffy/command";
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { extname, join } from "@std/path";
import { stringify as stringifyYaml } from "@std/yaml";
import {
  parseResumeContent,
  ResumeParseError,
  validateResume,
} from "@resume/core";
import type { ResumeInput } from "@resume/types";
import { ZodError } from "zod";

type SourceFormat = "json" | "jsonc" | "yaml";

function detectFormat(inputPath: string): SourceFormat {
  const ext = extname(inputPath).toLowerCase();

  switch (ext) {
    case ".json":
      return "json";
    case ".jsonc":
      return "jsonc";
    case ".yaml":
    case ".yml":
      return "yaml";
    default:
      console.error(`Unsupported file extension: ${ext || "(none)"}`);
      console.error("Use .json, .jsonc, .yaml, or .yml");
      Deno.exit(1);
  }
}

async function ensureInputExists(inputPath: string): Promise<void> {
  try {
    await Deno.stat(inputPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`File not found: ${inputPath}`);
      console.error("Create a starter file first: resume init");
      Deno.exit(1);
    }

    throw error;
  }
}

function resolveUiDistDir(): string {
  return join(import.meta.dirname!, "../../../ui-app/dist/");
}

async function ensureUiBuildExists(uiDistDir: string): Promise<void> {
  try {
    await Deno.stat(`${uiDistDir}/index.html`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`UI build not found: ${uiDistDir}`);
      console.error("Run the UI build first: deno task ui:build");
      Deno.exit(1);
    }

    throw error;
  }
}

async function loadResumeInput(inputPath: string): Promise<ResumeInput> {
  const text = await Deno.readTextFile(inputPath);
  const parsed = parseResumeContent(text, inputPath);
  return validateResume(parsed);
}

function serializeResumeInput(
  document: ResumeInput,
  format: SourceFormat,
): string {
  switch (format) {
    case "json":
    case "jsonc":
      return `${JSON.stringify(document, null, 2)}\n`;
    case "yaml":
      return stringifyYaml(document);
  }
}

async function saveResumeInput(
  inputPath: string,
  document: ResumeInput,
): Promise<void> {
  const format = detectFormat(inputPath);
  const validated = validateResume(document);
  const output = serializeResumeInput(validated, format);
  await Deno.writeTextFile(inputPath, output);
}

function createUiApp(options: {
  inputPath: string;
  uiDistDir: string;
}) {
  const app = new Hono();

  app.get("/api/document", async (c) => {
    const document = await loadResumeInput(options.inputPath);
    const format = detectFormat(options.inputPath);

    return c.json({
      document,
      source: {
        path: options.inputPath,
        format,
      },
    });
  });

  app.post("/api/save", async (c) => {
    const body = await c.req.json() as { document: ResumeInput };
    await saveResumeInput(options.inputPath, body.document);

    return c.json({
      saved: true,
      path: options.inputPath,
    });
  });

  app.use(
    "/assets/*",
    serveStatic({
      root: options.uiDistDir,
    }),
  );

  app.get("/favicon.ico", async () => {
    try {
      const file = await Deno.readFile(`${options.uiDistDir}/favicon.ico`);
      return new Response(file, {
        headers: {
          "content-type": "image/x-icon",
        },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  });

  app.get("*", async (c) => {
    const html = await Deno.readTextFile(`${options.uiDistDir}/index.html`);
    return c.html(html);
  });

  return app;
}

export const uiCommand = new Command()
  .arguments("<input:string>")
  .description("Start local input helper UI")
  .option("-p, --port <port:number>", "Port number", {
    default: 4310,
  })
  .action(async (
    options: { port: number },
    input: string,
  ) => {
    try {
      await ensureInputExists(input);

      // 起動前に parse/validate しておく
      await loadResumeInput(input);

      const uiDistDir = resolveUiDistDir();
      await ensureUiBuildExists(uiDistDir);

      const app = createUiApp({
        inputPath: input,
        uiDistDir,
      });

      const server = Deno.serve(
        {
          hostname: "127.0.0.1",
          port: options.port,
        },
        app.fetch,
      );

      console.log(`UI started: http://127.0.0.1:${options.port}`);
      console.log(`Input: ${input}`);

      await server.finished;
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
