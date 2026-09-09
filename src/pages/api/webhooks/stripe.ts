import type { APIRoute } from 'astro';
import Stripe from 'stripe';

async function sendConfirmation(env: RuntimeEnv, email: string, orderId: number, total: number) {
  const response = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify({ from:'Transfer Chick <orders@your-domain.example>', to:[email], subject:`Order #${orderId} confirmed`, html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h1>Thanks for your order.</h1><p>Your Transfer Chick order <strong>#${orderId}</strong> is confirmed.</p><p>Total: <strong>£${(total/100).toFixed(2)}</strong></p><p>We’ll email again when it ships.</p></div>` }) });
  if (!response.ok) console.error('Resend error', await response.text());
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status:400 });
  const payload = await request.text();
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion:'2025-03-31.basil' });
    const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    if (event.type !== 'checkout.session.completed') return new Response(JSON.stringify({ received:true }), { status:200 });
    const session = event.data.object as Stripe.Checkout.Session;
    const exists = await env.DB.prepare('SELECT id FROM orders WHERE stripe_session_id = ?').bind(session.id).first();
    if (exists) return new Response(JSON.stringify({ received:true }), { status:200 });

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit:100 });
    const address = session.shipping_details?.address || session.customer_details?.address || null;
    const total = Number(session.amount_total || 0);
    const email = session.customer_details?.email || session.customer_email || '';
    await env.DB.prepare('INSERT OR IGNORE INTO customers (email) VALUES (?)').bind(email).run();
    const order = await env.DB.prepare('INSERT INTO orders (stripe_session_id, customer_email, status, total, shipping_address) VALUES (?,?,?,?,?) RETURNING id').bind(session.id, email, 'paid', total, JSON.stringify(address)).first<{id:number}>();
    if (!order?.id) throw new Error('Order insert failed');

    for (const item of lineItems.data) {
      const variantId = item.price?.metadata?.variant_id || item.price?.product?.toString();
      if (!variantId) continue;
      const quantity = Number(item.quantity || 1);
      const variant = await env.DB.prepare('SELECT id, stock_quantity FROM variants WHERE id = ?').bind(Number(variantId)).first<{id:number;stock_quantity:number}>();
      if (!variant) continue;
      const result = await env.DB.prepare('UPDATE variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?').bind(quantity, variant.id, quantity).run();
      if (!result.success || result.meta?.changes !== 1) throw new Error(`Insufficient stock during webhook for variant ${variant.id}`);
      await env.DB.prepare('INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES (?,?,?,?)').bind(order.id, variant.id, quantity, Number(item.price?.unit_amount || 0)).run();
    }
    await sendConfirmation(env, email, order.id, total);
    return new Response(JSON.stringify({ received:true }), { status:200 });
  } catch (error) {
    console.error('stripe-webhook', error);
    return new Response('Webhook error', { status:400 });
  }
};
