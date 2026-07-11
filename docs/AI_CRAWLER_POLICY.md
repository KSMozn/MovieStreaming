# ReelSeek AI Crawler Policy

Last reviewed: 2026-07-11 (verify crawler names against current OpenAI and
Anthropic documentation before changing this policy).

## Decision

ReelSeek's public content is deliberately **allowed** for search-engine and
AI crawlers. The business wants ReelSeek pages available for search
indexing, user-directed retrieval, and potential future model-development
crawling. Nothing private is served on public routes, so there is no
confidentiality cost.

Implemented in `src/app/robots.ts`.

## Crawler reference

| User agent | Operator | Purpose | Our policy |
|---|---|---|---|
| `Googlebot` | Google | Web search indexing | Allow public content |
| `Bingbot` | Microsoft | Web search indexing (also feeds other engines) | Allow public content |
| `OAI-SearchBot` | OpenAI | **ChatGPT Search** crawling/indexing | Allow public content |
| `GPTBot` | OpenAI | Potential **model-development** (training) use | Allow public content — deliberate decision |
| `ChatGPT-User` | OpenAI | **User-initiated** retrieval when a ChatGPT user asks for a page. Not the Search crawler. | Not a robots concern; robots rules do not reliably govern user-initiated agents |
| `Claude-SearchBot` | Anthropic | **Claude search** crawling/indexing | Allow public content |
| `ClaudeBot` | Anthropic | Potential **model-development** (training) crawling | Allow public content — deliberate decision |
| `Claude-User` | Anthropic | **User-initiated** retrieval from Claude sessions | Not a robots concern; same caveat as ChatGPT-User |

All allowed agents get the same rule set: everything public is allowed,
`/api/` is disallowed except the documented `/api/public/` facts endpoint.
`/search` is intentionally **not** disallowed — it carries a
`noindex, follow` meta directive, and crawlers must be able to fetch the
page to see it.

## Infrastructure caveat

robots.txt permission is necessary but not sufficient: a CDN, WAF, or Cloud
Run access policy that blocks these user agents (or requires
authentication) overrides anything in this file. See
`docs/SEARCH_ENGINE_SETUP.md` § "Crawler access verification" for the
check commands. Do not hardcode crawler IP ranges in application code; the
official IP lists are:

- Googlebot: https://developers.google.com/search/apis/ipranges/googlebot.json
- Bingbot: https://www.bing.com/toolbox/bingbot.json
- OpenAI crawlers: https://openai.com/gptbot.json and platform docs
- Anthropic crawlers: see Anthropic's crawler documentation

If infrastructure-level allowlisting is ever needed, configure it in the
CDN/WAF console from those sources, not in this repository.

## What this policy does not claim

Allowing crawlers does not guarantee crawling, indexing, ranking, citation,
retrieval, or that any model trains on ReelSeek content. It only removes
ReelSeek-side obstacles.
