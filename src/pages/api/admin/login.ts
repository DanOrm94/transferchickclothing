import type { APIRoute } from 'astro';
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const body = await request.formData();
  const password = String(body.get('password') || '');
  if (!password || password !== locals.runtime.env.ADMIN_PASSWORD) return new Response('Invalid credentials', { status:401 });
  return new Response(null, { status:302, headers:{'location':'/admin','set-cookie':'tcc_admin=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400'} });
};
