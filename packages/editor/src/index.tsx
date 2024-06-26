'use client';

import { TooltipProvider } from '@superscale/ui/atoms/tooltip';
import { EditorContent, useEditor } from '@tiptap/react';
import { Provider } from 'jotai';
import { LinkBubbleMenu, LinkModal } from './extensions/link';
import { getExtensions } from './extensions/starterkit';
import { store } from './store';
import { BubbleMenu } from './extensions/bubble-menu';
import './styles/placeholder.css';
import './styles/list.css';

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
      <TooltipProvider>
        <EditorContent className="h-full w-full flex-row" editor={editor} />
        <LinkModal editor={editor} />
        <LinkBubbleMenu editor={editor} />
        <BubbleMenu editor={editor} />
      </TooltipProvider>
    </Provider>
  );
}
