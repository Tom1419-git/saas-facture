import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async (context) => {
  try {
    // Dans Cloudflare, les variables d'environnement secrètes sont dans context.locals.runtime.env
    // En dev local, on utilise import.meta.env comme fallback
    const env = (context.locals as any).runtime?.env || import.meta.env;
    
    const stripeKey = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeKey || !webhookSecret || !serviceRoleKey) {
      console.error("Missing environment variables for Stripe Webhook");
      return new Response("Server Configuration Error", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(), // Requis pour Cloudflare Workers
    });

    const signature = context.request.headers.get('stripe-signature');
    if (!signature) {
      return new Response("Missing Stripe Signature", { status: 400 });
    }

    const body = await context.request.text();

    let event;
    try {
      // constructEventAsync utilise la Web Crypto API supportée par Cloudflare Edge
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Gestion de l'événement de paiement réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id;

      if (userId) {
        // Initialiser Supabase en mode Service Role (bypasse les RLS)
        const supabaseUrl = 'https://vhxiatzktmaixyzstusf.supabase.co';
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Mettre à jour le profil de l'utilisateur pour activer le mode Pro
        const { error } = await supabase
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', userId);
          
        if (error) {
          console.error(`Failed to update user ${userId} to Pro:`, error);
          return new Response('Database Error', { status: 500 });
        }
        
        console.log(`User ${userId} successfully upgraded to Pro!`);
      } else {
        console.warn("Checkout session completed but no client_reference_id found.");
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error("Unexpected Webhook Error:", error);
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
