import { Image } from '@/components/ui/image';
import { siteConfig } from '@/config/site';
import {
  allAuthors,
  allPosts,
  Author,
  type Post,
} from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import { Metadata } from 'next';
import { getMDXComponent } from 'next-contentlayer/hooks';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = allPosts.find((post) => post.slug === params.slug) as Post;
  if (!post) {
    return {};
  }

  return {
    title: `${post.title}`,
    description: post.summary,
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.summary,
      siteName: siteConfig.name,
      type: 'website',
      images: [post.heroImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${siteConfig.name}`,
      description: post.summary,
      images: [post.heroImage],
    },
  };
}

export default async function PostPage(props0: Props) {
  const params = await props0.params;
  const post = allPosts.find((post) => post.slug === params.slug) as Post;
  if (!post) {
    notFound();
  }
  const author = allAuthors.find(
    (author) => author.slug === post.author
  ) as Author;
  const Content = getMDXComponent(post.body.code);

  return (
    <div className="flex h-screen flex-col justify-between">
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
              <Image
                alt={author.name}
                className="mr-2 rounded-full"
                height="40"
                src={author.avatar}
                style={{
                  aspectRatio: '40/40',
                  objectFit: 'cover',
                }}
                width="40"
              />
              <span className="text-md font-semibold">{author.name}</span>
            </div>
            <div className="flex flex-row justify-center space-x-4 text-sm md:items-center md:text-base">
              <div className="flex flex-col space-y-1 md:flex-row md:space-x-1 md:space-y-0">
                <span className="font-semibold">Published:</span>{' '}
                <span>{format(parseISO(post.createdAt), 'do MMMM yyyy')}</span>
              </div>
              <div className="flex flex-col space-y-1 md:flex-row md:space-x-1 md:space-y-0">
                <span className="font-semibold">Time to read:</span>
                <span>~ {post.readingTime} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-6 md:px-6 md:py-12 lg:py-16">
        <article className="prose prose-zinc dark:prose-invert mx-auto max-w-4xl">
          <Content
            components={{
              Image,
              h1(props) {
                return <h1 {...props} className="group" />;
              },
            }}
          />
        </article>
      </div>
    </div>
  );
}
