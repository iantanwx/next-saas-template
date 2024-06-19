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
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';

const iconMap = {
  'gpt-3.5-turbo': Icons.openAI,
  'gpt-4-turbo': Icons.openAI,
  'gpt-4-turbo-preview': Icons.openAI,
};

export function PromptView({ node }: NodeViewProps) {
  const [model, setModel] = useState('gpt-3.5-turbo');

  const { completion, complete, setCompletion } = useCompletion({
    api: '/api/completions',
  });
  const doCompletion = async () => {
    complete(node.content.toString(), { body: { model } });
  };
  const reset = () => {
    setCompletion('');
  };

  const Icon = iconMap[model as keyof typeof iconMap];

  return (
    <NodeViewWrapper>
      <div className="flex flex-col gap-2">
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
            <Button variant="outline" size="icon" onClick={doCompletion}>
              <Icons.play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={reset}>
              <Icons.rotate className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <NodeViewContent className="rounded-md border-2 border-gray-200 p-4" />
        <Icon className="h-4 w-4" />
        {completion && <div>{completion}</div>}
      </div>
    </NodeViewWrapper>
  );
}
