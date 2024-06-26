import { IconProps, Icons } from '@superscale/ui/icons';
import { store } from '../../store';
import { linkModalOpenAtom } from '../link';
import { Editor } from '@tiptap/core';

export type CommandProps = {
  editor: Editor;
};

type Command = {
  name: string;
  shortcut: () => string;
  execute: (props: CommandProps) => void;
  icon: React.ComponentType<IconProps>;
};

function getMetaKey() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  if (platform.includes('Mac') || userAgent.includes('Mac')) {
    return '⌘';
  } else if (platform.includes('Win') || userAgent.includes('Win')) {
    return '^';
  } else if (/Linux/.test(platform)) {
    return '^';
  } else {
    return '^'; // Default to ^ for other platforms
  }
}

export const commands: Command[] = [
  {
    name: 'Link',
    shortcut: () => `${getMetaKey()}+K`,
    execute: () => {
      store.set(linkModalOpenAtom, true);
    },
    icon: Icons.link,
  },
  {
    name: 'Bold',
    shortcut: () => `${getMetaKey()}+B`,
    execute: ({ editor }) => {
      editor.chain().focus().toggleBold().run();
    },
    icon: Icons.bold,
  },
  {
    name: 'Code',
    shortcut: () => `${getMetaKey()}+E`,
    execute: ({ editor }) => {
      editor.chain().focus().toggleCode().run();
    },
    icon: Icons.code,
  },
  {
    name: 'Italic',
    shortcut: () => `${getMetaKey()}+I`,
    execute: ({ editor }) => {
      editor.chain().focus().toggleItalic().run();
    },
    icon: Icons.italic,
  },
  {
    name: 'Underline',
    shortcut: () => `${getMetaKey()}+U`,
    execute: ({ editor }) => {
      editor.chain().focus().toggleUnderline().run();
    },
    icon: Icons.underline,
  },
];
