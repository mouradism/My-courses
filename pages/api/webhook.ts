import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' })

import { buffer } from 'micro'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  const sig = req.headers['stripe-signature'] as string | undefined
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  const buf = await buffer(req as any)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig || '', webhookSecret)
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const courseId = session.metadata?.courseId
    const customerEmail = session.customer_details?.email

    // Insert purchase into Supabase: in production map customer -> user id
    try {
      await supabase.from('purchases').insert([
        { user_id: session.client_reference_id || null, course_id: courseId, stripe_session_id: session.id },
      ])
    } catch (err) {
      // Log but don't fail the webhook
      console.error('Supabase insert error', err)
    }
  }

  res.json({ received: true })
}
