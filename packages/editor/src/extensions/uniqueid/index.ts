import {
  Extension,
  findChildren,
  combineTransactionSteps,
  getChangedRanges,
  findChildrenInRange,
} from '@tiptap/core';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { Fragment, Slice, Node } from '@tiptap/pm/model';
import { v4 as uuidv4 } from 'uuid';

function findDuplicates(array: Array<string>) {
  return array.filter((item, index) => array.indexOf(item) !== index);
}

function removeDuplicates(array: Array<string>, stringifier = JSON.stringify) {
  const seen: Record<string, boolean> = {};
  return array.filter((item) => {
    const key = stringifier(item);
    return (
      !Object.prototype.hasOwnProperty.call(seen, key) && (seen[key] = true)
    );
  });
}

export interface UniqueIDOptions {
  attributeName: string;
  types: string[];
  generateID: () => any;
  filterTransaction: ((transaction: Transaction) => boolean) | null;
}

const UniqueID = Extension.create<UniqueIDOptions>({
  name: 'uniqueID',
  priority: 10000,

  addOptions: () => ({
    attributeName: 'id',
    types: [],
    generateID: () => uuidv4(),
    filterTransaction: null,
  }),

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute(`data-${this.options.attributeName}`),
            renderHTML: (attributes) =>
              attributes[this.options.attributeName]
                ? {
                    [`data-${this.options.attributeName}`]:
                      attributes[this.options.attributeName],
                  }
                : {},
          },
        },
      },
    ];
  },

  onCreate() {
    if (
      this.editor.extensionManager.extensions.find(
        (ext) => ext.name === 'collaboration'
      )
    ) {
      return;
    }

    const { view, state } = this.editor;
    const { tr, doc } = state;
    const { types, attributeName, generateID } = this.options;

    findChildren(
      doc,
      (node) =>
        types.includes(node.type.name) && node.attrs[attributeName] === null
    ).forEach(({ node, pos }) => {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        [attributeName]: generateID(),
      });
    });

    tr.setMeta('addToHistory', false);
    view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    let dragSourceElement: HTMLElement | null = null;
    let isPastedContent = false;

    return [
      new Plugin({
        key: new PluginKey('uniqueID'),

        appendTransaction: (transactions, oldState, newState) => {
          const docChanged =
            transactions.some((tr) => tr.docChanged) &&
            !oldState.doc.eq(newState.doc);
          const shouldFilter =
            this.options.filterTransaction &&
            transactions.some((tr) => {
              return !this.options.filterTransaction?.(tr);
            });

          if (!docChanged || shouldFilter) return;

          const { tr } = newState;
          const { types, attributeName, generateID } = this.options;
          const steps = combineTransactionSteps(oldState.doc, [
            ...transactions,
          ]);
          const { mapping } = steps;

          getChangedRanges(steps).forEach(({ newRange }) => {
            const nodes = findChildrenInRange(newState.doc, newRange, (node) =>
              types.includes(node.type.name)
            );
            const ids = nodes
              .map(({ node }) => node.attrs[attributeName])
              .filter((id) => id !== null);

            nodes.forEach(({ node, pos }, index) => {
              const newId = tr.doc.nodeAt(pos)?.attrs[attributeName];

              if (newId === null) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: generateID(),
                });
                return;
              }

              const nextNode = nodes[index + 1];
              if (nextNode && node.content.size === 0) {
                tr.setNodeMarkup(nextNode.pos, undefined, {
                  ...nextNode.node.attrs,
                  [attributeName]: newId,
                });
                ids[index + 1] = newId;
                const generatedId = generateID();
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: generatedId,
                });
                ids[index] = generatedId;
                return;
              }

              const uniqueIds = removeDuplicates(ids);
              const { deleted } = mapping.invert().mapResult(pos);
              if (deleted && uniqueIds.includes(newId)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: generateID(),
                });
              }
            });
          });

          return tr.steps.length ? tr : undefined;
        },

        view(editorView) {
          const handleDragStart = (event: DragEvent) => {
            dragSourceElement = editorView.dom.parentElement?.contains(
              event.target as globalThis.Node
            )
              ? editorView.dom.parentElement
              : null;
          };

          window.addEventListener('dragstart', handleDragStart);

          return {
            destroy() {
              window.removeEventListener('dragstart', handleDragStart);
            },
          };
        },

        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              if (
                dragSourceElement !== view.dom.parentElement ||
                event.dataTransfer?.effectAllowed === 'copy'
              ) {
                dragSourceElement = null;
                isPastedContent = true;
              }
              return false;
            },
            paste: () => {
              isPastedContent = true;
              return false;
            },
          },
          transformPasted: (slice) => {
            if (!isPastedContent) return slice;

            const { types, attributeName } = this.options;

            const transformFragment = (fragment: Fragment) => {
              const result: Node[] = [];
              fragment.forEach((node) => {
                if (node.isText) {
                  result.push(node);
                  return;
                }
                if (!types.includes(node.type.name)) {
                  result.push(node.copy(transformFragment(node.content)));
                  return;
                }
                const newNode = node.type.create(
                  { ...node.attrs, [attributeName]: null },
                  transformFragment(node.content),
                  node.marks
                );
                result.push(newNode);
              });
              return Fragment.from(result);
            };

            isPastedContent = false;
            return new Slice(
              transformFragment(slice.content),
              slice.openStart,
              slice.openEnd
            );
          },
        },
      }),
    ];
  },
});

export { UniqueID };
export default UniqueID;
