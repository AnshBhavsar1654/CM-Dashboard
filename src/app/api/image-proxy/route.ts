export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Reject loopback / private / link-local targets so the proxy can't be used to reach internal services
function isBlockedHost(hostname: string): boolean {
	const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
	if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) return true;
	if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return h.includes(':');
	const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	if (!m) return false;
	const [a, b] = [Number(m[1]), Number(m[2])];
	return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

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

		if (isBlockedHost(targetUrl.hostname)) {
			return new Response('Host not allowed', { status: 400 });
		}

		const upstreamResponse = await fetch(targetUrl.toString(), {
			headers: {
				// Some CDNs require a UA; keep it minimal and generic
				'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0; +https://nextjs.org)',
				'Accept': 'image/*,*/*;q=0.8',
				// Intentionally omit Referer to avoid hotlink protections that block foreign referers
			},
			redirect: 'follow',
			signal: AbortSignal.timeout(10_000),
		});

		if (upstreamResponse.redirected && isBlockedHost(new URL(upstreamResponse.url).hostname)) {
			return new Response('Host not allowed', { status: 400 });
		}

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

		const contentLength = Number(upstreamResponse.headers.get('content-length') || 0);
		if (contentLength > MAX_BYTES) {
			return new Response('Image too large', { status: 413 });
		}

		return new Response(upstreamResponse.body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				// Image URLs are content-addressed in practice, so let browsers and the CDN cache them
				'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
				...(etag ? { ETag: etag } : {}),
			},
		});
	} catch (err) {
		console.error('💥 Image proxy error:', err);
		return new Response('Unexpected error', { status: 500 });
	}
}