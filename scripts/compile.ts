import { join } from "@std/path";

type CompileOptions = {
  output: string;
  target?: string;
  selfExtracting: boolean;
};

function parseArgs(args: string[]): CompileOptions {
  let output = "./dist/resume";
  let target: string | undefined;
  let selfExtracting = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--output" || arg === "-o") {
      output = args[++i] ?? output;
      continue;
    }

    if (arg === "--target") {
      target = args[++i];
      continue;
    }

    if (arg === "--self-extracting") {
      selfExtracting = true;
      continue;
    }
  }

  return {
    output,
    target,
    selfExtracting,
  };
}

async function run(cmd: string[], cwd?: string) {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const result = await command.output();

  if (!result.success) {
    Deno.exit(result.code);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

async function main() {
  const options = parseArgs(Deno.args);

  const rootDir = Deno.cwd();
  const uiAppDir = join(rootDir, "packages/ui-app");
  const uiDistDir = join(rootDir, "packages/ui-app/dist");
  const cliEntry = join(rootDir, "packages/cli/src/cli.ts");

  await Deno.mkdir(join(rootDir, "dist"), { recursive: true });

  console.log("Building ui-app...");
  await run(["deno", "task", "build"], uiAppDir);

  if (!(await exists(join(uiDistDir, "index.html")))) {
    console.error(`UI build not found: ${uiDistDir}`);
    Deno.exit(1);
  }

  const compileArgs = [
    "compile",
    "--allow-read",
    "--allow-write",
    "--allow-net",
    "--allow-env",
    "--allow-sys=homedir",
    "--allow-run",
    "--node-modules-dir=auto",
    "--include",
    uiDistDir,
    "-o",
    options.output,
  ];

  if (options.target) {
    compileArgs.push("--target", options.target);
  }

  if (options.selfExtracting) {
    compileArgs.push("--self-extracting");
  }

  compileArgs.push(cliEntry);

  console.log("Compiling binary...");
  await run(["deno", ...compileArgs], rootDir);

  console.log(`Compiled: ${options.output}`);
}

if (import.meta.main) {
  await main();
}
