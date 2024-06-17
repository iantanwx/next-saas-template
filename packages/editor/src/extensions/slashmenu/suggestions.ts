'use client';

import { Editor, Range } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
// @ts-ignore
import tippy from 'tippy.js';

import { Icon, Icons } from '@superscale/ui/icons';
import { Fzf, FzfOptions } from 'fzf';
import { SlashMenu } from './Menu';

export type SlashMenuCommand = {
  editor: Editor;
  range: Range;
};

export type SlashMenuItem = {
  title: string;
  icon: Icon;
  shortcut?: string;
  command: (props: SlashMenuCommand) => void;
};

const SlashMenuItems: SlashMenuItem[] = [
  {
    title: 'Prompt',
    icon: Icons.bot,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('prompt').run();
    },
  },
  {
    title: 'Heading 1',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
    icon: Icons.heading1,
    shortcut: '#',
  },
  {
    title: 'Heading 2',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
    icon: Icons.heading2,
    shortcut: '##',
  },
  {
    title: 'Heading 3',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
    icon: Icons.heading3,
    shortcut: '###',
  },
];

const fzfOptions: FzfOptions<SlashMenuItem> = {
  selector: (item: SlashMenuItem) => item.title,
};

const fzf = new Fzf(SlashMenuItems, fzfOptions);

export const suggestions: Omit<SuggestionOptions, 'editor'> = {
  items: ({ query }: { query: string }) => {
    query = query.toLowerCase().trim();

    if (!query) return SlashMenuItems;

    const res = fzf.find(query);
    return res.map(({ item }) => item);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any;
    let localProps: any;

    return {
      onStart: (props) => {
        localProps = { ...props, event: '' };

        component = new ReactRenderer(SlashMenu, {
          props: localProps,
          editor: localProps.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: localProps.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          animation: 'shift-toward-subtle',
          duration: 250,
        });
      },

      onUpdate(props) {
        localProps = { ...props, event: '' };

        component.updateProps(localProps);

        popup[0].setProps({ getReferenceClientRect: localProps.clientRect });
      },

      onKeyDown(props) {
        component.updateProps({ ...localProps, event: props.event });

        if (props.event.key === 'Escape') {
          popup[0].hide();

          return true;
        }

        if (props.event.key === 'Enter') {
          props.event.stopPropagation();
          props.event.preventDefault();

          return true;
        }

        return false;
      },

      onExit() {
        if (popup && popup[0]) popup[0]?.destroy();
        if (component) component.destroy();
      },
    };
  },
};
