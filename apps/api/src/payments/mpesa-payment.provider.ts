import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from './payment.provider.interface';

const DARAJA_BASE_URL_SANDBOX = 'https://sandbox.safaricom.co.ke';
const DARAJA_BASE_URL_PRODUCTION = 'https://api.safaricom.co.ke';

@Injectable()
export class MpesaPaymentProvider implements PaymentProvider {
  constructor(private readonly config: ConfigService) {}

  async initialize(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentResult> {
    if (!input.phoneNumber) {
      throw new Error('Phone number is required fpr M-pesa payments');
    }

    const accessToken = await this.getAccessToken();
    const timestamp = this.timestamp();
    const password = this.stkPassword(timestamp);

    const response = await fetch(
      `${this.baseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: this.config.getOrThrow('MPESA_SHORTCODE'),
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(input.amountCents / 100), // Daraja wants whole KES, not cents
          PartyA: this.normalizePhone(input.phoneNumber),
          PartyB: this.config.getOrThrow('MPESA_SHORTCODE'),
          PhoneNumber: this.normalizePhone(input.phoneNumber),
          CallBackURL: this.config.getOrThrow('MPESA_CALLBACK_URL'),
          AccountReference: input.orderId,
          TransactionDesc: `Order ${input.orderId}`,
        }),
      },
    );
    const body = await response.json();
    //ResponseCode "0" here means ONLY "the STK push was sent"-
    // Not that payment succeeded
    if (body.ResponseCode !== '0') {
      throw new Error(`M-pesa STK Push failed:${body.ResponseDescription}`);
    }

    return {
      providerReference: body.CheckoutRequestID,
      clientPayload: {
        checkoutRequestID: body.CheckoutRequestID,
      },
    };
  }
  // Independently re-confirms a transaction's status — the mitigation for
  // M-Pesa callbacks having no signature. See security/payment-security.md.
  // Called from the webhook handler BEFORE trusting the callback body.

  async queryStatus(checkoutRequestId: string) {
    const accessToken = await this.getAccessToken();
    const timestamp = this.timestamp();
    const password = this.stkPassword(timestamp);

    const response = await fetch(`${this.baseUrl()}/mpesa/stkpush/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: this.config.getOrThrow('MPESA_SHORTCODE'),
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    return response.json();
  }

  private async getAccessToken(): Promise<string> {
    // OAuth against Daraja using MPESA_CONSUMER_KEY/MPESA_CONSUMER_SECRET —
    // real implementation caches this token for its ~1hr validity window
    // rather than requesting a fresh one on every STK Push call.
    throw new Error('not implemented — wire Daraja OAuth here');
  }

  private baseUrl() {
    return this.config.get('MPESA_ENV') === 'production'
      ? DARAJA_BASE_URL_PRODUCTION
      : DARAJA_BASE_URL_SANDBOX;
  }

  private timestamp(): string {
    // Daraja wants YYYYMMDDHHmmss
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
  }

  private stkPassword(timestamp: string): string {
    const shortcode = this.config.getOrThrow('MPESA_SHORTCODE');
    const passkey = this.config.getOrThrow('MPESA_PASSKEY');
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  }

  private normalizePhone(phone: string): string {
    // Daraja expects 2547XXXXXXXX, not 07XXXXXXXX or +2547XXXXXXXX.
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.startsWith('254')) return digits;
    return `254${digits}`;
  }
}
