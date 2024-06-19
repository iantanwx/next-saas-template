'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { getExtensions } from './extensions/starterkit';
import './styles/placeholder.css';

export function Editor() {
  const editor = useEditor({
    extensions: getExtensions({ openLinkModal: () => null }),
    editable: true,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert m-5 focus:outline-none w-full prose-p:my-2 prose-h1:my-2 prose-h2:my-2 prose-h3:my-2 prose-ul:my-2 prose-ol:my-2',
      },
    },
  });

  return (
    <>
      <EditorContent className="h-full w-full" editor={editor} />
    </>
  );
}
