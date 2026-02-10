import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  orgId: string
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: {
      org_id: orgId,
    },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function getInvoices(customerId: string) {
  return stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object);
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object);
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription deleted:', event.data.object);
      break;
    case 'invoice.payment_succeeded':
      console.log('Invoice paid:', event.data.object);
      break;
    case 'invoice.payment_failed':
      console.log('Invoice failed:', event.data.object);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  return event;
}
