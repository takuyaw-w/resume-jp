import { inject, type InjectionKey, provide } from "vue";
import type { EditorState } from "./createEditorState.ts";

const editorStateKey: InjectionKey<EditorState> = Symbol("editor-state");

export function provideEditorState(editor: EditorState) {
  provide(editorStateKey, editor);
}

export function useEditorState(): EditorState {
  const editor = inject(editorStateKey);

  if (!editor) {
    throw new Error("EditorState is not provided.");
  }

  return editor;
}
