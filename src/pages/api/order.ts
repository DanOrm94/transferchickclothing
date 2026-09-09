import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const GET: APIRoute = async ({ request, locals }) => {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) return new Response(JSON.stringify({ error:'Missing session_id.' }), { status:400, headers:{'content-type':'application/json'} });
  try {
    const order = await locals.runtime.env.DB.prepare('SELECT id, customer_email, status, total, shipping_address, created_at FROM orders WHERE stripe_session_id = ?').bind(sessionId).first<any>();
    if (!order) {
      const stripe = new Stripe(locals.runtime.env.STRIPE_SECRET_KEY, { apiVersion:'2025-03-31.basil' });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.payment_status !== 'paid') return new Response(JSON.stringify({ error:'Order has not been paid.' }), { status:404, headers:{'content-type':'application/json'} });
      return new Response(JSON.stringify({ error:'Order is being finalized. Refresh in a few seconds.' }), { status:409, headers:{'content-type':'application/json'} });
    }
    const { results } = await locals.runtime.env.DB.prepare(`SELECT oi.quantity, oi.unit_price, v.size, v.color, p.name FROM order_items oi JOIN variants v ON v.id=oi.variant_id JOIN products p ON p.id=v.product_id WHERE oi.order_id=?`).bind(order.id).all();
    return new Response(JSON.stringify({ order:{ id:order.id, customerEmail:order.customer_email, status:order.status, total:order.total, createdAt:order.created_at }, items:results || [] }), { status:200, headers:{'content-type':'application/json','cache-control':'no-store'} });
  } catch (error) {
    console.error('order lookup', error);
    return new Response(JSON.stringify({ error:'Unable to retrieve order.' }), { status:500, headers:{'content-type':'application/json'} });
  }
};
