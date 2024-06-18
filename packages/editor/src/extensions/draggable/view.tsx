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
    <NodeViewWrapper
      as="div"
      className="group relative flex w-full flex-row gap-2"
    >
      <section
        className="mt-2 flex flex-row gap-1 pt-[2px]"
        aria-label="left-menu"
        contentEditable={false}
      >
        <button
          type="button"
          className="flex cursor-pointer justify-center rounded border-none bg-transparent p-0.5 opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100"
          onClick={createNodeAfter}
        >
          <Icons.add size={18} />
        </button>
        <div
          className="flex cursor-grab justify-center rounded border-none bg-transparent p-0.5 opacity-0 transition-all duration-200 ease-in-out hover:cursor-grabbing group-hover:opacity-100"
          contentEditable={false}
          draggable
          data-drag-handle
        >
          <Icons.draggable size={18} />
        </div>
      </section>

      <NodeViewContent className="flex" />
    </NodeViewWrapper>
  );
}
