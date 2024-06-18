/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Icons } from '@superscale/ui/icons';
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';

export function DBlockNodeView({ node, getPos, editor }: NodeViewProps) {
  const createNodeAfter = () => {
    const pos = getPos() + node.nodeSize;

    editor.commands.insertContentAt(pos, {
      type: 'dBlock',
      content: [
        {
          type: 'paragraph',
        },
      ],
    });
  };

  return (
    <NodeViewWrapper as="div" className="group relative flex w-full gap-2">
      <section
        className="mt-2 flex gap-1 pt-[2px]"
        aria-label="left-menu"
        contentEditable={false}
      >
        <button
          type="button"
          className="d-block-button group-hover:opacity-100"
          onClick={createNodeAfter}
        >
          <i className="i-mdi-plus" />
        </button>
        <div
          className="d-block-button group-hover:opacity-100"
          contentEditable={false}
          draggable
          data-drag-handle
        >
          <Icons.draggable />
        </div>
      </section>

      <NodeViewContent className="node-view-content w-full" />
    </NodeViewWrapper>
  );
}
