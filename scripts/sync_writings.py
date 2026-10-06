#!/usr/bin/env python3
"""Fetch public Beehiiv posts with one content tag. Secrets stay in GitHub Actions."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
TAG = 'Beyond the Pitch Deck'
HOST = 'usescalinginsights.com'


def safe_article_url(value):
    try:
        u = urlsplit(value)
        return u.scheme == 'https' and u.hostname in (HOST, 'www.' + HOST) and u.path.startswith('/p/') and not u.username and not u.password and u.port in (None, 443)
    except (TypeError, ValueError):
        return False


def normalise_post(post, now):
    """Never expose drafts, future posts, email-only or hidden posts."""
    if not isinstance(post, dict):
        return None
    tags = post.get('content_tags') or []
    if not isinstance(tags, list) or not any(isinstance(t, str) and t.strip().casefold() == TAG.casefold() for t in tags):
        return None
    if post.get('status') != 'confirmed' or post.get('platform') not in ('web', 'both') or post.get('hidden_from_feed') is True:
        return None
    timestamp = post.get('publish_date')
    if isinstance(timestamp, bool) or not isinstance(timestamp, (int, float)) or not 0 < timestamp <= now:
        return None
    url, title = post.get('web_url', ''), post.get('title', '')
    if not isinstance(title, str) or not title.strip() or not safe_article_url(url):
        return None
    if re.search(r'daily[\s_-]*brief', title + ' ' + url, re.I):
        return None
    date = dt.datetime.fromtimestamp(timestamp, ZoneInfo('Asia/Kuala_Lumpur')).date().isoformat()
    return {'title': title.strip(), 'url': url, 'date': date, 'tags': tags, 'source': 'beehiiv'}


def fetch_all(api_key, publication_id, opener=urlopen):
    if not re.fullmatch(r'pub_[a-zA-Z0-9-]+', publication_id):
        raise ValueError('BEEHIIV_PUBLICATION_ID must be your pub_... publication ID.')
    posts, page = [], 1
    while page <= 1000:
        query = urlencode({'limit': 100, 'page': page, 'status': 'confirmed', 'hidden_from_feed': 'false', 'content_tags[]': TAG, 'order_by': 'publish_date', 'direction': 'desc'})
        req = Request(f'https://api.beehiiv.com/v2/publications/{publication_id}/posts?{query}', headers={'Authorization': 'Bearer ' + api_key, 'Accept': 'application/json', 'User-Agent': 'LogeswaryWritingsSync/1.0'})
        for attempt in range(3):
            try:
                with opener(req, timeout=25) as response:
                    data = json.load(response)
                break
            except HTTPError as err:
                if err.code == 429 or err.code >= 500:
                    if attempt < 2:
                        time.sleep(2 ** attempt)
                        continue
                raise RuntimeError(f'Beehiiv returned HTTP {err.code}. Existing deployed articles were not changed.') from None
            except (URLError, TimeoutError):
                if attempt == 2:
                    raise RuntimeError('Beehiiv is unavailable. Existing deployed articles were not changed.') from None
                time.sleep(2 ** attempt)
        if not isinstance(data, dict) or not isinstance(data.get('data'), list):
            raise ValueError('Unexpected Beehiiv response; refusing to overwrite the archive.')
        posts.extend(data['data'])
        pages = data.get('total_pages')
        if isinstance(pages, int):
            if page >= pages:
                return posts
        elif len(data['data']) < 100:
            return posts
        page += 1
    raise RuntimeError('Pagination limit exceeded; refusing a partial archive.')


def build_payload(posts, seed, now):
    articles = {}
    for item in seed:
        if safe_article_url(item.get('url', '')) and not re.search(r'daily[\s_-]*brief', item.get('title', '') + item.get('url', ''), re.I):
            articles[item['url']] = {**item, 'source': 'curated'}
    for post in posts:
        article = normalise_post(post, now)
        if article:
            articles[article['url']] = article
    return {'tag': TAG, 'updatedAt': dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat(), 'automatic': True, 'articles': sorted(articles.values(), key=lambda a: (a['date'], a['title']), reverse=True)}


def write_payload(payload, root=ROOT):
    serialized = json.dumps(payload, ensure_ascii=True, indent=2) + '\n'
    # Both outputs are generated together; JSON refreshes open tabs, JS supports local previews.
    outputs = {'data/writings.json': serialized, 'assets/js/writings-data.js': 'window.LIBRARY_WRITINGS = ' + serialized.rstrip() + ';\n'}
    for relative, content in outputs.items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--allow-unconfigured', action='store_true', help='Keep bundled articles on initial deploy before secrets are configured.')
    args = parser.parse_args()
    key, publication = os.environ.get('BEEHIIV_API_KEY', '').strip(), os.environ.get('BEEHIIV_PUBLICATION_ID', '').strip()
    if not key and not publication and args.allow_unconfigured:
        print('::warning::Beehiiv sync is not active. Add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID as repository secrets. Bundled articles are retained.')
        return
    if not key or not publication:
        raise ValueError('Add both BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID as GitHub Actions repository secrets.')
    posts = fetch_all(key, publication)
    seed = json.loads((ROOT / 'data/writings-seed.json').read_text())
    payload = build_payload(posts, seed, time.time())
    write_payload(payload)
    print(f"Archive updated: {len(payload['articles'])} articles. Matching tag: {TAG}.")

if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
