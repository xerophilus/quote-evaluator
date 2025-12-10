# Stripe Billing Portal Setup

## 🚨 Required Setup for Billing Portal

You're seeing this error because the Stripe Customer Portal needs to be configured in your Stripe dashboard:

```
Error: No configuration provided and your test mode default configuration has not been created.
```

## 📋 Step-by-Step Setup Instructions

### 1. **Go to Stripe Dashboard**
- Visit: https://dashboard.stripe.com/test/settings/billing/portal
- Log in to your Stripe account

### 2. **Activate Customer Portal**
- Click **"Activate test link"** or **"Activate customer portal"**
- This creates the default configuration needed for the billing portal

### 3. **Configure Portal Settings (Optional)**
You can customize what customers can do in the portal:

#### **Business Information**
- ✅ Business name
- ✅ Support email
- ✅ Support phone
- ✅ Terms of service URL
- ✅ Privacy policy URL

#### **Features to Enable**
- ✅ **Update payment method** (highly recommended)
- ✅ **View invoice history** (recommended)  
- ✅ **Cancel subscription** (optional - you may want to handle this manually)
- ✅ **Update subscription** (optional - for plan changes)
- ✅ **Proration settings** (for mid-cycle changes)

#### **Invoice Settings**
- ✅ Allow downloading invoices
- ✅ Show payment method on invoices

### 4. **Test the Configuration**
After activation, test that the portal works:
```bash
# In your app, try accessing billing portal
# Should now work without errors
```

## 🎯 **What This Enables**

Once configured, your customers can:

### **Payment Management**
- 💳 Update credit card information
- 📧 Change billing email
- 🏠 Update billing address

### **Subscription Management**  
- 📊 View current plan and usage
- 📅 See next billing date
- 💰 View billing history
- 📄 Download invoices/receipts

### **Self-Service Actions**
- ⏸️ Pause subscription (if enabled)
- ❌ Cancel subscription (if enabled)
- 🔄 Reactivate cancelled subscription
- 📈 Upgrade/downgrade plans (if enabled)

## 🔒 **Security Benefits**

### **PCI Compliance**
- ✅ No card data on your servers
- ✅ Stripe handles all payment processing
- ✅ Enterprise-grade security

### **Fraud Protection**
- ✅ Stripe Radar fraud detection
- ✅ 3D Secure authentication
- ✅ Machine learning fraud prevention

## 🚀 **Production Setup**

When you're ready for production:

1. **Switch to Live Mode**
   - Go to: https://dashboard.stripe.com/settings/billing/portal
   - Configure the portal for live mode

2. **Update Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_live_...  # Your live secret key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Your live publishable key
   ```

3. **Test End-to-End**
   - Create test customer in live mode
   - Process real payment (can refund immediately)
   - Verify portal access works

## 📞 **Support**

If you run into issues:
- **Stripe Documentation**: https://stripe.com/docs/billing/subscriptions/customer-portal
- **Stripe Support**: https://support.stripe.com/
- **QuoteEvaluator Support**: support@quoteevaluator.com

## ✅ **Verification**

After setup, you should see:
- ✅ No more "configuration" errors in your logs
- ✅ Billing portal opens successfully
- ✅ Customers can manage their subscriptions
- ✅ Professional subscription management experience

---

**This is a one-time setup that unlocks enterprise-grade subscription management for your SaaS!** 🎉