import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PLUGIN_PRIORITY } from '../../constants';

export const SlashMenuExtension = Extension.create({
  name: 'slashmenu',
  priority: PLUGIN_PRIORITY.SLASH_MENU,
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
