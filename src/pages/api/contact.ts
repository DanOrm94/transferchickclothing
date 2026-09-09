import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as { name?:string; email?:string; message?:string; turnstileToken?:string };
    if (!body.email || !body.message || !body.turnstileToken) return new Response(JSON.stringify({error:'Please complete the form.'}), {status:400,headers:{'content-type':'application/json'}});
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({secret:locals.runtime.env.TURNSTILE_SECRET_KEY,response:body.turnstileToken,remoteip:request.headers.get('CF-Connecting-IP')}) });
    const result = await verify.json() as { success:boolean };
    if (!result.success) return new Response(JSON.stringify({error:'Turnstile verification failed.'}), {status:400,headers:{'content-type':'application/json'}});
    const emailRes = await fetch('https://api.resend.com/emails', {method:'POST',headers:{Authorization:`Bearer ${locals.runtime.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Transfer Chick <hello@your-domain.example>',to:['YOUR_CONTACT_INBOX@example.com'],reply_to:body.email,subject:`Contact form: ${body.name || 'New message'}`,text:body.message})});
    if (!emailRes.ok) throw new Error('Email delivery failed');
    return new Response(JSON.stringify({ok:true}),{status:200,headers:{'content-type':'application/json'}});
  } catch { return new Response(JSON.stringify({error:'Unable to send your message.'}),{status:500,headers:{'content-type':'application/json'}}); }
};
