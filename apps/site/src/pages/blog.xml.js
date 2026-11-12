import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog").then((posts) =>
    posts.map((post) => ({
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat("img"),
      }),
      description: post.data.description,
      pubDate: post.data.pubDate,
      title: post.data.title,
      link: `/blog/${post.id}`,
    })),
  );

  return rss({
    description: "Full stack development guides and stories",
    items: posts,
    site: context.site,
    stylesheet: "/public/pretty-feed-v3.xls",
    title: "ar-at-localhost’s Blog",
  });
}
