import type { APIRoute } from 'astro';
export const GET: APIRoute = async () => new Response(null, { status:302, headers:{'location':'/admin','set-cookie':'tcc_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'} });
