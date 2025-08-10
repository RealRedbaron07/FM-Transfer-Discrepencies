// server.js - Simple Express backend
const express = require('express');
const stripe = require('stripe')('sk_live_your_stripe_secret_key');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Payment endpoint
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { planType, userId } = req.body;
        
        const amount = planType === 'yearly' ? 9999 : 999; // $99.99 or $9.99
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: { userId, planType }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for subscription updates
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        // Update user subscription in database
        console.log('Payment succeeded:', event.data.object);
    }

    res.json({received: true});
});

app.listen(3000, () => {
    console.log('FM Analyzer API running on port 3000');
});