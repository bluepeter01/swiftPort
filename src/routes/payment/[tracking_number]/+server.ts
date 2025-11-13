import PocketBase from 'pocketbase';
import { json, error } from '@sveltejs/kit';

// const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
const pb = new PocketBase('https://playgzero.pb.itcass.net');

export async function GET({ params }) {
  const { tracking_number } = params;

  if (!tracking_number) throw error(400, 'Tracking number is required');

  try {
    // 👇 More flexible query
    const records = await pb.collection('shipments').getList(1, 1, {
      filter: `tracking_number="${tracking_number}"`,
    });

    if (!records.items.length) {
      throw error(404, `No record found for tracking number: ${tracking_number}`);
    }

    const record = records.items[0];

    return json({
      tracking_number: record.tracking_number,
      amount_due: record.amount_due,
      payment_status: record.payment_status,
      payment_reason: record.payment_reason,
    });
  } catch (err) {
    console.error('Error fetching payment details:', err);
    throw error(500, err.message || 'Error fetching payment details');
  }
}
