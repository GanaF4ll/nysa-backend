import { Controller, Get, Post, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('connect')
  @ApiOperation({
    summary:
      "Crée un compte Stripe connecté. Si l'utilisateur a déjà un compte Stripe, renvoie le lien de connexion.",
  })
  async createConnectedAccount(@Req() request: Request) {
    const user_id = request['user'].id;
    return this.stripeService.createConnectedAccount(user_id);
  }
}
