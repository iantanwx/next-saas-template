import { callCompletionApi } from '@ai-sdk/ui-utils';
import { Node, combineTransactionSteps, findChildrenInRange, getChangedRanges } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PrimitiveAtom, atom } from 'jotai';

import { generateRandomName } from '@superscale/lib/utils/random-name';

import { PLUGIN_PRIORITY } from '../../constants';
import { store } from '../../store';
import { PromptView } from './view';

/**
 * PromptStatus indicates the state of the prompt
 *
 * - idle: prompt is not doing anything
 * - loading: completion initiated but not yet completed  (e.g. waiting for response from server)
 * - streaming: completion initiated and streaming data (e.g. streaming data from server)
 */
export type PromptStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

export type PromptState = {
  promptID: string;
  status: PromptStatus;
  completion?: string;
};

const defaultPromptState: PromptState = {
  promptID: '',
  status: 'idle',
};

export const promptMapAtom = atom<Record<string, PromptState>>({});

// Create a prompt atom for a given promptID
// export function createPromptAtom(promptID: string) {
//   return atom<PromptState>((get) => {
//     const promptMap = get(promptMapAtom);
//     return promptMap.get(promptID) ?? defaultPromptState;
//   });
// }

export async function complete(promptId: string, prompt: string, api: string) {
  callCompletionApi({
    api,
    prompt,
    credentials: undefined,
    body: {
      model: 'gpt-3.5-turbo',
    },
    fetch,
    headers: {},
    streamMode: 'stream-data',
    setCompletion: (completion: string) => {
      console.log('completion', completion);
      store.set(promptMapAtom, (prompts) => ({
        ...prompts,
        [promptId]: {
          ...prompts[promptId],
          promptID: promptId,
          completion,
          status: 'streaming',
        },
      }));
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     completion,
      //     status: 'streaming',
      //   }),
      // );
    },
    setLoading: (loading) => {
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     status: loading ? 'loading' : 'idle',
      //   }),
      // );
    },
    setError: (error) => {
      // console.log('error', error);
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     status: 'error',
      //   }),
      // );
    },
    setAbortController: (abortController) => {
      console.log('abortController', abortController);
    },
    onResponse: () => {
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     status: 'success',
      //   }),
      // );
    },
    onFinish: () => {
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     status: 'idle',
      //   }),
      // );
    },
    onError: (error) => {
      // console.log('error', error);
      // store.set(promptMapAtom, (ids) =>
      //   ids.set(promptId, {
      //     ...ids.get(promptId),
      //     promptID: promptId,
      //     status: 'error',
      //   }),
      // );
    },
    onData: (data) => {
      console.log('data', data);
    },
  });
}

export const DATA_PROMPT_ID = 'data-prompt-id';

export const Prompt = Node.create({
  name: 'prompt',
  group: 'dBlock',
  content: '(block|list)+',
  draggable: true,
  selectable: false,
  inline: false,
  priority: PLUGIN_PRIORITY.PROMPT,
  addAttributes() {
    return {
      [DATA_PROMPT_ID]: {
        default: null,
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('prompt'),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged =
            transactions.some((tr) => tr.docChanged) && !oldState.doc.eq(newState.doc);
          if (!docChanged) return;

          const { tr } = newState;
          const steps = combineTransactionSteps(oldState.doc, [...transactions]);
          getChangedRanges(steps).forEach(({ newRange }) => {
            const promptNodes = findChildrenInRange(
              newState.doc,
              newRange,
              (node) => node.type.name === 'prompt',
            );
            promptNodes.forEach(({ node, pos }) => {
              const promptID = tr.doc.nodeAt(pos)?.attrs[DATA_PROMPT_ID];
              if (!promptID) {
                const randomName = generateRandomName();
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [DATA_PROMPT_ID]: randomName,
                });
                store.set(
                  promptMapAtom,
                  (prompts) => ({
                    ...prompts,
                    [randomName]: defaultPromptState,
                  }),
                  // prompts.set(randomName, { ...defaultPromptState, promptID: randomName }),
                );
                return;
              }

              // if the node already has a prompt id, it might have changed, in which case we'll have to "shift" the prompt state to a new key.
              // we'll use the unique id set by @tiptap-pro/extension-unique-id, since it's stable across edits.
              const nodeID = node.attrs['id'];
              let oldNodes: ProsemirrorNode[] = [];
              oldState.doc.descendants((node) => {
                if (node.attrs['id'] === nodeID) {
                  // oldNode = node;
                  oldNodes.push(node);
                  return false;
                }
              });
              const [oldNode] = oldNodes;
              if (oldNode) {
                const existingState = store.get(promptMapAtom)[oldNode.attrs[DATA_PROMPT_ID]];

                // const existingState = store.get(promptMapAtom).get(oldNode.attrs[DATA_PROMPT_ID]);
                if (existingState) {
                  store.set(promptMapAtom, (ids) => ({
                    ...ids,
                    [node.attrs[DATA_PROMPT_ID]]: {
                      ...existingState,
                      promptID: node.attrs[DATA_PROMPT_ID],
                    },
                  }));
                }
              }

              console.log('oldNode:', oldNode);
              console.log('newNode: ', node);
            });
          });
          return tr.steps.length ? tr : undefined;
        },
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PromptView);
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { doc, selection } = state;
        const { $head, from, $from, to, empty } = selection;
        const parent = $head.node($head.depth - 1);

        // If we're not in an empty node, it means we shouldn't exit the Prompt block
        // > some_<cursor>text
        // --> text desired here
        // \n
        // \n
        if (!empty || parent?.type !== this.type) return false;

        let nextNodeTo = -1;

        const isAtEnd = parent.maybeChild(parent.childCount - 1) === $from.parent;

        let textContent = '';
        parent.forEach((node) => {
          if (!node.textContent) {
            // treat empty nodes as newlines
            textContent += '\n';
          } else {
            textContent += node.textContent;
          }
          return false;
        });
        const endsWithDoubleNewline = textContent.endsWith('\n\n');

        if (!isAtEnd || !endsWithDoubleNewline || parent.childCount <= 2) {
          return false;
        }

        doc.descendants((node, pos) => {
          if (nextNodeTo !== -1) return false;
          if (node.type.name === this.name) return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          if (nodeFrom <= from && to <= nodeTo) nextNodeTo = nodeTo;

          return false;
        });

        let offset: number = 0;
        parent.content.forEach((node, _, index) => {
          // offset two from the end of the Fragment.
          if (index >= parent.childCount - 2) {
            offset += node.nodeSize;
          }
          return false;
        });

        const content = doc.slice(from, nextNodeTo)?.toJSON()?.content ?? [
          {
            type: 'paragraph',
          },
        ];

        return editor
          .chain()
          .command(({ tr }) => {
            // remove the newlines
            tr.delete($from.pos - offset, $from.pos);
            return true;
          })
          .insertContentAt(
            { from: $from.pos - offset, to: nextNodeTo - offset },
            {
              type: 'dBlock',
              content,
            },
          )
          .focus(from + 4)
          .run();
      },
    };
  },
});
