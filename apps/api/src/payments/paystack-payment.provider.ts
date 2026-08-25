import { Injectable } from '@nestjs/common';
import {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from './payment.provider.interface';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

@Injectable()
export class PaystackPaymentProvider implements PaymentProvider {
  constructor(private readonly config: ConfigService) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input.email,

          // Paystack wants the amount in the currency's smallest subunit —
          // for KES that's cents, so amountCents maps directly (unlike
          // M-Pesa's Daraja API below, which wants whole KES).
          amount: input.amountCents,
          currency: 'KES',
          reference: input.orderId, // ties the Paystack back to our Order
          callback_url: this.config.get('PAYSTACK_CALLBACK_URL'),
        }),
      },
    );

    const body = await response.json();
    if (!body.status) {
      throw new Error(`Paystack initialize failed:${body.message}`);
    }

    return {
      // Paystack's own reference, NOT necessarily input.orderId — Paystack
      // can rewrite/namespace it; always store what Paystack actually
      // returns, use it (not the orderId) to look up the Payment row from
      // the webhook. See the webhook handler below.
      providerReference: body.data.reference,
      clientPayload: { authorizationUrl: body.data.authorization_url },
    };
  }

  // Paystack signs every webhook with HMAC-SHA512 of the raw request body,
  // keyed with your secret key — compare against the x-paystack-signature
  // header. Unlike M-Pesa (see MpesaPaymentProvider), this IS a real
  // cryptographic guarantee the payload came from Paystack unmodified.
  // See security/payment-security.md.

  verifySignature(rawBody: Buffer, signature: string): boolean {
    const expected = createHmac(
      'sha512',
      this.config.getOrThrow('PAYSTACK_SECRET_KEY'),
    )
      .update(rawBody)
      .digest('hex');

    return expected === signature;
  }

  // Independent server-to-server confirmation, called from the webhook
  // handler as defense in depth alongside signature verification — cheap
  // insurance against a compromised/misconfigured secret, not strictly
  // required the way M-Pesa's queryStatus is (Paystack's signature alone
  // is already a strong guarantee).

  async verifyTransaction(reference: string) {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY')}`,
        },
      },
    );

    return response.json();
  }
}
