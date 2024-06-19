import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PLUGIN_PRIORITY } from '../../constants';
import { PromptView } from './view';

export const Prompt = Node.create({
  name: 'prompt',
  group: 'dBlock',
  content: 'block',
  draggable: true,
  selectable: false,
  inline: false,
  priority: PLUGIN_PRIORITY.PROMPT,
  renderHTML({ HTMLAttributes }) {
    return ['prompt-view', mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PromptView);
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const {
          doc,
          selection: { $head, from, to },
        } = editor.state;
        let nextNodeTo = -1;
        const parent = $head.node($head.depth - 1);

        if (parent?.type.name !== 'prompt') return false;

        doc.descendants((node, pos) => {
          if (nextNodeTo !== -1) return false;
          if (node.type.name === this.name) return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          if (nodeFrom <= from && to <= nodeTo) nextNodeTo = nodeTo;

          return false;
        });

        const content = doc.slice(from, nextNodeTo)?.toJSON()?.content ?? [
          {
            type: 'paragraph',
          },
        ];
        return editor
          .chain()
          .insertContentAt(
            { from, to: nextNodeTo },
            {
              type: 'dBlock',
              content,
            }
          )
          .focus(from + 4)
          .run();
      },
    };
  },
});
