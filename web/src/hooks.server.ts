import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { auth } from './lib/auth';

export async function handle({ event, resolve }: any) {
	const origin = event.request.headers.get('origin') || '';
	
	// Flexible regex/inclusion checks for allowed origins
	const isAllowed = origin && (
		origin.includes('ngrok-free.app') ||
		origin.includes('rabbit.ashishkr.com') ||
		origin.includes('localhost') ||
		origin.includes('127.0.0.1')
	);

	console.log(`[CORS Hook] Request: ${event.request.method} ${event.url.pathname} | Origin: ${origin} | Allowed: ${isAllowed}`);

	// Dynamically mirror the headers requested by the client (essential for custom better-auth headers)
	const requestHeaders = event.request.headers.get('access-control-request-headers') || 
		'Content-Type, Authorization, better-auth-client-id, x-requested-with, x-github-event, x-hub-signature-256';

	// Handle preflight OPTIONS requests
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': isAllowed ? origin : '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
				'Access-Control-Allow-Headers': requestHeaders,
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Max-Age': '86400'
			}
		});
	}

	let response: Response;
	try {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		// Make session and user available on server
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		}

		response = await svelteKitHandler({ event, resolve, auth, building });
	} catch (err: any) {
		console.error('CORS Wrapper Captured Server Error:', err);
		response = new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	// Inject CORS headers on standard responses if origin is allowed
	if (isAllowed && response) {
		try {
			response.headers.set('Access-Control-Allow-Origin', origin);
			response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
			response.headers.set('Access-Control-Allow-Headers', requestHeaders);
			response.headers.set('Access-Control-Allow-Credentials', 'true');
		} catch (e) {
			// If response is immutable, clone it with new headers
			const newHeaders = new Headers(response.headers);
			newHeaders.set('Access-Control-Allow-Origin', origin);
			newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
			newHeaders.set('Access-Control-Allow-Headers', requestHeaders);
			newHeaders.set('Access-Control-Allow-Credentials', 'true');
			
			response = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: newHeaders
			});
		}
	}

	return response;
}
