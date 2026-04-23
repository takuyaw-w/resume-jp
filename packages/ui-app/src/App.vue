<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { createHttpUiApi } from "./clients/httpUiApi.ts";
// import { createMockUiApi } from "./clients/mockUiApi.ts"
import { createEditorState } from "./composables/createEditorState.ts";
import { provideEditorState } from "./composables/editorContext.ts";

const route = useRoute();
const api = createHttpUiApi();
const editor = createEditorState(api);

provideEditorState(editor);

const isSaving = editor.isSaving;
const errorMessage = editor.errorMessage;
const successMessage = editor.successMessage;

const navItems = [
  { title: "基本情報", to: "/basic", icon: "mdi-card-account-details-outline" },
  { title: "スキル", to: "/skills", icon: "mdi-star-outline" },
  { title: "プロジェクト", to: "/projects", icon: "mdi-briefcase-outline" },
];

const currentTitle = computed(() => {
  return navItems.find((item) => item.to === route.path)?.title ?? "resume-jp ui";
});

onMounted(() => {
  void editor.init();
});
</script>
<template>
  <v-app>
    <v-app-bar elevation="1">
      <v-app-bar-title>resume-jp ui</v-app-bar-title>

      <template #append>
        <div class="d-flex align-center ga-2 pr-4">
          <v-btn prepend-icon="mdi-content-save-outline" :loading="isSaving" @click="editor.save">
            保存
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer permanent width="240">
      <v-list nav density="comfortable">
        <v-list-item v-for="item in navItems" :key="item.to" :to="item.to" :prepend-icon="item.icon" :title="item.title"
          rounded="lg" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-6">
        <div class="mb-6">
          <h1 class="text-h5 font-weight-bold">{{ currentTitle }}</h1>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>

        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
