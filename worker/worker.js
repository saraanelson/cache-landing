/**
 * cache-landing-gate — Cloudflare Worker
 *
 * Serves the Cache landing page at cachekits.com's root while every other
 * path continues to the Lovable app untouched. This worker is only reachable
 * on the routes attached to it:
 *   cachekits.com/                  (exact — the landing page)
 *   cachekits.com/landing-assets/*  (the landing page's own assets)
 *
 * Rollback: remove those two routes (dashboard or `wrangler triggers deploy`
 * with routes removed) — the app's own homepage is back instantly.
 */

const LANDING_ORIGIN = "https://cache-landing.vercel.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    const isLanding =
      url.pathname === "/" || url.pathname.startsWith("/landing-assets/");

    if (!isLanding) {
      // Only possible if a route was attached too broadly; pass straight
      // through to the origin (the app) rather than interfering.
      return fetch(request);
    }

    const upstream = new URL(url.pathname + url.search, LANDING_ORIGIN);
    const resp = await fetch(upstream.toString(), {
      method: request.method,
      headers: request.headers,
    });

    // Return the landing response as-is; keep caching headers from Vercel.
    return new Response(resp.body, resp);
  },
};
