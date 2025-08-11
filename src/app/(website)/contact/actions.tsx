'use server'

//import { redirect } from 'next/navigation'

export default async function SendMessage(formData: FormData) {
  'use server'

  const req = {
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message')
  }
  console.log(req)
  try {
    const res = await fetch('url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req)
    })

    if (!res.ok) {
      throw new Error('Failed to send message')
    }
  } catch (error) {
    console.log(error)
  }
  //redirect(`/contact/send`)
}