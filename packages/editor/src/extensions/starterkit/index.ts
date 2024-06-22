import { AnyExtension } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Codeblock from '@tiptap/extension-code-block';
import DropCursor from '@tiptap/extension-dropcursor';
import GapCursor from '@tiptap/extension-gapcursor';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Focus from '@tiptap/extension-focus';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
// import History from '@tiptap/extension-history';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';

import { Document } from '../doc';
import { DBlock } from '../draggable';
import { Paragraph } from '../paragraph';
import { Prompt } from '../prompt';
import { SlashMenuExtension, suggestions } from '../slashmenu';
import { Link } from '../link';
// import { TrailingNode } from './trailingNode';

interface GetExtensionsProps {
  openLinkModal: () => void;
}

export const getExtensions = (): AnyExtension[] => {
  return [
    Document,
    DBlock,
    Paragraph,
    Text,
    DropCursor.configure({
      width: 2,
      class: 'figai-dropcursor',
      color: 'skyblue',
    }),
    GapCursor,
    // History,
    HardBreak,

    // marks
    Bold,
    Italic,
    Underline,
    Link.configure({
      autolink: true,
      linkOnPaste: true,
      protocols: ['mailto'],
      openOnClick: false,
    }),
    Heading.configure({
      levels: [1, 2, 3],
    }),
    Blockquote,
    Codeblock,
    ListItem,
    BulletList,
    OrderedList,
    TaskItem,
    TaskList,

    Focus.configure({
      mode: 'shallowest',
    }),

    //custom
    SlashMenuExtension.configure({ suggestions }),
    Placeholder.configure({
      placeholder: ({ editor }) => {
        const {
          selection: { $head },
        } = editor.state;
        const parent = $head.node($head.depth - 1);

        if (parent?.type.name === 'prompt') {
          return 'Type your prompt here.';
        }

        return 'Type `/` for commands';
      },
      includeChildren: true,
    }),
    Prompt,
    // TrailingNode,
  ];
};
