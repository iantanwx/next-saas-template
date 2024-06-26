import { Button } from '@superscale/ui/atoms/button';
import {
  BubbleMenu as TipTapBubbleMenu,
  BubbleMenuProps as TipTapBubbleMenuProps,
} from '@tiptap/react';
import { commands } from './command';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@superscale/ui/atoms/tooltip';

export type BubbleMenuProps = Omit<
  TipTapBubbleMenuProps,
  'shouldShow' | 'children'
>;

export function BubbleMenu(props: BubbleMenuProps) {
  const { editor } = props;
  if (!editor) {
    return null;
  }

  return (
    <TipTapBubbleMenu {...props}>
      <div className="border-input bg-background flex flex-row items-center gap-2 rounded-sm border p-2">
        {commands.map((cmd) => {
          return (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => cmd.execute({ editor })}
                >
                  <cmd.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col gap-1">
                  <span className="text-foreground text-sm font-medium">
                    {cmd.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {cmd.shortcut()}
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TipTapBubbleMenu>
  );
}
