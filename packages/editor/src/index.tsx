'use client';

import { useCompletion } from '@ai-sdk/react';
import { Button } from '@superscale/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/atoms/select';
import { Icons } from '@superscale/ui/icons';
import { Node, NodeViewProps, mergeAttributes } from '@tiptap/core';
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import { useState } from 'react';
import { PLUGIN_PRIORITY } from './constants';
import { getExtensions } from './extensions/starterkit';
import './styles/placeholder.css';

function PromptView({ node }: NodeViewProps) {
  const [model, setModel] = useState('gpt-3.5-turbo');
  const { completion, complete } = useCompletion({
    api: '/api/completions',
  });
  const doCompletion = async () => {
    complete(node.content.toString(), { body: { model } });
  };

  return (
    <NodeViewWrapper>
      <Select onValueChange={setModel}>
        <SelectTrigger>
          <SelectValue placeholder="Select an LLM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
          <SelectItem value="gpt-4-turbo-preview">
            GPT-4 Turbo Preview
          </SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={doCompletion}>
        <Icons.play />
      </Button>
      <NodeViewContent className="rounded-md border-2 border-gray-200" />
      {completion && <div>{completion}</div>}
    </NodeViewWrapper>
  );
}

const PromptBlock = Node.create({
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

        if (parent.type.name !== 'prompt') return false;

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

export function Editor() {
  const editor = useEditor({
    extensions: [...getExtensions({ openLinkModal: () => null }), PromptBlock],
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
