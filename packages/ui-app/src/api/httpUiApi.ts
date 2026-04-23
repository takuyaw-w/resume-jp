import type { ExportPdfResult, ResumeDraft, SaveResult } from "../types";
import type { UiApi } from "./uiApi";

export function createHttpUiApi(baseUrl = ""): UiApi {
  return {
    async loadDraft(): Promise<ResumeDraft> {
      const response = await fetch(`${baseUrl}/api/document`);

      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status}`);
      }

      const data = await response.json() as { document: ResumeDraft };
      return data.document;
    },

    async saveDraft(draft: ResumeDraft): Promise<SaveResult> {
      const response = await fetch(`${baseUrl}/api/save`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ document: draft }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save document: ${response.status}`);
      }

      return await response.json() as SaveResult;
    },

    async exportPdf(draft: ResumeDraft): Promise<ExportPdfResult> {
      const response = await fetch(`${baseUrl}/api/export/pdf`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ document: draft }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = "resume.pdf";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);

      return { fileName };
    },
  };
}
