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
import { NodeViewProps } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import Turndown from 'turndown';
import { getExtensions } from '../starterkit';
import './styles.css';

const turndown = new Turndown();

const iconMap = {
  'gpt-3.5-turbo': Icons.openAI,
  'gpt-4-turbo': Icons.openAI,
  'gpt-4-turbo-preview': Icons.openAI,
};

export function PromptView({ editor, getPos, node }: NodeViewProps) {
  const [model, setModel] = useState('gpt-3.5-turbo');

  const { completion, complete, setCompletion } = useCompletion({
    api: '/api/completions',
  });
  const doCompletion = async () => {
    try {
      const content = node.toJSON();
      const html = generateHTML(content, getExtensions());
      const md = turndown.turndown(html);
      complete(md, { body: { model } });
    } catch (error) {
      console.error(error);
    }
  };
  const reset = () => {
    setCompletion('');
  };

  const Icon = iconMap[model as keyof typeof iconMap];

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
    <NodeViewWrapper className="group relative flex w-full flex-row gap-2">
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

      <div className="m-2 ml-0 flex w-full flex-col gap-2">
        <div className="flex flex-row justify-between gap-2">
          <div className="flex">
            <Select defaultValue={model} onValueChange={setModel}>
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
          </div>
          <div className="flex flex-row gap-2">
            <Button size="icon" onClick={doCompletion}>
              <Icons.play className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={reset}>
              <Icons.rotate className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <NodeViewContent className="prompt-input border-input my-2 rounded-md border p-2" />
        {completion && (
          <div className="flex flex-row items-start gap-2">
            <Icon className="h-4 w-4" />
            <div>{completion}</div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
