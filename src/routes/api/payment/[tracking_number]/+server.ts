import PocketBase from 'pocketbase';
import { json, error } from '@sveltejs/kit';

const pb = new PocketBase('http://127.0.0.1:8090');

export async function GET({ params }) {
  const { tracking_number } = params;

  if (!tracking_number) throw error(400, 'Tracking number is required');

  try {
    const records = await pb.collection('shipments').getList(1, 1, {
      filter: `tracking_number="${tracking_number}"`,
    });

    if (!records.items.length) throw error(404, `Payment details not found`);

    const shipment = records.items[0];

    return json({
      tracking_number: shipment.tracking_number,
      amount_due: shipment.amount_due,
      payment_status: shipment.payment_status,
      payment_reason: shipment.payment_reason,
    });
  } catch (err) {
    console.error('Error fetching payment details:', err);
    throw error(500, err.message || 'Server error');
  }
}
