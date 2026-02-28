import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
        const response = await fetch(rssUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed');
        }

        const xmlText = await response.text();

        // Simple regex to extract items (title, link, pubDate)
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];

            const titleMatch = itemContent.match(/<title>([^<]+)<\/title>/);
            const linkMatch = itemContent.match(/<link>([^<]+)<\/link>/);
            const pubDateMatch = itemContent.match(/<pubDate>([^<]+)<\/pubDate>/);
            const sourceMatch = itemContent.match(/<source[^>]*>([^<]+)<\/source>/);

            if (titleMatch && linkMatch) {
                let title = titleMatch[1].trim();
                const source = sourceMatch ? sourceMatch[1].trim() : '';
                if (source && title.endsWith(` - ${source}`)) {
                    title = title.substring(0, title.length - (` - ${source}`.length));
                }

                // Decode HTML entities
                title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

                items.push({
                    title: title,
                    link: linkMatch[1].trim(),
                    pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
                    source: source
                });
            }
        }

        return NextResponse.json({ items: items.slice(0, 5) }); // Return top 5 news per query
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
