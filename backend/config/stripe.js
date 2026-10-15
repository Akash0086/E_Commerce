import Stripe from 'Stripe';

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;