export async function sendLoginCode(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    throw new Error('Email is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your Frontier Tech Hub login code',
      text: `Your login code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    throw new Error('Resend could not send the login code');
  }
}
