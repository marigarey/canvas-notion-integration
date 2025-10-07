'use server'

import { redirect } from 'next/navigation'

export default async function sendMessage(formData: FormData) {
  'use server'
  const validatedReq = {
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message')
  }
  try {
    const res = await fetch('url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedReq)
    })

    if (!res.ok) {
      throw new Error('Failed to send message')
    }
  } catch (error) {
    console.log(error)
  }
  redirect(`/contact/send`)
}