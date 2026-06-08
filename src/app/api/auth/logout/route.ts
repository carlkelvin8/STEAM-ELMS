export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );
  return response;
}
