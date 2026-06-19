import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export const getCheckoutBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
