import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { courseId, successUrl, cancelUrl } = req.body
  if (!courseId) return res.status(400).json({ error: 'Missing courseId' })

  // NOTE: In production, look up course price server-side and validate user session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Course ${courseId}` },
            unit_amount: 1000, // placeholder $10.00 — replace with real price lookup
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: { courseId },
    })
    res.status(200).json({ sessionId: session.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
