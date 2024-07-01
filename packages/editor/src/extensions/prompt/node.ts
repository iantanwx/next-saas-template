import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PLUGIN_PRIORITY } from '../../constants';
import { PromptView } from './view';
import { generateRandomName } from '@superscale/lib/utils/random-name';

export const Prompt = Node.create({
  name: 'prompt',
  group: 'dBlock',
  content: '(block|list)+',
  draggable: true,
  selectable: false,
  inline: false,
  priority: PLUGIN_PRIORITY.PROMPT,
  addAttributes() {
    return {
      'data-prompt-id': {
        default: generateRandomName(),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(PromptView);
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { doc, selection } = state;
        const { $head, from, $from, to, empty } = selection;
        const parent = $head.node($head.depth - 1);

        // If we're not in an empty node, it means we shouldn't exit the Prompt block
        // > some_<cursor>text
        // --> text desired here
        // \n
        // \n
        if (!empty || parent?.type !== this.type) return false;

        let nextNodeTo = -1;

        const isAtEnd =
          parent.maybeChild(parent.childCount - 1) === $from.parent;

        let textContent = '';
        parent.forEach((node) => {
          if (!node.textContent) {
            // treat empty nodes as newlines
            textContent += '\n';
          } else {
            textContent += node.textContent;
          }
          return false;
        });
        const endsWithDoubleNewline = textContent.endsWith('\n\n');

        if (!isAtEnd || !endsWithDoubleNewline || parent.childCount <= 2) {
          return false;
        }

        doc.descendants((node, pos) => {
          if (nextNodeTo !== -1) return false;
          if (node.type.name === this.name) return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          if (nodeFrom <= from && to <= nodeTo) nextNodeTo = nodeTo;

          return false;
        });

        let offset: number = 0;
        parent.content.forEach((node, _, index) => {
          // offset two from the end of the Fragment.
          if (index >= parent.childCount - 2) {
            offset += node.nodeSize;
          }
          return false;
        });

        const content = doc.slice(from, nextNodeTo)?.toJSON()?.content ?? [
          {
            type: 'paragraph',
          },
        ];

        return editor
          .chain()
          .command(({ tr }) => {
            // remove the newlines
            tr.delete($from.pos - offset, $from.pos);
            return true;
          })
          .insertContentAt(
            { from: $from.pos - offset, to: nextNodeTo - offset },
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
