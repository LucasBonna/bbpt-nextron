import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
 
export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
 
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (request.url === request.nextUrl.origin + "/") {
		return NextResponse.redirect(new URL(`/chat/${crypto.randomUUID()}`, request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
    matcher: ["/chat/:path*", "/"],
}