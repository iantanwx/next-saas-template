import { Image } from '@superscale/ui/components/image';
import fs from 'fs';
import { compileMDX, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import path from 'path';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface Post {
  slug: string;
  title: string;
  summary: string;
  author: string;
  heroImage: string;
  createdAt: string;
  updatedAt?: string;
  content: React.ReactElement;
}

interface PostFrontmatter {
  title: string;
  summary: string;
  author: string;
  heroImage: string;
  createdAt: string;
  updatedAt?: string;
}

const components = {
  Image,
} as MDXRemoteProps['components'];

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { content, frontmatter } = await compileMDX<PostFrontmatter>({
      source: fileContents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            rehypeAutolinkHeadings,
            [rehypePrettyCode, {}],
          ],
        },
      },
      components,
    });
    return {
      slug,
      content,
      ...(frontmatter as PostFrontmatter),
    };
  } catch (error) {
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(postsDirectory);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, '');
        const post = await getPost(slug);
        return post;
      })
  );

  return posts
    .filter((post): post is Post => post !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
