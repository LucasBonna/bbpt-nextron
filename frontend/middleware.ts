import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isRootPath = request.url === request.nextUrl.origin + '/';

	if (!sessionCookie && !isRootPath) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	if (sessionCookie && isRootPath) {
		return NextResponse.redirect(
			new URL(`/chat/${crypto.randomUUID()}`, request.url)
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/chat/:path*', '/'],
};
