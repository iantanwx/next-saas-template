'use client';

// @ts-ignore
import { useCompletion } from '@ai-sdk/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/atoms/select';
import { Node, NodeViewProps, mergeAttributes } from '@tiptap/core';
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { SlashMenuExtension, suggestions } from './extensions/slashmenu';
import { Button } from '@superscale/ui/atoms/button';
import { Icons } from '@superscale/ui/icons';

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
  group: 'block',
  content: 'inline*',
  renderHTML({ HTMLAttributes }) {
    return ['prompt-view', mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PromptView);
  },
});

export function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      PromptBlock,
      SlashMenuExtension.configure({ suggestions }),
    ],
    content: 'hello world',
    editable: true,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none w-full',
      },
    },
  });

  return (
    <>
      <EditorContent className="h-full w-full" editor={editor} />
    </>
  );
}
