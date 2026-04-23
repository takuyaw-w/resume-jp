import type { ResumeInput } from "@resume/types";
import type { SaveDocumentResult, UiApi } from "./uiApi.ts";

type GetDocumentResponse = {
  document: ResumeInput;
  sorce: {
    path: string;
    format: "json" | "jsonc" | "yaml";
  };
};

export function createHttpUiApi(baseUrl = ""): UiApi {
  return {
    async loadDocument(): Promise<ResumeInput> {
      const response = await fetch(`${baseUrl}/api/document`);

      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status}`);
      }

      const data = await response.json() as GetDocumentResponse;
      return data.document;
    },

    async saveDocument(document: ResumeInput): Promise<SaveDocumentResult> {
      const response = await fetch(`${baseUrl}/api/save`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ document }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Failed to save document: ${response.status}`,
        );
      }

      return await response.json() as SaveDocumentResult;
    },
  };
}
