// src/routes/api/pay/[tracking_number]/+server.ts
import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://your-pocketbase-url'); // or local dev

export async function POST({ params }) {
  const { tracking_number } = params;

  try {
    const record = await pb.collection('shipments').getFirstListItem(`tracking_number="${tracking_number}"`);

    await pb.collection('shipments').update(record.id, {
      payment_status: 'paid'
    });

    return json({ success: true });
  } catch (err) {
    console.error(err);
    return json({ error: 'Payment update failed' }, { status: 500 });
  }
}
