export type ResumeRole = "メンバー" | "リーダー";

export type ResumePhases = {
  requirementAnalysis: boolean;
  requirementsDefinition: boolean;
  basicDesign: boolean;
  detailDesign: boolean;
  implementation: boolean;
  unitTest: boolean;
  integrationTest: boolean;
  systemTest: boolean;
  acceptanceTest: boolean;
  release: boolean;
  operationMaintenance: boolean;
};

export type ResumeTechStack = {
  languages: string[];
  serverOs: string[];
  databases: string[];
  frameworks: string[];
  tools: string[];
  others: string[];
};

export type ResumeProject = {
  period: {
    from: string;
    to: string;
  };
  projectName: string;
  overview: string;
  role: ResumeRole;
  techStack: ResumeTechStack;
  phases: ResumePhases;
};

export type ResumeQualification = {
  name: string;
  acquiredAt: string;
};

export type SkillLevel =
  | "初級"
  | "中級"
  | "上級"
  | "実務経験あり"
  | "指導可能";

export type ResumeSkillItem = {
  name: string;
  experienceText?: string;
  level?: SkillLevel;
};

export type ResumeSkillSummary = {
  os: ResumeSkillItem[];
  languages: ResumeSkillItem[];
  frameworks: ResumeSkillItem[];
  databases: ResumeSkillItem[];
  others: ResumeSkillItem[];
};

export type ResumeProfileName = {
  familyName: string;
  givenName: string;
  familyNameKana: string;
  givenNameKana: string;
};

export type ResumeProfile = {
  name: ResumeProfileName;
  gender: string;
  nationality: string;
  nearestStation: string;
  specialtiesText: string;
  skillSummary: ResumeSkillSummary;
  selfPr: string;
};

export type ResumeInput = {
  profile: ResumeProfile;
  qualifications: ResumeQualification[];
  projects: ResumeProject[];
};
