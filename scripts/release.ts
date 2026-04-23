#!/usr/bin/env -S deno run -A

import { basename, join } from "@std/path";

type TargetConfig = {
  denoTarget: string;
  archiveKind: "zip" | "tar.gz";
  archiveLabel: string;
  binaryName: string;
};

const TARGETS: TargetConfig[] = [
  {
    denoTarget: "x86_64-pc-windows-msvc",
    archiveKind: "zip",
    archiveLabel: "windows-x64",
    binaryName: "resume.exe",
  },
  {
    denoTarget: "aarch64-apple-darwin",
    archiveKind: "tar.gz",
    archiveLabel: "darwin-arm64",
    binaryName: "resume",
  },
  {
    denoTarget: "x86_64-unknown-linux-gnu",
    archiveKind: "tar.gz",
    archiveLabel: "linux-x64",
    binaryName: "resume",
  },
];

function parseArgs(args: string[]) {
  let version = "";
  let onlyTarget: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--version" || arg === "-v") {
      version = args[++i] ?? "";
      continue;
    }

    if (arg === "--target") {
      onlyTarget = args[++i];
      continue;
    }
  }

  if (!version) {
    throw new Error("Missing --version");
  }

  return { version, onlyTarget };
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

async function ensureCleanDir(path: string) {
  await Deno.remove(path, { recursive: true }).catch(() => {});
  await Deno.mkdir(path, { recursive: true });
}

async function copyFile(src: string, dest: string) {
  await Deno.mkdir(join(dest, ".."), { recursive: true }).catch(() => {});
  await Deno.copyFile(src, dest);
}

async function createArchive(
  stagingRoot: string,
  packageDirName: string,
  outputPath: string,
  kind: "zip" | "tar.gz",
) {
  if (kind === "zip") {
    await run(["zip", "-r", outputPath, packageDirName], stagingRoot);
    return;
  }

  await run(["tar", "-czf", outputPath, packageDirName], stagingRoot);
}

async function main() {
  const { version, onlyTarget } = parseArgs(Deno.args);

  const rootDir = Deno.cwd();
  const distDir = join(rootDir, "dist");
  const releasesDir = join(distDir, "releases");
  const stagingRoot = join(distDir, "release-staging");

  await Deno.mkdir(releasesDir, { recursive: true });

  const selectedTargets = onlyTarget
    ? TARGETS.filter((target) => target.archiveLabel === onlyTarget)
    : TARGETS;

  if (selectedTargets.length === 0) {
    throw new Error(`Unknown target: ${onlyTarget}`);
  }

  for (const target of selectedTargets) {
    const packageDirName = `resume-jp-v${version}-${target.archiveLabel}`;
    const packageDir = join(stagingRoot, packageDirName);
    const binaryOutput = join(distDir, target.binaryName);

    await ensureCleanDir(packageDir);

    await run([
      "deno",
      "run",
      "-A",
      "./scripts/compile.ts",
      "--target",
      target.denoTarget,
      "--output",
      binaryOutput,
    ], rootDir);

    await copyFile(binaryOutput, join(packageDir, basename(target.binaryName)));
    await copyFile(join(rootDir, "LICENSE"), join(packageDir, "LICENSE"));
    await copyFile(
      join(rootDir, "THIRD_PARTY_LICENSES.txt"),
      join(packageDir, "THIRD_PARTY_LICENSES.txt"),
    );

    const ext = target.archiveKind === "zip" ? "zip" : "tar.gz";
    const archivePath = join(releasesDir, `${packageDirName}.${ext}`);

    await Deno.remove(archivePath).catch(() => {});
    await createArchive(
      stagingRoot,
      packageDirName,
      archivePath,
      target.archiveKind,
    );

    console.log(`Created: ${archivePath}`);
  }
}

if (import.meta.main) {
  await main();
}
