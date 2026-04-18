import type { ResumeInput, ResumeProfileName } from "@resume/types";

export type ResumeDocumentName = ResumeProfileName & {
  fullName: string;
  fullNameKana: string;
  initials: string;
};

export type ResumeExperienceSummary = {
  totalMonths: number;
  totalLabel: string;
};

export type ResumeDocument = Omit<ResumeInput, "profile"> & {
  profile: Omit<ResumeInput["profile"], "name" | "gender" | "nationality"> & {
    name: ResumeDocumentName;
    gender?: string;
    nationality?: string;
    experience: ResumeExperienceSummary;
  };
};

export type RenderContext = {
  format: "html" | "pdf";
};

export type ThemeMeta = {
  id: string;
  displayName: string;
  version: string;
};

export type ThemeModule = {
  meta: ThemeMeta;
  render(
    document: ResumeDocument,
    context: RenderContext,
  ): string | Promise<string>;
};
