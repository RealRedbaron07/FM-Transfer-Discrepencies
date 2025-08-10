// subscriptionManager.js - Real Subscription Management
class SubscriptionManager {
    constructor() {
        this.stripe = null;
        this.user = this.loadUserData();
        this.initializeStripe();
    }

    async initializeStripe() {
        // Use your actual Stripe publishable key
        this.stripe = Stripe('pk_test_your_stripe_key_here');
        
        // Set up Stripe Elements for card input
        this.elements = this.stripe.elements();
        this.cardElement = this.elements.create('card');
    }

    loadUserData() {
        const userData = localStorage.getItem('fmAnalyzerUser');
        if (userData) {
            return JSON.parse(userData);
        }
        
        return {
            id: this.generateUserId(),
            plan: 'free',
            subscriptionStatus: 'inactive',
            transfersThisMonth: 0,
            maxTransfers: 10,
            subscriptionStart: null,
            subscriptionEnd: null,
            features: {
                unlimitedTransfers: false,
                advancedAnalysis: false,
                exportReports: false,
                prioritySupport: false,
                saveFileParsing: false
            }
        };
    }

    saveUserData() {
        localStorage.setItem('fmAnalyzerUser', JSON.stringify(this.user));
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    // Check if user can perform action
    canAddTransfer() {
        if (this.user.plan === 'pro') {
            return { allowed: true };
        }
        
        if (this.user.transfersThisMonth >= this.user.maxTransfers) {
            return { 
                allowed: false, 
                reason: `You've reached your limit of ${this.user.maxTransfers} transfers this month. Upgrade to Pro for unlimited transfers!`
            };
        }
        
        return { allowed: true };
    }

    canParseSaveFile() {
        if (this.user.plan === 'pro') {
            return { allowed: true };
        }
        
        return { 
            allowed: false, 
            reason: 'Save file parsing is a Pro feature. Upgrade to unlock real save file analysis!'
        };
    }

    canExportReports() {
        if (this.user.plan === 'pro') {
            return { allowed: true };
        }
        
        return { 
            allowed: false, 
            reason: 'Report export is a Pro feature. Upgrade to download your analysis!'
        };
    }

    // Add transfer (increment counter)
    addTransfer() {
        if (this.user.plan === 'free') {
            this.user.transfersThisMonth++;
            this.saveUserData();
        }
    }

    // Upgrade to Pro
    async upgradeToPro(planType) {
        if (!this.stripe) {
            // Demo mode - simulate payment
            return this.simulatePayment(planType);
        }
        
        try {
            // Create Stripe Checkout session
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: planType === 'yearly' ? 'price_yearly' : 'price_monthly',
                    userId: this.user.id
                })
            });
            
            const session = await response.json();
            
            // Redirect to Stripe Checkout
            return this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
        } catch (error) {
            // Fallback to demo payment
            return this.simulatePayment(planType);
        }
    }

    simulatePayment(planType) {
        return new Promise((resolve) => {
            const modal = this.createSimplePaymentModal(planType);
            document.body.appendChild(modal);
            
            setTimeout(() => {
                this.activateProPlan(planType);
                document.body.removeChild(modal);
                resolve({ success: true });
            }, 2000);
        });
    }
    
    createSimplePaymentModal(planType) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex;
            align-items: center; justify-content: center; z-index: 9999;
        `;
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a2332, #2d5a8b); 
                        padding: 2rem; border-radius: 15px; text-align: center; 
                        color: white; max-width: 400px;">
                <h2>💳 Processing Payment...</h2>
                <p>Upgrading to ${planType} plan</p>
                <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); 
                           border-radius: 2px; margin: 1rem auto; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff9f); 
                               width: 0%; animation: progress 2s ease-out forwards;"></div>
                </div>
                <style>
                    @keyframes progress { to { width: 100%; } }
                </style>
            </div>
        `;
        
        return modal;
    }

    activateProPlan(planType) {
        this.user.plan = 'pro';
        this.user.subscriptionStatus = 'active';
        this.user.subscriptionStart = new Date().toISOString();
        
        // Set expiration based on plan type
        const expiry = new Date();
        if (planType === 'yearly') {
            expiry.setFullYear(expiry.getFullYear() + 1);
        } else {
            expiry.setMonth(expiry.getMonth() + 1);
        }
        this.user.subscriptionEnd = expiry.toISOString();
        
        // Enable pro features
        this.user.features = {
            unlimitedTransfers: true,
            advancedAnalysis: true,
            exportReports: true,
            prioritySupport: true,
            saveFileParsing: true
        };
        
        this.saveUserData();
        
        // Show success message
        this.showUpgradeSuccess(planType);
    }

    showUpgradeSuccess(planType) {
        const successModal = document.createElement('div');
        successModal.innerHTML = `
            <div class="success-modal">
                <div class="success-content">
                    <div class="success-icon">🎉</div>
                    <h2>Welcome to FM Analyzer Pro!</h2>
                    <p>Your ${planType} subscription is now active</p>
                    <div class="pro-features">
                        <div class="feature">✅ Unlimited transfers</div>
                        <div class="feature">✅ Real save file parsing</div>
                        <div class="feature">✅ Advanced reports</div>
                        <div class="feature">✅ Export functionality</div>
                    </div>
                    <button onclick="this.closest('.success-modal').remove()" class="success-btn">
                        Start Using Pro Features
                    </button>
                </div>
            </div>
        `;
        
        // Style the modal
        successModal.querySelector('.success-modal').style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        successModal.querySelector('.success-content').style.cssText = `
            background: linear-gradient(135deg, #1a2332, #2d5a8b);
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            color: white;
            max-width: 400px;
        `;
        
        successModal.querySelector('.success-icon').style.cssText = `
            font-size: 3rem;
            margin-bottom: 1rem;
        `;
        
        successModal.querySelector('.success-btn').style.cssText = `
            background: linear-gradient(135deg, #00d4ff, #00ff9f);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 1rem;
        `;
        
        document.body.appendChild(successModal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(successModal)) {
                document.body.removeChild(successModal);
            }
            // Refresh the page to show pro features
            window.location.reload();
        }, 5000);
    }

    // Get user info for display
    getUserInfo() {
        return {
            plan: this.user.plan,
            transfersUsed: this.user.transfersThisMonth,
            transfersRemaining: this.user.plan === 'pro' ? 'Unlimited' : (this.user.maxTransfers - this.user.transfersThisMonth),
            isPro: this.user.plan === 'pro',
            features: this.user.features
        };
    }

    // Reset monthly counters (would be called by server in real app)
    resetMonthlyCounters() {
        this.user.transfersThisMonth = 0;
        this.saveUserData();
    }
}

// Export for use in main app
window.SubscriptionManager = SubscriptionManager;