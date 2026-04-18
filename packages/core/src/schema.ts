import * as z from "zod";
import type {
  ResumeInput,
  ResumePhases,
  ResumeProfile,
  ResumeProject,
  ResumeQualification,
  ResumeRole,
  ResumeSkillItem,
  ResumeSkillSummary,
  ResumeTechStack,
  SkillLevel,
} from "@resume/types";

const roleSchema: z.ZodType<ResumeRole> = z.enum(["member", "leader"]);

const skillLevelSchema: z.ZodType<SkillLevel> = z.enum([
  "初級",
  "中級",
  "上級",
  "実務経験あり",
  "指導可能",
]);

const skillItemSchema: z.ZodType<ResumeSkillItem> = z.object({
  name: z.string(),
  experienceText: z.string().optional(),
  level: skillLevelSchema.optional(),
});

const phasesSchema: z.ZodType<ResumePhases> = z.object({
  requirementAnalysis: z.boolean(),
  requirementsDefinition: z.boolean(),
  basicDesign: z.boolean(),
  detailDesign: z.boolean(),
  implementation: z.boolean(),
  unitTest: z.boolean(),
  integrationTest: z.boolean(),
  systemTest: z.boolean(),
  acceptanceTest: z.boolean(),
  release: z.boolean(),
  operationMaintenance: z.boolean(),
});

const techStackSchema: z.ZodType<ResumeTechStack> = z.object({
  languages: z.array(z.string()),
  serverOs: z.array(z.string()),
  databases: z.array(z.string()),
  frameworks: z.array(z.string()),
  tools: z.array(z.string()),
  others: z.array(z.string()),
});

const projectSchema: z.ZodType<ResumeProject> = z.object({
  period: z.object({
    from: z.string(),
    to: z.string(),
  }),
  projectName: z.string(),
  overview: z.string(),
  role: roleSchema,
  techStack: techStackSchema,
  phases: phasesSchema,
});

const qualificationSchema: z.ZodType<ResumeQualification> = z.object({
  name: z.string(),
  acquiredAt: z.string(),
});

const skillSummarySchema: z.ZodType<ResumeSkillSummary> = z.object({
  os: z.array(skillItemSchema),
  languages: z.array(skillItemSchema),
  frameworks: z.array(skillItemSchema),
  databases: z.array(skillItemSchema),
  others: z.array(skillItemSchema),
});

const profileSchema: z.ZodType<ResumeProfile> = z.object({
  name: z.object({
    familyName: z.string(),
    givenName: z.string(),
    familyNameKana: z.string(),
    givenNameKana: z.string(),
  }),
  gender: z.string(),
  nationality: z.string(),
  nearestStation: z.string(),
  specialtiesText: z.string(),
  skillSummary: skillSummarySchema,
  selfPr: z.string(),
});

const resumeSchema: z.ZodType<ResumeInput> = z.object({
  profile: profileSchema,
  qualifications: z.array(qualificationSchema),
  projects: z.array(projectSchema),
});

export function validateResume(input: unknown): ResumeInput {
  return resumeSchema.parse(input);
}
