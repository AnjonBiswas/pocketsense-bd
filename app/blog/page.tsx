import Link from "next/link";
import { ThemeIllustration } from "@/components/features/ThemeIllustration";
import { getAllBlogPosts } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,216,125,0.4),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#fff8ef_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">PocketSense Blog</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-50">Student money ideas for Bangladesh</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              Practical articles on saving money in university life, finding part-time income, and learning the basics of investing in a Bangladeshi context.
            </p>
          </div>
          <div className="rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm">
            <ThemeIllustration
              lightSrc="/illustrations/blog-light.svg"
              darkSrc="/illustrations/blog-dark.svg"
              alt="Financial tips illustration"
              className="mx-auto h-56 w-full object-contain"
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.slug} className="border-white/60 bg-white/90 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                </div>
                <Button asChild className="rounded-full">
                  <Link href={`/blog/${post.slug}`}>Read article</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
