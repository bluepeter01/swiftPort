
import type { RequestHandler } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

const PRIVATE_BREVO_LOGIN = env.PRIVATE_BREVO_LOGIN;
const PRIVATE_BREVO_SMTP_KEY = env.PRIVATE_BREVO_SMTP_KEY;
const PRIVATE_ADMIN_EMAIL = env.PRIVATE_ADMIN_EMAIL;


export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('POST /api/deposit called');

    const body = await request.json();
    console.log('Incoming body:', body);

    const { userId, coin, amount } = body;

    if (!userId || !coin || !amount) {
      console.log('Missing required fields');
      return new Response('userId, coin, and amount are required', { status: 400 });
    }

    const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
    pb.autoCancellation(false);

    console.log('Fetching user from PocketBase...');
    const user = await pb.collection('users').getOne(userId);
    console.log('User fetched:', user);

    console.log('Creating pending transaction...');
    await pb.collection('transactions').create({
      user: userId,
      symbol: coin,
      amount,
      amountType: 'credit',
      credit: true,
      status: 'pending',
      valueUSD: amount
    });
    console.log('Transaction created');

    if (!PRIVATE_BREVO_SMTP_KEY) {
      console.log('No Brevo API key set');
      throw new Error('Brevo API key is not set in server environment variables');
    }

    console.log('Sending email via Brevo API...');
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PRIVATE_BREVO_SMTP_KEY
      },
      body: JSON.stringify({
        sender: { name: 'TeslaStock', email: 'carmenjosh84@gmail.com' },
        to: [{ email: 'carmenjosh84@gmail.com', name: 'Admin' }],
        subject: `New Deposit from ${user.firstName} ${user.lastName}`,
        htmlContent: `
          <p>User <strong>${user.firstName} ${user.lastName}</strong> (${user.email}) has made a deposit.</p>
          <p><strong>Coin:</strong> ${coin}</p>
          <p><strong>Amount Deposited:</strong> ${amount}</p>
          <p>Status: Pending</p>
        `
      })
    });

    console.log('Email response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.log('Brevo API error:', errorText);
      throw new Error(`Brevo API error: ${errorText}`);
    }

    console.log('Email sent successfully');
    return new Response(JSON.stringify({ message: 'Deposit recorded and email sent via Brevo API!' }), { status: 200 });

  } catch (err: any) {
    console.error('Error in /api/deposit:', err);
    return new Response(`Failed to record deposit: ${err.message ?? err}`, { status: 500 });
  }
};
