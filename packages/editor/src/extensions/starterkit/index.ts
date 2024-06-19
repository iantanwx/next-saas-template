import { AnyExtension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import DropCursor from '@tiptap/extension-dropcursor';
import GapCursor from '@tiptap/extension-gapcursor';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Blockquote from '@tiptap/extension-blockquote';
import Codeblock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
// import History from '@tiptap/extension-history';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';

import { Document } from '../doc';
import { DBlock } from '../draggable';
import { Paragraph } from '../paragraph';
import { SlashMenuExtension, suggestions } from '../slashmenu';
// import { TrailingNode } from './trailingNode';

interface GetExtensionsProps {
  openLinkModal: () => void;
}

export const getExtensions = ({
  openLinkModal,
}: GetExtensionsProps): AnyExtension[] => {
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
    // Link.configure({
    //   autolink: true,
    //   linkOnPaste: true,
    //   protocols: ['mailto'],
    //   openOnClick: false,
    //   onModKPressed: openLinkModal,
    // }),

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

    SlashMenuExtension.configure({ suggestions }),
    Placeholder.configure({
      placeholder: 'Type `/` for commands',
      includeChildren: true,
    }),
    // TrailingNode,
  ];
};
