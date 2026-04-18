import { Command } from "@cliffy/command";
import { initCommand } from "./commands/init.ts";
import { exportCommand } from "./commands/export.ts";
import { previewCommand } from "./commands/preview.ts";
import { validateCommand } from "./commands/validate.ts";

export function createCli() {
  return new Command()
    .name("resume")
    .version("0.1.0")
    .description("Resume CLI for japanese resume themes")
    .command("init", initCommand)
    .command("validate", validateCommand)
    .command("export", exportCommand)
    .command("preview", previewCommand);
}

if (import.meta.main) {
  await createCli().parse(Deno.args);
}
