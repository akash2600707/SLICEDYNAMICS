import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, subject, message } = req.body

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SliceDynamics Contact <onboarding@resend.dev>',
        to: 'slicedynamics@gmail.com',   // ← replace with your real email
        reply_to: email,
        subject: `Contact Form: ${subject || 'New Message'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message ?? 'Resend API error')
    }

    return res.status(200).json({ success: true })

  } catch (err: unknown) {
    console.error('Email error:', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
