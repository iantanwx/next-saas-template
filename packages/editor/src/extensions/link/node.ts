import _Link from '@tiptap/extension-link';
import { atom } from 'jotai';
import { store } from '../../store';

export const Link = _Link.extend({
  exitable: true,
  addKeyboardShortcuts() {
    return {
      'Mod-k': ({ editor }) => {
        const { selection } = editor.state;
        if (selection.empty) return false;
        store.set(modalOpenAtom, true);
        return true;
      },
    };
  },
});

export const modalOpenAtom = atom(false);
