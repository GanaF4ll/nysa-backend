import { Controller, Get, Post, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('connect')
  async createConnectedAccount(@Req() request: Request) {
    const user_id = request['user'].id;
    return this.stripeService.createConnectedAccount(user_id);
  }
}
