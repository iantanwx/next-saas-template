import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useCompletion } from '@ai-sdk/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { NodeViewProps } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { atom, useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import Turndown from 'turndown';
import { z } from 'zod';

import { Button } from '@superscale/ui/atoms/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@superscale/ui/atoms/form';
import { Input } from '@superscale/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/atoms/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@superscale/ui/atoms/tooltip';
import { Icons } from '@superscale/ui/icons';

import { getExtensions } from '../starterkit';
import { DATA_PROMPT_ID, PromptState, complete, promptMapAtom } from './node';
import './styles.css';

const turndown = new Turndown();

const iconMap = {
  'gpt-3.5-turbo': Icons.openAI,
  'gpt-4-turbo': Icons.openAI,
  'gpt-4-turbo-preview': Icons.openAI,
};

function usePromptState(promptID?: string): PromptState | undefined {
  if (!promptID) return;
  const promptState = useAtomValue(promptMapAtom);
  return useAtomValue(promptState[promptID]);
}

export function PromptView({ editor, getPos, node, updateAttributes }: NodeViewProps) {
  const [model, setModel] = useState('gpt-3.5-turbo');

  // const { completion, complete, setCompletion } = useCompletion({
  //   api: '/api/completions',
  // });
  const doCompletion = async () => {
    const content = node.toJSON();
    const html = generateHTML(content, getExtensions());
    const md = turndown.turndown(html);
    complete(node.attrs[DATA_PROMPT_ID], md, '/api/completions');
  };
  const reset = () => {
    // setCompletion('');
    console.log('reset: noop');
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

  const [isEditingId, setIsEditingId] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const onClickLabel = (_: React.MouseEvent<HTMLSpanElement>) => {
    setIsEditingId(true);
  };
  const onMousedownLabel = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (labelRef.current && labelRef.current.contains(e.target as Node)) {
      e.preventDefault();
    }
  };
  const promptState = usePromptState(node.attrs[DATA_PROMPT_ID]);
  console.log({ promptState });

  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (inputRef.current && isEditingId) {
      inputRef.current.focus();
    }
  }, [isEditingId]);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsEditingId(false);
      form.reset();
    }
  };

  const promptIDs = useAtomValue(promptMapAtom);
  const schema = z.object({
    id: z
      .string()
      .min(1, { message: 'Prompt ID cannot be empty' })
      .refine((id) => !promptIDs[id], {
        message: 'Prompt label must be unique',
      }),
  });
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsEditingId(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingId]);
  const submit = (data: z.infer<typeof schema>) => {
    updateAttributes({ [DATA_PROMPT_ID]: data.id });
    setIsEditingId(false);
  };
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: node.attrs[DATA_PROMPT_ID],
    },
  });

  return (
    <NodeViewWrapper
      className="group relative flex w-full flex-row gap-2"
      onMouseDown={onMousedownLabel}
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

      <div className="m-2 ml-0 flex w-full flex-col gap-2">
        <div className="mb-4 flex flex-row justify-between gap-2">
          <Tooltip delayDuration={100}>
            <div className="flex flex-grow cursor-default flex-row items-center justify-start gap-2 font-semibold">
              {isEditingId ? (
                <Form {...form}>
                  <form id="editor-link-modal" onSubmit={form.handleSubmit(submit)}>
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormControl>
                            <Input {...field} ref={inputRef} onKeyDown={onKeyDown} />
                          </FormControl>
                          <FormMessage className="absolute" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <span
                  ref={labelRef}
                  onClick={onClickLabel}
                  className="cursor-pointer text-center align-middle"
                >
                  {node.attrs['data-prompt-id']}
                </span>
              )}
              <TooltipTrigger>
                <Icons.help className="text-muted-foreground h-4 w-4" />
              </TooltipTrigger>
            </div>
            <TooltipContent side="right">
              <div>
                <span className="text-muted-foreground">
                  This is the prompt's unique identifier.
                  <br />
                  Reference it from other prompts by using <code>@</code>.
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
          <div className="flex flex-row gap-2">
            <Select defaultValue={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select an LLM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo Preview</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex flex-shrink-0" size="icon" onClick={doCompletion}>
              <Icons.play className="h-4 w-4" />
            </Button>
            <Button className="flex flex-shrink-0" size="icon" onClick={reset}>
              <Icons.rotate className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <NodeViewContent className="prompt-input border-input my-2 rounded-md border p-2" />
        {promptState?.completion && (
          <div className="mt-4 flex flex-row items-start gap-2">
            <div className="flex items-start ">
              <Icon className="h-4 w-4" />
            </div>
            <div>{promptState.completion}</div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
