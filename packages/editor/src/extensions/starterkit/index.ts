import { AnyExtension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import DropCursor from '@tiptap/extension-dropcursor';
import GapCursor from '@tiptap/extension-gapcursor';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
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
    // Necessary
    Document,
    DBlock,
    Paragraph,
    Text,
    DropCursor.configure({
      width: 2,
      class: 'notitap-dropcursor',
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

    // Node
    ListItem,
    BulletList,
    OrderedList,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    SlashMenuExtension.configure({ suggestions }),
    Placeholder.configure({
      placeholder: 'Type `/` for commands',
      includeChildren: true,
    }),
    // TrailingNode,
  ];
};
