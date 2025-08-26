export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
	try {
		const requestUrl = new URL(request.url);
		// Validates it's a proper URL and enforces HTTPS
		const targetUrlParam = requestUrl.searchParams.get('url');
		
		if (!targetUrlParam) {
			return new Response('Missing url parameter', { status: 400 });
		}

		let targetUrl: URL;
		try {
			targetUrl = new URL(targetUrlParam);
		} catch {
			return new Response('Invalid url parameter', { status: 400 });
		}

		if (targetUrl.protocol !== 'https:') {
			return new Response('Only https protocol is allowed', { status: 400 });
		}

		// Optional: Add size limits to prevent abuse
		// We could also add referrer checks or other security measures here

		const upstreamResponse = await fetch(targetUrl.toString(), {
			headers: {
				// Some CDNs require a UA; keep it minimal and generic
				'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0; +https://nextjs.org)',
				'Accept': 'image/*,*/*;q=0.8',
				// Intentionally omit Referer to avoid hotlink protections that block foreign referers
			},
			cache: 'no-store',
		});

		if (!upstreamResponse.ok || !upstreamResponse.body) {
			return new Response(`Failed to fetch image: ${upstreamResponse.status} ${upstreamResponse.statusText}`, { 
				status: upstreamResponse.status || 502 
			});
		}

		const contentType = upstreamResponse.headers.get('content-type') || 'image/*';
		const etag = upstreamResponse.headers.get('etag') || undefined;

		// Security check: Ensure we're actually getting an image
		if (!contentType.startsWith('image/')) {
			return new Response('URL does not point to an image', { status: 400 });
		}

		return new Response(upstreamResponse.body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				// Disable caching to avoid stale responses causing same image to appear
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				...(etag ? { ETag: etag } : {}),
			},
		});
	} catch (err) {
		console.error('💥 Image proxy error:', err);
		return new Response('Unexpected error', { status: 500 });
	}
}