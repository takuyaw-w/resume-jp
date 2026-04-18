import type { ResumePhases, ResumeRole } from "@resume/types";

export const PHASE_LABELS: Record<keyof ResumePhases, string> = {
  requirementAnalysis: "要求定義",
  requirementsDefinition: "要件定義",
  basicDesign: "基本設計",
  detailDesign: "詳細設計",
  implementation: "実装",
  unitTest: "単体テスト",
  integrationTest: "結合テスト",
  systemTest: "総合テスト",
  acceptanceTest: "受入テスト",
  release: "リリース",
  operationMaintenance: "運用・保守",
};

export function renderRole(role: ResumeRole): string {
  return role === "leader" ? "リーダー" : "メンバー";
}

export function getEnabledPhaseLabels(phases: ResumePhases): string[] {
  return (Object.entries(phases) as Array<[keyof ResumePhases, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([key]) => PHASE_LABELS[key]);
}
