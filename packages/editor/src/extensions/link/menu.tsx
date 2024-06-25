import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@superscale/ui/atoms/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@superscale/ui/atoms/form';
import { Input } from '@superscale/ui/atoms/input';
import { Icons } from '@superscale/ui/icons';
import { BubbleMenu, BubbleMenuProps } from '@tiptap/react';
import { link } from 'fs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type LinkBubbleMenuProps = Omit<
  BubbleMenuProps,
  'shouldShow' | 'children'
>;

export function LinkBubbleMenu({ editor }: LinkBubbleMenuProps) {
  const shouldShow: BubbleMenuProps['shouldShow'] = ({ editor }) => {
    return editor.isActive('link');
  };

  const schema = z.object({
    link: z.string(),
    url: z.string().url(),
  });

  const linkAttributes = editor?.getAttributes('link') ?? {};

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const submit = (data: z.infer<typeof schema>) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: data.url })
      .run();
  };
  const unlink = () =>
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow}>
      <div className="border-input bg-background flex flex-row items-start gap-2 rounded-sm border p-2">
        <div>
          <Form {...form}>
            <form onChange={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={
                          field.value?.length > 0
                            ? field.value
                            : linkAttributes?.href
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="flex flex-row items-center gap-1">
          <Button
            className="gap-2"
            onClick={unlink}
            type="button"
            variant="ghost"
            size="icon"
          >
            <Icons.unlink className="h-4 w-4" />
          </Button>
          <Button
            className="gap-2"
            asChild
            type="button"
            variant="ghost"
            size="icon"
          >
            <a {...linkAttributes}>
              <Icons.externalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </BubbleMenu>
  );
}
