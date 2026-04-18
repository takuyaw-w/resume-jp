import type {
  RenderContext,
  ResumeDocument,
  ThemeModule,
} from "@resume/theme-api";

export async function renderHtml(
  document: ResumeDocument,
  theme: ThemeModule,
  context: RenderContext = { format: "html" },
): Promise<string> {
  return await theme.render(document, context);
}
