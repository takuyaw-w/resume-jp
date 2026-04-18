import { Command } from "@cliffy/command";
import { ZodError } from "zod";
import {
  parseResumeContent,
  ResumeParseError,
  validateResume,
} from "@resume/core";

export const validateCommand = new Command()
  .arguments("<input:string>")
  .description("Validate input file")
  .action(async (_options, input: string) => {
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

    let parsed: unknown;

    try {
      parsed = parseResumeContent(text, input);
    } catch (error) {
      if (error instanceof ResumeParseError) {
        console.error(error.message);
        Deno.exit(1);
      }
      throw error;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      console.error("Top-level value must be an object.");
      Deno.exit(1);
    }

    try {
      validateResume(parsed);
    } catch (error) {
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

    console.log(`OK: ${input}`);
  });
