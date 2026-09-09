import type { APIRoute } from 'astro';

function isAdmin(request: Request) { return request.headers.get('cookie')?.split(';').some((v) => v.trim() === 'tcc_admin=1') ?? false; }

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!isAdmin(request)) return new Response('Unauthorized', { status:401 });
  const body = await request.json() as { id?: number; status?: string };
  const id = Number(body.id); const status = String(body.status || '');
  if (!Number.isInteger(id) || !['paid','processing','shipped','cancelled'].includes(status)) return new Response(JSON.stringify({error:'Invalid update'}), {status:400,headers:{'content-type':'application/json'}});
  await locals.runtime.env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(status,id).run();
  return new Response(JSON.stringify({ok:true}), {status:200,headers:{'content-type':'application/json'}});
};
