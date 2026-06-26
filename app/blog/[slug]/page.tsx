import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await getBlogPostBySlug(params.slug);

    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#fff8ef_100%)] px-4 py-8 md:px-8">
        <article className="mx-auto max-w-3xl rounded-[40px] border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur md:p-10">
          <Link href="/blog" className="text-sm font-medium text-primary">
            ← Back to blog
          </Link>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-primary">{post.frontmatter.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-50">{post.frontmatter.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {post.frontmatter.date} • {post.frontmatter.readingTime}
          </p>
          <div className="mt-8">{post.content}</div>
        </article>
      </main>
    );
  } catch {
    notFound();
  }
}
