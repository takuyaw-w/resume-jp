import { dirname } from "@std/path";
import {
  Browser,
  ChromeReleaseChannel,
  computeSystemExecutablePath,
} from "@puppeteer/browsers";
import puppeteer from "puppeteer-core";

type RenderPdfOptions = {
  browserPath?: string;
};

function resolveChromeExecutablePath(options: RenderPdfOptions = {}): string {
  const explicitPath = options.browserPath?.trim() ||
    Deno.env.get("RESUME_JP_CHROME_PATH")?.trim();
  if (explicitPath) {
    return explicitPath;
  }

  const channels: ChromeReleaseChannel[] = [
    ChromeReleaseChannel.STABLE,
    ChromeReleaseChannel.BETA,
    ChromeReleaseChannel.DEV,
    ChromeReleaseChannel.CANARY,
  ];

  let lastError: unknown;
  for (const channel of channels) {
    try {
      return computeSystemExecutablePath({ browser: Browser.CHROME, channel });
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    [
      "Chrome executable could not be auto-detected.",
      "Install Google Chrome, or pass --browser-path, or set RESUME_JP_CHROME_PATH.",
      "",
      "Examples:",
      "  resume export resume.json -f pdf --browser-path /Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      '  resume export resume.json -f pdf --browser-path "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"',
      "  resume export resume.json -f pdf --browser-path /usr/bin/google-chrome",
      lastError instanceof Error ? `Last error: ${lastError.message}` : "",
    ].filter(Boolean).join("\n"),
  );
}

export async function renderPdfFromHtml(
  html: string,
  outPath: string,
  options: RenderPdfOptions = {},
): Promise<void> {
  const executablePath = resolveChromeExecutablePath(options);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "12mm",
        left: "12mm",
        bottom: "12mm",
      },
    });

    await Deno.mkdir(dirname(outPath), { recursive: true });
    await Deno.writeFile(outPath, pdf);
  } finally {
    await browser.close();
  }
}
