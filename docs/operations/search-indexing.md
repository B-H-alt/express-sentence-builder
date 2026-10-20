# Search indexing

The public preferred origin is https://www.expressly.us.

## Configuration

- `index.html` identifies the homepage's preferred URL and describes Expressly as a picture-based AAC app.
- `vercel.json` permanently redirects only `express-sentence-builder.vercel.app` to the preferred origin. Paths are preserved; Vercel forwards unmatched query parameters. Preview hosts and localhost are intentionally unaffected.
- `public/robots.txt` advertises `public/sitemap.xml`.
- The initial sitemap lists only the homepage. The SPA currently shares the homepage canonical across routes. Add other public pages only after implementing route-specific metadata; do not list caregiver or account areas.

## After deployment

1. Check the old host returns a 308 with the correct destination for `/`, `/pecs-app`, and links containing query parameters. Check the official host does not loop.
2. Verify `https://www.expressly.us/robots.txt` and `/sitemap.xml` return the actual files, not the SPA fallback.
3. In Google Search Console, use an existing verified property if available. Otherwise verify the domain through the DNS owner, or use an official supported URL-prefix verification method. Never invent a verification token.
4. Submit `https://www.expressly.us/sitemap.xml` and inspect/request indexing for the homepage. Check Google's selected canonical.

Search Console setup and live redirect validation are separate from a local build. Search ranking and recrawl timing are not guaranteed. Do not delete the Vercel project: the custom domain still depends on its hosting.

References: [Google canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Vercel redirect configuration](https://vercel.com/docs/project-configuration/vercel-json#redirects).
