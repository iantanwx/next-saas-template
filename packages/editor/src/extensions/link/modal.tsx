import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@superscale/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@superscale/ui/atoms/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@superscale/ui/atoms/form';
import { Input } from '@superscale/ui/atoms/input';
import { Editor } from '@tiptap/react';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { store } from '../../store';
import { linkModalOpenAtom } from './node';

export type LinkModalProps = {
  editor: Editor | null;
};

const schema = z.object({
  link: z.string().url(),
});

export function LinkModal({ editor }: LinkModalProps) {
  const open = useAtomValue(linkModalOpenAtom);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      link: '',
    },
  });
  const onOpenChange = (open: boolean) => {
    if (!open) {
      store.set(linkModalOpenAtom, open);
      form.reset();
    }
  };
  const submit = (data: z.infer<typeof schema>) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: data.link })
      .run();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter URL</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="editor-link-modal" onSubmit={form.handleSubmit(submit)}>
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://superscale.app" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="editor-link-modal">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
