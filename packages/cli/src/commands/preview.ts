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

async function buildHtml(input: string, themeRef: string): Promise<string> {
  const text = await Deno.readTextFile(input);
  const parsed = parseResumeContent(text, input);
  const validated = validateResume(parsed);
  const document = normalizeResume(validated);
  const theme = await resolveTheme(themeRef);

  return await renderHtml(document, theme, { format: "html" });
}

export const previewCommand = new Command()
  .arguments("<input:string>")
  .description("Start local preview server")
  .option("-p, --port <port:number>", "Port number", {
    default: 3000,
  })
  .option("-t, --theme <theme:string>", "Theme id or path", {
    default: "jp-basic",
  })
  .action(async (
    options: { port: number; theme: string },
    input: string,
  ) => {
    try {
      const server = Deno.serve(
        {
          hostname: "127.0.0.1",
          port: options.port,
        },
        async (request) => {
          const url = new URL(request.url);

          if (url.pathname === "/") {
            try {
              const html = await buildHtml(input, options.theme);

              return new Response(html, {
                headers: {
                  "content-type": "text/html; charset=utf-8",
                },
              });
            } catch (error) {
              const message = error instanceof Error
                ? error.message
                : String(error);

              return new Response(
                `<pre>Preview render failed:\n${message}</pre>`,
                {
                  status: 500,
                  headers: {
                    "content-type": "text/html; charset=utf-8",
                  },
                },
              );
            }
          }

          if (url.pathname === "/health") {
            return new Response("ok");
          }

          return new Response("Not Found", { status: 404 });
        },
      );

      console.log(`Preview server started: http://127.0.0.1:${options.port}`);
      console.log(`Input: ${input}`);
      console.log(`Theme: ${options.theme} (temporary renderer)`);

      await server.finished;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.error(`File not found: ${input}`);
        Deno.exit(1);
      }

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

      throw error;
    }
  });
