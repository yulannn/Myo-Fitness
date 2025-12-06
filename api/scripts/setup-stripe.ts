import { Stripe } from 'stripe';

// Configuration
const STRIPE_SECRET_KEY = 'sk_test_51SbR6fELDhgIJCJn2oEmh1rVuqBDDDP9CPkse3lCLNrJjxND4FiSbzf1fbukwgglMZQYuE6IPkMKglVV5itOohbf00afSjX06a';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia' as any,
});

async function setupStripe() {
    console.log('🚀 Starting Stripe setup...');

    try {
        // 1. Create Product
        console.log('Creating Product...');
        const product = await stripe.products.create({
            name: 'MyoFitness Premium',
            description: 'Accès complet à toutes les fonctionnalités Premium de MyoFitness',
        });
        console.log(`✅ Product created: ${product.id}`);

        // 2. Create Monthly Price
        console.log('Creating Monthly Price...');
        const monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: 999, // 9.99 EUR
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
            metadata: {
                plan: 'monthly'
            }
        });
        console.log(`✅ Monthly Price created: ${monthlyPrice.id}`);

        // 3. Create Yearly Price
        console.log('Creating Yearly Price...');
        const yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: 9999, // 99.99 EUR
            currency: 'eur',
            recurring: {
                interval: 'year',
            },
            metadata: {
                plan: 'yearly'
            }
        });
        console.log(`✅ Yearly Price created: ${yearlyPrice.id}`);

        console.log('\n🎉 Setup complete! Please update your .env file with these values:');
        console.log('----------------------------------------');
        console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
        console.log(`STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('❌ Error setup Stripe:', error);
    }
}

setupStripe();
