<script setup lang="ts">
import { useEditorState } from "../composables/editorContext.ts";

const editor = useEditorState();
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card rounded="lg">
        <v-card-title>基本情報</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="editor.draft.profile.name.familyName" label="姓" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="editor.draft.profile.name.givenName" label="名" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="editor.draft.profile.name.familyNameKana" label="セイ" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="editor.draft.profile.name.givenNameKana" label="メイ" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="editor.draft.profile.gender" label="性別" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="editor.draft.profile.nationality" label="国籍" />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field v-model="editor.draft.profile.nearestStation" label="最寄駅" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="editor.draft.profile.specialtiesText" label="得意分野" rows="5" auto-grow />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="editor.draft.profile.selfPr" label="自己PR" rows="5" auto-grow />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card rounded="lg" class="mt-6">
        <div class="d-flex align-center justify-space-between px-4 py-3">
          <div class="text-h6">資格</div>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="editor.addQualification">
            追加
          </v-btn>
        </div>

        <v-card-text>
          <v-alert v-if="editor.draft.qualifications.length === 0" type="info" variant="tonal">
            資格がまだありません。
          </v-alert>

          <v-card v-for="(qualification, index) in editor.draft.qualifications" :key="index" class="mb-4"
            variant="outlined" rounded="lg">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field v-model="qualification.name" label="資格名" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="qualification.acquiredAt" label="取得年月" />
                </v-col>
              </v-row>

              <div class="d-flex ga-2">
                <v-btn variant="text" prepend-icon="mdi-arrow-up" :disabled="index === 0"
                  @click="editor.moveQualification(index, -1)">
                  上へ
                </v-btn>

                <v-btn variant="text" prepend-icon="mdi-arrow-down"
                  :disabled="index === editor.draft.qualifications.length - 1"
                  @click="editor.moveQualification(index, 1)">
                  下へ
                </v-btn>

                <v-spacer />

                <v-btn color="error" variant="text" prepend-icon="mdi-delete-outline"
                  @click="editor.removeQualification(index)">
                  削除
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
