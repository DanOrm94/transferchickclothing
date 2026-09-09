import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime.env;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
    const body = await request.json() as { items?: { variantId: number; quantity: number }[] };
    const requested = Array.isArray(body.items) ? body.items : [];
    if (!requested.length || requested.length > 30) return new Response(JSON.stringify({ error: 'Cart is empty or too large.' }), { status: 400, headers: { 'content-type':'application/json' } });

    const ids = [...new Set(requested.map((i) => Number(i.variantId)).filter(Number.isInteger))];
    if (ids.length !== requested.length) return new Response(JSON.stringify({ error:'Invalid cart.' }), { status: 400, headers:{'content-type':'application/json'} });

    const variants = await env.DB.prepare(`SELECT v.id, v.size, v.color, v.stock_quantity, v.stripe_price_id, p.id AS product_id, p.name, p.base_price, p.slug FROM variants v JOIN products p ON p.id=v.product_id WHERE v.id IN (${ids.map(()=>'?').join(',')}) AND p.is_active=1`).bind(...ids).all();
    const map = new Map((variants.results || []).map((v:any) => [Number(v.id), v]));
    if (map.size !== ids.length) return new Response(JSON.stringify({ error:'One or more items are unavailable.' }), { status:409, headers:{'content-type':'application/json'} });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of requested) {
      const v:any = map.get(Number(item.variantId)); const quantity = Math.floor(Number(item.quantity));
      if (!quantity || quantity < 1 || quantity > 10 || quantity > Number(v.stock_quantity)) return new Response(JSON.stringify({ error:`${v.name} (${v.size}) does not have enough stock.` }), { status:409, headers:{'content-type':'application/json'} });
      line_items.push(v.stripe_price_id ? { price: v.stripe_price_id, quantity } : { price_data: { currency:'gbp', product_data:{ name:`${v.name} — ${v.color} / ${v.size}`, metadata:{ variant_id:String(v.id), product_id:String(v.product_id) } }, unit_amount:Number(v.base_price) }, quantity });
    }

    const origin = env.PUBLIC_SITE_URL || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({ mode:'payment', line_items, billing_address_collection:'auto', shipping_address_collection:{ allowed_countries:['GB','IE','US','CA','AU','NZ'] }, customer_creation:'always', allow_promotion_codes:true, success_url:`${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`, cancel_url:`${origin}/cart`, metadata:{ variant_ids: ids.join(',') } });
    return new Response(JSON.stringify({ url: session.url }), { status:200, headers:{'content-type':'application/json'} });
  } catch (error) {
    console.error('create-checkout-session', error);
    return new Response(JSON.stringify({ error:'Unable to create checkout.' }), { status:500, headers:{'content-type':'application/json'} });
  }
};
