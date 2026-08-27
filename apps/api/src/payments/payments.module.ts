import {Module} from "@nestjs/common";
import {InventoryModule} from "../inventory/inventory.module";
import {PaystackPaymentProvider} from "./paystack-payment.provider";
import {MpesaPaymentProvider} from "./mpesa-payment.provider";
import {PAYMENT_PROVIDER} from "./payment.provider.interface";



@Module([
    imports:[InventoryModule],
    controllers:[WebhooksController],

    providers:[
        PaystackPaymentProvider,
    MpesaPaymentProvider,
    {
        provide:PAYMENT_PROVIDER,
        inject:[PaystackPaymentProvider,MpesaPaymentProvider],
        useFactory:(paystack:PaystackPaymentProvider,mpesa:MpesaPaymentProvider)=>(
            {
                // Keys match the Prisma PaymentProvider enum (database/schema.md)
                // — CARD is the rail, Paystack is the concrete implementation
                // behind it.
                CARD: paystack,
                MPESA: mpesa,
            }
        )
    }
],
    exports:[PAYMENT_PROVIDER]
])
export class PaymentsModule{}