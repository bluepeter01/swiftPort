import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fire-and-forget approach: respond immediately to the frontend
    const response = new Response(
      JSON.stringify({ success: true, message: 'Wire request received' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    (async () => {
      try {
        // Make sure to use the REST API key here
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.PRIVATE_BREVO_API_KEY || ''
          },
          body: JSON.stringify({
            sender: { email: process.env.PRIVATE_BREVO_LOGIN, name: 'SwiftPort' },
            to: [{ email: process.env.PRIVATE_ADMIN_EMAIL }],
            subject: 'New Wire Transfer Request',
            htmlContent: `
              <p>Hi Admin,</p>
              <p>Someone requested bank account details for wire transfer.</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
          })
        });

        const data = await res.json();
        console.log('Brevo API response:', data);
      } catch (err) {
        console.error('Failed to send wire request email:', err);
      }
    })();

    return response;
  } catch (err: any) {
    console.error('Wire request error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
