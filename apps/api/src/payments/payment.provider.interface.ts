export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface InitiatePaymentInput {
  amountCents: number;
  orderId: string;
  email: string; //paystack requires a customers email on initialize
  phoneNumber?: string; //Mpesa
}

export interface InitiatePaymentResult {
  providerReference: string;
  // Whatever the client needs to complete payment — Paystack's
  // authorization_url (redirect the customer there, or open it in
  // Paystack Inline) for CARD, a checkoutRequestId for MPESA (so the
  // frontend can show "check your phone" and wait for the webhook-driven
  // status change).
  clientPayload: Record<string, unknown>;
}

// One thin interface so a new provider can be added later without
// touching CheckoutService at all — see modules/checkout.md, which depends
// only on this interface, never a concrete provider.
export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
