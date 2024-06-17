'use client';

import { ScrollArea } from '@superscale/ui/atoms/scroll-area';
import { useEffect, useState } from 'react';
import { SlashMenuItem } from './suggestions.js';
import { cn } from '@superscale/ui/lib/utils';

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

type Props = {
  items: SlashMenuItem[];
  command: Function;
  event: any;
};

export function SlashMenu({ items, command, event }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

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
    <ScrollArea className="relative w-48 rounded-md border">
      {items.length ? (
        <>
          {items.map((item, index) => {
            return (
              <article
                className={cn(
                  'flex w-full gap-2 rounded-md p-2',
                  index === selectedIndex && 'bg-gray-100'
                )}
                key={index}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="flex w-full flex-row items-center">
                  <item.icon className="mr-2" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item.title,
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
    </ScrollArea>
  );
}
