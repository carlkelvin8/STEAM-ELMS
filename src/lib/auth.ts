import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-do-not-use-in-production"
);

const COOKIE_NAME = "session";
const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  sub: string;
  role: string;
  name: string;
  email: string;
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function authenticateRequest(request: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
