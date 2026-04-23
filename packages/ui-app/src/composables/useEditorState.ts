import { computed, reactive, ref } from "vue";
import { exportPdf, loadDraft, saveDraft } from "../mockApi";
import type { ResumeDraft, ResumeProject, ResumeSkillItem } from "../types";

function createEmptySkill(): ResumeSkillItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    experienceText: "",
    level: "",
  };
}

function createEmptyProject(): ResumeProject {
  return {
    id: crypto.randomUUID(),
    name: "",
    startDate: "",
    endDate: "",
    role: "",
    teamSize: "",
    description: "",
    languages: [],
  };
}

const draft = reactive<ResumeDraft>({
  basic: {
    fullName: "",
    fullNameKana: "",
    birthDate: "",
    nearestStation: "",
    specialtiesText: "",
  },
  skillSummary: [],
  projects: [],
});

const isInitialized = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const isExporting = ref(false);
const selectedProjectId = ref<string | null>(null);
const lastSavedAt = ref<string>("");

const selectedProject = computed(() => {
  return draft.projects.find((project) =>
    project.id === selectedProjectId.value
  ) ?? null;
});

const hasProjects = computed(() => draft.projects.length > 0);

async function init() {
  if (isInitialized.value) return;

  isLoading.value = true;

  try {
    const loaded = await loadDraft();

    draft.basic = loaded.basic;
    draft.skillSummary = loaded.skillSummary;
    draft.projects = loaded.projects;

    if (loaded.projects.length > 0) {
      selectedProjectId.value = loaded.projects[0].id;
    }

    isInitialized.value = true;
  } finally {
    isLoading.value = false;
  }
}

function addSkill() {
  draft.skillSummary.push(createEmptySkill());
}

function removeSkill(id: string) {
  const index = draft.skillSummary.findIndex((skill) => skill.id === id);
  if (index >= 0) {
    draft.skillSummary.splice(index, 1);
  }
}

function moveSkillUp(id: string) {
  const index = draft.skillSummary.findIndex((skill) => skill.id === id);
  if (index <= 0) return;

  const current = draft.skillSummary[index];
  draft.skillSummary[index] = draft.skillSummary[index - 1];
  draft.skillSummary[index - 1] = current;
}

function moveSkillDown(id: string) {
  const index = draft.skillSummary.findIndex((skill) => skill.id === id);
  if (index < 0 || index >= draft.skillSummary.length - 1) return;

  const current = draft.skillSummary[index];
  draft.skillSummary[index] = draft.skillSummary[index + 1];
  draft.skillSummary[index + 1] = current;
}

function addProject() {
  const project = createEmptyProject();
  draft.projects.push(project);
  selectedProjectId.value = project.id;
}

function removeProject(id: string) {
  const index = draft.projects.findIndex((project) => project.id === id);
  if (index < 0) return;

  draft.projects.splice(index, 1);

  if (selectedProjectId.value === id) {
    selectedProjectId.value = draft.projects[0]?.id ?? null;
  }
}

function moveProjectUp(id: string) {
  const index = draft.projects.findIndex((project) => project.id === id);
  if (index <= 0) return;

  const current = draft.projects[index];
  draft.projects[index] = draft.projects[index - 1];
  draft.projects[index - 1] = current;
}

function moveProjectDown(id: string) {
  const index = draft.projects.findIndex((project) => project.id === id);
  if (index < 0 || index >= draft.projects.length - 1) return;

  const current = draft.projects[index];
  draft.projects[index] = draft.projects[index + 1];
  draft.projects[index + 1] = current;
}

function selectProject(id: string) {
  selectedProjectId.value = id;
}

function setProjectLanguagesFromText(projectId: string, value: string) {
  const project = draft.projects.find((item) => item.id === projectId);
  if (!project) return;

  project.languages = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProjectLanguagesText(projectId: string): string {
  const project = draft.projects.find((item) => item.id === projectId);
  return project?.languages.join(", ") ?? "";
}

async function save() {
  isSaving.value = true;

  try {
    await saveDraft(draft);
    lastSavedAt.value = new Date().toLocaleString("ja-JP");
  } finally {
    isSaving.value = false;
  }
}

async function exportCurrentPdf() {
  isExporting.value = true;

  try {
    await exportPdf(draft);
  } finally {
    isExporting.value = false;
  }
}

export function useEditorState() {
  return {
    draft,
    isInitialized,
    isLoading,
    isSaving,
    isExporting,
    selectedProjectId,
    selectedProject,
    hasProjects,
    lastSavedAt,
    init,
    addSkill,
    removeSkill,
    moveSkillUp,
    moveSkillDown,
    addProject,
    removeProject,
    moveProjectUp,
    moveProjectDown,
    selectProject,
    setProjectLanguagesFromText,
    getProjectLanguagesText,
    save,
    exportCurrentPdf,
  };
}
