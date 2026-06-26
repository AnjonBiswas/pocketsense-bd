import { promises as fs } from "fs";
import path from "path";
import React from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readingTime: string;
};

export async function getAllBlogPosts() {
  const entries = await fs.readdir(BLOG_DIR);

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".mdx"))
      .map(async (entry) => {
        const slug = entry.replace(/\.mdx$/, "");
        const source = await fs.readFile(path.join(BLOG_DIR, entry), "utf8");
        const { data } = matter(source);

        return {
          slug,
          ...(data as BlogFrontmatter)
        };
      })
  );

  return posts.sort((left, right) => right.date.localeCompare(left.date));
}

export async function getBlogPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(source);
  const compiled = await compileMDX<BlogFrontmatter>({
    source: content,
    options: {
      parseFrontmatter: false
    },
    components: {
      h2: (props) =>
        React.createElement("h2", {
          ...props,
          className: "mt-8 text-2xl font-semibold text-slate-900 dark:text-slate-50"
        }),
      h3: (props) =>
        React.createElement("h3", {
          ...props,
          className: "mt-6 text-xl font-semibold text-slate-900 dark:text-slate-50"
        }),
      p: (props) =>
        React.createElement("p", {
          ...props,
          className: "mt-4 text-base leading-8 text-slate-700 dark:text-slate-300"
        }),
      ul: (props) =>
        React.createElement("ul", {
          ...props,
          className: "mt-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300"
        }),
      li: (props) =>
        React.createElement("li", {
          ...props,
          className: "leading-7"
        }),
      strong: (props) =>
        React.createElement("strong", {
          ...props,
          className: "font-semibold text-slate-900 dark:text-slate-50"
        })
    }
  });

  return {
    slug,
    frontmatter: data as BlogFrontmatter,
    content: compiled.content
  };
}
