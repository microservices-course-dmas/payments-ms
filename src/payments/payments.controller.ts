import { Body, Controller, Get, Post, Req, Res, } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }


  //@Post('create-payment-session')
  @MessagePattern('create.payment.session')
  async createPaymentSession(
    @Payload() paymentSessionDto: PaymentSessionDto
  ) {    
    return await this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true, message: 'Payment successful'
    }
  }

  @Get('cancel')
  cancel() {
    return { msg: 'Payment cancelled', ok: false, }
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: any) {
    this.paymentsService.stripeWebhook(req, res);
    return dto;
  }

}
