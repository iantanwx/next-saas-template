import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { NODE_SIZES, PLUGIN_PRIORITY } from '../../constants';
import { DBlockNodeView } from './view';

export interface DBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dBlock: {
      /**
       * Toggle a dBlock
       */
      setDBlock: (position?: number) => ReturnType;
    };
  }
}

export const DBlock = Node.create<DBlockOptions>({
  name: 'dBlock',

  priority: PLUGIN_PRIORITY.DRAGGABLE,

  group: 'dBlock',

  content: '(block|list)+',

  draggable: true,

  selectable: false,

  inline: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="d-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'd-block' }),
      0,
    ];
  },

  addCommands() {
    return {
      setDBlock:
        (position) =>
        ({ state, chain }) => {
          const {
            selection: { from },
          } = state;

          const pos =
            position !== undefined || position !== null ? from : position;

          return chain()
            .insertContentAt(pos, {
              type: this.name,
              content: [
                {
                  type: 'paragraph',
                },
              ],
            })
            .focus(pos + 2)
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(DBlockNodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setDBlock(),
      Enter: ({ editor }) => {
        const {
          selection: { $head, from, to },
          doc,
        } = editor.state;

        const parent = $head.node($head.depth - 1);
        const isEmptyListItem =
          parent &&
          parent.type.name === 'listItem' &&
          parent.content.textBetween(0, parent.content.size).length === 0;
        if (parent?.type.name !== 'dBlock' && !isEmptyListItem) return false;

        let currentActiveNodeTo = -1;

        doc.descendants((node, pos) => {
          if (currentActiveNodeTo !== -1) return false;
          // eslint-disable-next-line consistent-return
          if (node.type.name === this.name) return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          if (nodeFrom <= from && to <= nodeTo) currentActiveNodeTo = nodeTo;

          return false;
        });

        if (isEmptyListItem) {
          return editor
            .chain()
            .toggleBulletList()
            .insertContentAt(
              { from, to: from },
              {
                type: 'dBlock',
                content: [{ type: 'paragraph' }],
              }
            )
            .focus(from + NODE_SIZES.PARAGRAPH)
            .run();
        }

        const content = isEmptyListItem
          ? [{ type: 'paragraph' }]
          : doc.slice(from, currentActiveNodeTo)?.toJSON().content;

        return editor
          .chain()
          .insertContentAt(
            { from, to: currentActiveNodeTo },
            {
              type: this.name,
              content,
            }
          )
          .focus(from + 4)
          .run();
      },
    };
  },
});
