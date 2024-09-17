import { Inject, Injectable } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ) { }

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
        const { currency, items } = paymentSessionDto;
        const lineItems = items.map((i) => {
            return {
                price_data: {
                    currency,
                    product_data: {
                        name: i.name,
                    },
                    unit_amount: Math.round(i.price * 100),
                },
                quantity: i.quantity
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            payment_intent_data: {
                metadata: {
                    orderId: paymentSessionDto.orderId
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.urlSuccess,
            cancel_url: envs.urlCancel
        });
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        };
    }


    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        try {
            const endpointSecret = envs.enpointSecret
            let event: Stripe.Event;

            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
            switch (event.type) {
                case 'charge.succeeded':
                    const chargeSucceeded = event.data.object;
                    const payload = {
                        stripePaymentId: chargeSucceeded.id,
                        orderId: chargeSucceeded.metadata.orderId,
                        receiptUrl: chargeSucceeded.receipt_url
                    }
                    this.client.emit('payment.succeeded', payload);
                    break;

                default:
                    break;
            }

            return res.status(200).json({ sig });

        } catch (error) {
            console.log('error', error);

            res.status(400).send(`Error #${error.message}`);
            return;
        }
    }
}
