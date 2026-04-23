import type { ResumeInput } from "@resume/types";

export type SaveDocumentResult = {
  saved: true;
  path: string;
};

export type UiApi = {
  loadDocument(): Promise<ResumeInput>;
  saveDocument(document: ResumeInput): Promise<SaveDocumentResult>;
};
