import { computed, reactive, ref } from "vue";
import type {
  ResumeInput,
  ResumeProject,
  ResumeQualification,
  ResumeSkillItem,
  ResumeSkillSummary,
  ResumeTechStack,
} from "@resume/types";
import type { UiApi } from "../clients/uiApi.ts";

export type SkillCategoryKey = keyof ResumeSkillSummary;
export type TechStackKey = keyof ResumeTechStack;
export type EditorState = ReturnType<typeof createEditorState>;

const skillCategoryOrder: SkillCategoryKey[] = [
  "os",
  "languages",
  "frameworks",
  "databases",
  "others",
];

function createEmptyResumeInput(): ResumeInput {
  return {
    profile: {
      name: {
        familyName: "",
        givenName: "",
        familyNameKana: "",
        givenNameKana: "",
      },
      gender: "",
      nationality: "",
      nearestStation: "",
      specialtiesText: "",
      skillSummary: {
        os: [],
        languages: [],
        frameworks: [],
        databases: [],
        others: [],
      },
      selfPr: "",
    },
    qualifications: [],
    projects: [],
  };
}

function createEmptyQualification(): ResumeQualification {
  return {
    name: "",
    acquiredAt: "",
  };
}

function createEmptySkillItem(): ResumeSkillItem {
  return {
    name: "",
    experienceText: "",
    level: undefined,
  };
}

function createEmptyProject(): ResumeProject {
  return {
    period: {
      from: "",
      to: "",
    },
    projectName: "",
    overview: "",
    role: "member",
    techStack: {
      languages: [],
      serverOs: [],
      databases: [],
      frameworks: [],
      tools: [],
      others: [],
    },
    phases: {
      requirementAnalysis: false,
      requirementsDefinition: false,
      basicDesign: false,
      detailDesign: false,
      implementation: false,
      unitTest: false,
      integrationTest: false,
      systemTest: false,
      acceptanceTest: false,
      release: false,
      operationMaintenance: false,
    },
  };
}

function moveItem<T>(array: T[], from: number, to: number) {
  if (from < 0 || from >= array.length) return;
  if (to < 0 || to >= array.length) return;

  const [item] = array.splice(from, 1);
  array.splice(to, 0, item);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEditorState(api: UiApi) {
  const draft = reactive<ResumeInput>(createEmptyResumeInput());

  const isInitialized = ref(false);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");

  const selectedSkillCategory = ref<SkillCategoryKey>("languages");
  const selectedProjectIndex = ref<number | null>(null);

  const selectedProject = computed(() => {
    if (selectedProjectIndex.value === null) return null;
    return draft.projects[selectedProjectIndex.value] ?? null;
  });

  const currentSkillList = computed(() => {
    return draft.profile.skillSummary[selectedSkillCategory.value];
  });

  async function init() {
    if (isInitialized.value) return;

    isLoading.value = true;
    errorMessage.value = "";

    try {
      const loaded = await api.loadDocument();
      Object.assign(draft, cloneJson(loaded));

      if (draft.projects.length > 0) {
        selectedProjectIndex.value = 0;
      }

      isInitialized.value = true;
    } catch (error) {
      errorMessage.value = error instanceof Error
        ? error.message
        : "初期読み込みに失敗しました。";
    } finally {
      isLoading.value = false;
    }
  }

  async function save() {
    isSaving.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const snapshot = cloneJson(draft);
      const result = await api.saveDocument(snapshot);
      successMessage.value = `保存しました: ${result.path}`;
    } catch (error) {
      errorMessage.value = error instanceof Error
        ? error.message
        : "保存に失敗しました。";
    } finally {
      isSaving.value = false;
    }
  }

  function addQualification() {
    draft.qualifications.push(createEmptyQualification());
  }

  function removeQualification(index: number) {
    draft.qualifications.splice(index, 1);
  }

  function moveQualification(index: number, delta: number) {
    moveItem(draft.qualifications, index, index + delta);
  }

  function addSkill(category: SkillCategoryKey) {
    draft.profile.skillSummary[category].push(createEmptySkillItem());
  }

  function removeSkill(category: SkillCategoryKey, index: number) {
    draft.profile.skillSummary[category].splice(index, 1);
  }

  function moveSkill(category: SkillCategoryKey, index: number, delta: number) {
    moveItem(draft.profile.skillSummary[category], index, index + delta);
  }

  function addProject() {
    draft.projects.push(createEmptyProject());
    selectedProjectIndex.value = draft.projects.length - 1;
  }

  function removeProject(index: number) {
    draft.projects.splice(index, 1);

    if (draft.projects.length === 0) {
      selectedProjectIndex.value = null;
      return;
    }

    if (selectedProjectIndex.value === null) return;
    if (selectedProjectIndex.value >= draft.projects.length) {
      selectedProjectIndex.value = draft.projects.length - 1;
    }
  }

  function moveProject(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= draft.projects.length) return;

    moveItem(draft.projects, index, to);

    if (selectedProjectIndex.value === index) {
      selectedProjectIndex.value = to;
    } else if (selectedProjectIndex.value === to) {
      selectedProjectIndex.value = index;
    }
  }

  function selectProject(index: number) {
    selectedProjectIndex.value = index;
  }

  function getSelectedProjectTechStackText(key: TechStackKey): string {
    return selectedProject.value?.techStack[key].join(", ") ?? "";
  }

  function setSelectedProjectTechStackText(key: TechStackKey, value: string) {
    if (!selectedProject.value) return;

    selectedProject.value.techStack[key] = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return {
    draft,
    isInitialized,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    selectedSkillCategory,
    selectedProjectIndex,
    selectedProject,
    currentSkillList,
    skillCategoryOrder,
    init,
    save,
    addQualification,
    removeQualification,
    moveQualification,
    addSkill,
    removeSkill,
    moveSkill,
    addProject,
    removeProject,
    moveProject,
    selectProject,
    getSelectedProjectTechStackText,
    setSelectedProjectTechStackText,
  };
}
