import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);

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
        return session;
    }


    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        try {
            const endpointSecret = envs.enpointSecret
            let event: Stripe.Event;

            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);

            switch (event.type) {
                case 'charge.succeeded':
                    console.log('metadata', { object: event.data.object.metadata });
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
