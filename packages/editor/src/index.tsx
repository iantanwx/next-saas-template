'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Provider } from 'jotai';
import { LinkModal } from './extensions/link/modal';
import { getExtensions } from './extensions/starterkit';
import { store } from './store';
import './styles/placeholder.css';

export function Editor() {
  const editor = useEditor({
    extensions: getExtensions(),
    editable: true,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert p-5 focus:outline-none w-full prose-p:my-2 prose-h1:my-2 prose-h2:my-2 prose-h3:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none',
      },
    },
  });

  return (
    <Provider store={store}>
      <EditorContent className="h-full w-full flex-row" editor={editor} />
      <LinkModal editor={editor} />
    </Provider>
  );
}
