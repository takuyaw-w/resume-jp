<script setup lang="ts">
import { computed } from 'vue'
import { useEditorState } from "../composables/editorContext.ts";
import type { SkillCategoryKey } from "../composables/createEditorState.ts";
import { skillOptionsByCategory } from '../lib/skillOptions.ts'
const editor = useEditorState();

const selectedSkillCategory = editor.selectedSkillCategory;
const currentSkillList = editor.currentSkillList;

const categories: Array<{ key: SkillCategoryKey; label: string }> = [
  { key: "os", label: "OS" },
  { key: "languages", label: "言語" },
  { key: "frameworks", label: "FW" },
  { key: "databases", label: "DB" },
  { key: "others", label: "その他" },
];

const levelItems = ["初級", "中級", "上級", "実務経験あり", "指導可能"];

const currentSkillNameOptions = computed(() => {
  return skillOptionsByCategory[selectedSkillCategory.value];
});
</script>

<template>
  <v-card rounded="lg">
    <v-card-title>スキル</v-card-title>

    <v-tabs v-model="selectedSkillCategory" grow>
      <v-tab v-for="category in categories" :key="category.key" :value="category.key">
        {{ category.label }}
      </v-tab>
    </v-tabs>

    <v-divider />

    <v-card-text>
      <div class="d-flex justify-end mb-4">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="editor.addSkill(selectedSkillCategory)">
          追加
        </v-btn>
      </div>

      <v-alert v-if="currentSkillList.length === 0" type="info" variant="tonal" class="mb-4">
        このカテゴリのスキルはまだありません。
      </v-alert>

      <v-card v-for="(skill, index) in currentSkillList" :key="index" class="mb-4" variant="outlined" rounded="lg">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="5">
              <v-combobox v-model="skill.name" :items="currentSkillNameOptions" label="スキル名" clearable hide-no-data />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="skill.experienceText" label="経験年数" />
            </v-col>

            <v-col cols="12" md="3">
              <v-select v-model="skill.level" :items="levelItems" label="レベル" clearable />
            </v-col>
          </v-row>

          <div class="d-flex ga-2">
            <v-btn variant="text" prepend-icon="mdi-arrow-up" :disabled="index === 0"
              @click="editor.moveSkill(selectedSkillCategory, index, -1)">
              上へ
            </v-btn>

            <v-btn variant="text" prepend-icon="mdi-arrow-down" :disabled="index === currentSkillList.length - 1"
              @click="editor.moveSkill(selectedSkillCategory, index, 1)">
              下へ
            </v-btn>

            <v-spacer />

            <v-btn color="error" variant="text" prepend-icon="mdi-delete-outline"
              @click="editor.removeSkill(selectedSkillCategory, index)">
              削除
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>
