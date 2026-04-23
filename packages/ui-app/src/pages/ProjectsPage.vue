<script setup lang="ts">
import { computed } from "vue";
import { useEditorState } from "../composables/editorContext.ts";
import { techStackOptions } from '../lib/skillOptions.ts'
const editor = useEditorState();

const draft = editor.draft;
const selectedProject = editor.selectedProject;
const selectedProjectIndex = editor.selectedProjectIndex;

const roleItems = [
  { title: "メンバー", value: "メンバー" },
  { title: "リーダー", value: "リーダー" },
] as const;

const phaseGroups = [
  {
    title: "上流",
    items: [
      { key: "requirementAnalysis", label: "要件分析" },
      { key: "requirementsDefinition", label: "要件定義" },
      { key: "basicDesign", label: "基本設計" },
      { key: "detailDesign", label: "詳細設計" },
    ],
  },
  {
    title: "開発・試験",
    items: [
      { key: "implementation", label: "実装" },
      { key: "unitTest", label: "単体テスト" },
      { key: "integrationTest", label: "結合テスト" },
      { key: "systemTest", label: "総合テスト" },
      { key: "acceptanceTest", label: "受入テスト" },
    ],
  },
  {
    title: "リリース・運用",
    items: [
      { key: "release", label: "リリース" },
      { key: "operationMaintenance", label: "運用保守" },
    ],
  },
] as const;

const canMoveProjectUp = computed(() => {
  return selectedProjectIndex.value !== null && selectedProjectIndex.value > 0;
});

const canMoveProjectDown = computed(() => {
  return selectedProjectIndex.value !== null &&
    selectedProjectIndex.value < draft.projects.length - 1;
});

const canDeleteProject = computed(() => {
  return selectedProjectIndex.value !== null;
});

function moveSelectedProjectUp() {
  if (selectedProjectIndex.value === null) return;
  editor.moveProject(selectedProjectIndex.value, -1);
}

function moveSelectedProjectDown() {
  if (selectedProjectIndex.value === null) return;
  editor.moveProject(selectedProjectIndex.value, 1);
}

function removeSelectedProject() {
  if (selectedProjectIndex.value === null) return;
  editor.removeProject(selectedProjectIndex.value);
}
</script>

<template>
  <v-row>
    <v-col cols="12" lg="8" class="order-2 order-lg-1">
      <v-alert v-if="!selectedProject" type="info" variant="tonal" rounded="lg">
        プロジェクトを選択してください。
      </v-alert>

      <v-card v-else rounded="lg">
        <div class="d-flex align-center justify-space-between px-4 pt-4 pb-2">
          <div>
            <div class="text-h6">プロジェクト詳細</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              選択中プロジェクトの内容を編集します。
            </div>
          </div>
        </div>

        <v-divider />

        <v-card-text class="pt-5">
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="selectedProject.projectName" label="案件名" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="selectedProject.period.from" label="開始年月" placeholder="2024/04" hint="YYYY/MM"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="selectedProject.period.to" label="終了年月" placeholder="2025/03" hint="YYYY/MM"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="selectedProject.role" :items="roleItems" item-title="title" item-value="value"
                label="役割" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="selectedProject.overview" label="概要" rows="4" auto-grow />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium mb-2">技術スタック</div>
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.languages" :items="techStackOptions.languages"
                label="Languages" multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.serverOs" :items="techStackOptions.serverOs"
                label="Server OS" multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.databases" :items="techStackOptions.databases"
                label="Server OS" multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.frameworks" :items="techStackOptions.frameworks"
                label="Server OS" multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.tools" :items="techStackOptions.tools" label="Server OS"
                multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可" persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedProject.techStack.others" :items="techStackOptions.others" label="Server OS"
                multiple chips closable-chips clearable hide-selected hint="候補から選択。ないものはそのまま入力可" persistent-hint />
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium mb-3">工程</div>

              <v-row>
                <v-col v-for="group in phaseGroups" :key="group.title" cols="12" md="4">
                  <v-sheet rounded="lg" variant="tonal" class="pa-4 h-100">
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      {{ group.title }}
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip v-for="phase in group.items" :key="phase.key"
                        :color="selectedProject.phases[phase.key] ? 'primary' : undefined"
                        :variant="selectedProject.phases[phase.key] ? 'flat' : 'outlined'" size="large"
                        class="cursor-pointer"
                        @click="selectedProject.phases[phase.key] = !selectedProject.phases[phase.key]">
                        <template #prepend>
                          <v-icon size="18" :icon="selectedProject.phases[phase.key]
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'" />
                        </template>

                        {{ phase.label }}
                      </v-chip>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4" class="order-1 order-lg-2">
      <v-card rounded="lg">
        <div class="d-flex align-center justify-space-between px-4 pt-4 pb-2">
          <div class="text-h6">プロジェクト一覧</div>

          <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="editor.addProject">
            追加
          </v-btn>
        </div>

        <div class="d-flex align-center ga-2 px-4 pb-3">
          <v-btn size="small" variant="text" prepend-icon="mdi-arrow-up" :disabled="!canMoveProjectUp"
            @click="moveSelectedProjectUp">
            上へ
          </v-btn>

          <v-btn size="small" variant="text" prepend-icon="mdi-arrow-down" :disabled="!canMoveProjectDown"
            @click="moveSelectedProjectDown">
            下へ
          </v-btn>

          <v-spacer />

          <v-btn size="small" color="error" variant="text" prepend-icon="mdi-delete-outline"
            :disabled="!canDeleteProject" @click="removeSelectedProject">
            削除
          </v-btn>
        </div>

        <v-divider />

        <v-alert v-if="draft.projects.length === 0" type="info" variant="tonal" class="ma-4">
          プロジェクトがまだありません。
        </v-alert>

        <v-list v-else lines="two" class="py-0">
          <v-list-item v-for="(project, index) in draft.projects" :key="index" :title="project.projectName || '名称未入力'"
            :subtitle="`${project.period.from || '----'} 〜 ${project.period.to || '----'}`"
            :active="selectedProjectIndex === index" @click="editor.selectProject(index)" />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>
