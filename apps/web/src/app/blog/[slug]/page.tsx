import { Image } from '@superscale/ui/components/image';
import { getPost } from '@/lib/mdx';
import { format, parseISO } from 'date-fns';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex flex-col justify-end px-4 py-8 text-white md:px-6 md:pt-64 lg:pt-96">
        <Image
          alt="Hero image"
          className="absolute inset-0 h-full w-full object-cover"
          height="1200"
          src={post.heroImage}
          style={{
            aspectRatio: '2400/1200',
            objectFit: 'cover',
          }}
          width="2400"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-center space-y-6">
          <h1 className="relative z-10 text-center text-4xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="relative z-10 mx-auto mt-2 flex w-full max-w-4xl flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-row items-center justify-center">
              <span className="text-md font-semibold">{post.author}</span>
            </div>
            <div className="flex flex-row justify-center space-x-4 text-sm md:items-center md:text-base">
              <div className="flex flex-col space-y-1 md:flex-row md:space-x-1 md:space-y-0">
                <span className="font-semibold">Published:</span>{' '}
                <span>{format(parseISO(post.createdAt), 'do MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-6 md:px-6 md:py-12 lg:py-16">
        <article className="prose prose-zinc dark:prose-invert mx-auto max-w-4xl">
          {post.content}
        </article>
      </div>
    </div>
  );
}
