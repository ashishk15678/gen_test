import { env } from '$env/dynamic/private';
import crypto from 'crypto';

// Sign RS256 JWT using Node native crypto (saves external dependencies)
function signJWT(appId: string, privateKey: string): string {
	const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
	const now = Math.floor(Date.now() / 1000);
	
	const payload = Buffer.from(JSON.stringify({
		iat: now - 60,
		exp: now + 500, // 8 minutes expiry
		iss: appId
	})).toString('base64url');

	const sign = crypto.createSign('RSA-SHA256');
	sign.update(`${header}.${payload}`);
	const signature = sign.sign(privateKey, 'base64url');

	return `${header}.${payload}.${signature}`;
}

// Get installation token using GitHub App Credentials
async function getInstallationToken(installationId: string): Promise<string> {
	const appId = env.GITHUB_APP_ID;
	const privateKey = env.GITHUB_APP_PRIVATE_KEY;

	if (!appId || !privateKey) {
		throw new Error('Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY');
	}

	const jwt = signJWT(appId, privateKey.replace(/\\n/g, '\n'));

	const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Rabbit-AI-App'
		}
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get installation token: ${res.status} - ${err}`);
	}

	const data = await res.json();
	return data.token;
}

// Fetch the PR diff string
export async function getPRDiff(repoName: string, prNumber: number, installationId?: string): Promise<string> {
	let token = env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
	
	if (installationId) {
		try {
			token = await getInstallationToken(installationId);
		} catch (e) {
			console.error('Failed to authenticate as installation, falling back to PAT:', e);
		}
	}

	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.v3.diff',
		'User-Agent': 'Rabbit-AI-App'
	};

	if (token) {
		headers['Authorization'] = `token ${token}`;
	}

	const res = await fetch(`https://api.github.com/repos/${repoName}/pulls/${prNumber}`, {
		headers
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch PR diff: ${res.status} - ${res.statusText}`);
	}

	return res.text();
}

// Post a review back to the PR on GitHub
export async function postPRReview(
	repoName: string,
	prNumber: number,
	body: string,
	comments: Array<{ path: string; line: number; body: string }>,
	installationId?: string
): Promise<boolean> {
	let token = env.GITHUB_PERSONAL_ACCESS_TOKEN || '';

	if (installationId) {
		try {
			token = await getInstallationToken(installationId);
		} catch (e) {
			console.error('Failed to get installation token, falling back to PAT:', e);
		}
	}

	if (!token) {
		console.warn('⚠️ No token configured to write back to GitHub. Skipping posting review.');
		return false;
	}

	// Filter and format comments for GitHub Review format
	const formattedComments = comments.map(c => ({
		path: c.path,
		line: c.line,
		body: c.body
	}));

	const res = await fetch(`https://api.github.com/repos/${repoName}/pulls/${prNumber}/reviews`, {
		method: 'POST',
		headers: {
			Authorization: `token ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'Content-Type': 'application/json',
			'User-Agent': 'Rabbit-AI-App'
		},
		body: JSON.stringify({
			body,
			event: 'COMMENT', // or 'REQUEST_CHANGES', 'APPROVE'
			comments: formattedComments
		})
	});

	if (!res.ok) {
		const err = await res.text();
		console.error(`❌ Failed to post PR review to GitHub: ${res.status} - ${err}`);
		return false;
	}

	console.log(`✅ Review successfully posted to GitHub PR #${prNumber} on ${repoName}`);
	return true;
}
