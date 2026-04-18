import { dirname } from "@std/path";
import puppeteer from "puppeteer";

export async function renderPdfFromHtml(
  html: string,
  outPath: string,
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
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
