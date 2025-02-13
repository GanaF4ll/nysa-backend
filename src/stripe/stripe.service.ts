import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
    );
  }

  async createConnectedAccount({
    user_id,
  }: {
    user_id: string;
  }): Promise<{ accountLink: string }> {
    const existingUser = await this.prismaService.users.findUniqueOrThrow({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        stripe_account_id: true,
        email: true,
      },
    });

    if (existingUser.stripe_account_id) {
      const accountLink = await this.createAccountLink({
        stripe_account_id: existingUser.stripe_account_id,
      });
      return { accountLink: accountLink.url };
    }

    const stripeAccount = await this.stripe.accounts.create({
      type: 'express',
      email: existingUser.email,
      default_currency: 'EUR',
    });

    await this.prismaService.users.update({
      where: {
        id: existingUser.id,
      },
      data: {
        stripe_account_id: stripeAccount.id,
      },
    });

    const accountLink = await this.createAccountLink({
      stripe_account_id: stripeAccount.id,
    });

    return { accountLink: accountLink.url };
  }

  async createAccountLink({
    stripe_account_id,
  }: {
    stripe_account_id: string;
  }) {
    return await this.stripe.accountLinks.create({
      account: stripe_account_id,
      refresh_url: 'http://localhost:3000/onboarding',
      return_url: 'http://localhost:3000',
      type: 'account_onboarding',
    });
  }
}
