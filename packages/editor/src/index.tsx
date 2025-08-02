'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/atoms/select';
import {
  type Editor as _Editor,
  Extension,
  mergeAttributes,
  Node,
  type NodeViewProps,
  type Range,
} from '@tiptap/core';
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  ReactRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

import { Fzf, type FzfOptions } from 'fzf';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
// @ts-ignore
import tippy from 'tippy.js';

function PromptView(_: NodeViewProps) {
  return (
    <NodeViewWrapper>
      <NodeViewContent className="rounded-md border-2 border-gray-200" />
      something new
      <Select>
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
      {/* <div>{node.toJSON()}</div> */}
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

type CommandProps = {
  editor: _Editor;
  range: Range;
};

type SlashMenuItem = {
  title: string;
  icon: React.FC;
  shortcut?: string;
  command: (props: CommandProps) => void;
};

const SlashMenuItems: SlashMenuItem[] = [
  {
    title: 'Prompt',
    icon: () => <div>Prompt</div>,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('prompt').run();
    },
  },
];

const updateScrollView = (
  container: HTMLElement | null,
  item: HTMLElement | null
) => {
  if (item && container) {
    //Get the height f the list container
    const ContainerHeight = container.offsetHeight;
    const itemHeight = item ? item.offsetHeight : 0;

    //Calculate item distance from top and bottom
    const top = item.offsetTop;
    const bottom = top + itemHeight;

    if (top < container.scrollTop) {
      container.scrollTop -= container.scrollTop - top + 5;
    } else if (bottom > ContainerHeight + container.scrollTop) {
      container.scrollTop += bottom - ContainerHeight - container.scrollTop + 5;
    }
  }
};

type SlashMenuProps = {
  items: any[];
  command: Function;
  event: any;
};

export const SlashMenu: React.FC<SlashMenuProps> = ({
  items,
  command,
  event,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandListContainer = useRef<HTMLDivElement>(null);

  useEffect(() => setSelectedIndex(0), [items]);

  useLayoutEffect(() => {
    // Get Container
    const container = commandListContainer?.current || null;
    // Get active/selected item from list
    const item = (container!.children[selectedIndex] as HTMLElement) || null;
    // Update the scroll position
    updateScrollView(container, item);
  }, [selectedIndex]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.stopPropagation();
      event.preventDefault();
      upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      event.stopPropagation();
      event.preventDefault();
      downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      enterHandler();
      return true;
    }

    return false;
  };

  useEffect(() => {
    onKeyDown(event);
  }, [event]);

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  const selectItem = (index: number) => {
    const item = items[index];

    if (item) setTimeout(() => command(item));
  };

  return (
    <div
      ref={commandListContainer}
      className="hide-scrollbar relative border-2 border-green-300"
    >
      {items.length ? (
        <>
          {items.map((item, index) => {
            return (
              <article
                className={`item flex ${index === selectedIndex ? 'is-selected' : ''}`}
                key={index}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="border-2 border-red-200">
                  {item.icon()}{' '}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item.highlightedTitle || item.title,
                    }}
                  />
                </span>
                {item.shortcut && <code>{item.shortcut}</code>}
              </article>
            );
          })}
        </>
      ) : (
        <div className="item"> No result </div>
      )}
    </div>
  );
};

const fzfOptions: FzfOptions<SlashMenuItem> = {
  selector: (item: SlashMenuItem) => item.title,
};

const fzf = new Fzf(SlashMenuItems, fzfOptions);

const suggestions: Omit<SuggestionOptions, 'editor'> = {
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

const SlashMenuExtension = Extension.create({
  name: 'slashmenu',
  addOptions() {
    return {
      suggestions: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          const res = props.command({ editor, range });
          console.log('command return: ', res);
          return null;
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestions,
      }),
    ];
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
        class: 'w-full focus:outline-none',
      },
    },
  });

  return (
    <>
      <EditorContent className="h-full w-full" editor={editor} />
    </>
  );
}
