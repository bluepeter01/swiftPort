import PocketBase from 'pocketbase';
import { error, json } from '@sveltejs/kit';

const pb = new PocketBase('https://jpi.sophnexacademy.com.ng/_/'); // Ensure correct PocketBase URL

export const GET = async ({ params }) => {
  const { trackingCode } = params;

  if (!trackingCode) throw error(400, 'Tracking code is required');

  try {
    const shipment = await pb.collection('shipments').getFirstListItem(
      `tracking_number="${trackingCode}"`,
      { expand: 'history' }
    );

    if (!shipment) throw error(404, 'Tracking code not found');

    return json({
        id: shipment.id,
      tracking_number: shipment.tracking_number,
      status: shipment.status,
      current_location: shipment.current_location,
      estimated_delivery: shipment.estimated_delivery,
      history: shipment.history || [],
      // Added fields:
      origin: shipment.origin,
      destination: shipment.destination,
      sender_name: shipment.sender_name,
      receiver_name: shipment.receiver_name,
      package_contents: shipment.package_contents,
      weight: shipment.weight,
      amount_due: shipment.amount_due,
      payment_status: shipment.payment_status,
      payment_reason: shipment.payment_reason,
      package_images: shipment.package_images,
      receiver_phone: shipment.receiver_phone,
      receiver_email: shipment.receiver_email
    });
  } catch (err) {
    console.error(err);
    throw error(500, 'Failed to fetch tracking data');
  }
};
