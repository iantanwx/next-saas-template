import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

export const SlashMenuExtension = Extension.create({
  name: 'slashmenu',
  addOptions() {
    return {
      suggestions: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestions,
      }),
    ];
  },
});
