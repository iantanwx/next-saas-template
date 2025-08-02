import { Separator } from '@superscale/ui/components/separator';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';

export function generateMetadata() {
  return {
    title: 'Blog',
    description: 'A collection of articles.',
  };
}

export default async function Blog() {
  const posts = await getAllPosts();

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <h1 className="mb-4 text-4xl font-bold lg:text-6xl">Blog</h1>
      <p className="text-xl">A collection of articles.</p>
      <Separator className="mb-4 mt-6" />
      {posts.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="transition-scale hover:border-border rounded border border-transparent p-4 transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative mb-2 aspect-video overflow-hidden rounded">
                <Image
                  alt="Hero image"
                  className="h-full w-full object-cover"
                  src={post.heroImage}
                  fill
                />
              </div>
              <p className="m-0 mt-3 text-sm opacity-75">
                {format(parseISO(post.createdAt), 'do MMMM yyyy')}
              </p>
              <h3 className="my-1 text-xl font-semibold leading-tight">
                {post.title}
              </h3>
              <p className="line-clamp-3">{post.summary}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No posts</p>
      )}
    </div>
  );
}
