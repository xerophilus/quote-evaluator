# Conversion Tracking & Optimization Setup Guide

## Overview
This guide covers the complete setup of conversion tracking and optimization tools for QuoteEvaluator.com, designed to help achieve and exceed the $150/day revenue goal.

## 1. Google Analytics 4 Setup

### Creating GA4 Property
1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property: "QuoteEvaluator"
3. Set up data stream for web
4. Copy your Measurement ID (G-XXXXXXXXXX)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-YOUR-ID-HERE
   ```

### Conversion Events Configuration
The following conversion events are automatically tracked:

| Event Name | Value | Description |
|------------|-------|-------------|
| `quote_uploaded` | $0 | User uploads/pastes a quote |
| `purchase` | $4.99-$9.99 | Payment completed |
| `sign_up` | $5 | Email signup (lead value) |
| `begin_checkout` | Variable | Checkout initiated |

### Enhanced Ecommerce Tracking
- View item events for pricing pages
- Add to cart for analysis selection
- Purchase events with transaction details
- Revenue tracking by traffic source

### Traffic Source Attribution
UTM parameters are automatically tracked:
- `utm_source`: Traffic source (google, facebook, etc.)
- `utm_medium`: Medium (cpc, organic, email)
- `utm_campaign`: Campaign name
- `utm_term`: Keywords (for paid search)
- `utm_content`: Ad/content variant

Example URL:
```
https://quoteevaluator.com?utm_source=google&utm_medium=cpc&utm_campaign=kitchen_remodel&utm_term=contractor+quote+analysis
```

## 2. Hotjar Setup

### Account Setup
1. Sign up at [Hotjar.com](https://hotjar.com)
2. Create new site: quoteevaluator.com
3. Copy your Site ID
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_HOTJAR_ID=YOUR-SITE-ID
   ```

### Heatmap Configuration
Automatically tracks:
- Click heatmaps on all pages
- Scroll depth heatmaps
- Move heatmaps (desktop only)
- Rage click detection

### Session Recordings
Records user sessions with:
- Form interaction tracking
- Funnel drop-off tagging
- Frustration signal detection
- Conversion path analysis

### Feedback Widgets
Configure polls for:
- Exit intent feedback
- Post-purchase surveys
- NPS scoring
- Feature requests

## 3. A/B Testing Framework

### Active Experiments

#### Pricing Test
- **Control**: $4.99
- **Variant A**: $7.99 (25% traffic)
- **Variant B**: $9.99 (25% traffic)

#### Button Color Test
- **Control**: Blue (#3B82F6)
- **Variant A**: Green (#10B981)
- **Variant B**: Orange (#F59E0B)

#### Button Text Test
- **Control**: "Get Pro Analysis"
- **Variant A**: "Unlock Full Report"
- **Variant B**: "See Hidden Savings"
- **Variant C**: "Get Instant Analysis"

#### Headline Test
- **Control**: Original headline
- **Variant A**: Save money focus
- **Variant B**: Trust focus
- **Variant C**: Urgency focus

### Using A/B Tests in Components

```typescript
import { useABTest } from '@/hooks/useABTest';

function PricingComponent() {
  const { value: price, trackConversion } = useABTest('PRICING_TEST');
  
  const handlePurchase = () => {
    trackConversion('purchase', price);
    // ... purchase logic
  };
  
  return <span>${price}</span>;
}
```

### Force Variants (Testing)
In browser console:
```javascript
// Force specific variant
localStorage.setItem('ab_experiments', JSON.stringify({
  PRICING_TEST: 'variant_a'
}));

// Clear all experiments
localStorage.removeItem('ab_experiments');
```

## 4. Admin Dashboard

### Access
Navigate to `/admin` and enter the admin key (default: `admin123`)

### Metrics Available
- **Real-time Revenue**: Today, week, month totals
- **Conversion Rates**: Overall and by traffic source
- **Funnel Analysis**: Drop-off points visualization
- **Quote Types**: Popular project categories
- **A/B Test Results**: Performance by variant
- **Activity Feed**: Real-time user actions

### Exporting Data
Click "Export" button to download:
- Complete metrics JSON
- Experiment results
- User journey data

## 5. Conversion Optimization Tips

### Quick Wins
1. **Urgency Messaging**: Test countdown timers
2. **Social Proof**: Add recent activity notifications
3. **Trust Badges**: Display security/satisfaction guarantees
4. **Exit Intent**: Capture leaving visitors with discounts

### Traffic Source Optimization
- **Google Ads**: Use project-specific landing pages
- **Facebook**: Emphasize social proof and savings
- **Organic**: Focus on trust and authority
- **Direct**: Highlight returning user benefits

### Funnel Optimization Priority
1. **Landing → Upload**: Reduce friction, add trust signals
2. **Upload → Analysis**: Show progress, build anticipation
3. **Analysis → Checkout**: Emphasize value, create urgency
4. **Checkout → Complete**: Simplify process, add guarantees

## 6. Revenue Tracking Formula

### Daily Revenue Goal: $150

**Calculation**:
```
Daily Revenue = Visitors × Conversion Rate × Average Order Value

Example:
1000 visitors × 3.8% conversion × $4.99 = $189.62
```

### Key Metrics to Monitor
- **Traffic**: Aim for 1000+ daily visitors
- **Conversion Rate**: Target 3-5%
- **AOV**: Increase through upsells and rush pricing
- **LTV**: Build through subscriptions and repeat purchases

## 7. Implementation Checklist

- [ ] Set up GA4 property and add Measurement ID
- [ ] Configure conversion events in GA4
- [ ] Create Hotjar account and add Site ID
- [ ] Set up heatmaps for key pages
- [ ] Configure session recordings
- [ ] Review A/B test variants
- [ ] Access admin dashboard
- [ ] Set up UTM tracking for campaigns
- [ ] Configure goal tracking
- [ ] Test conversion tracking

## 8. Troubleshooting

### GA4 Not Tracking
1. Check Measurement ID in `.env.local`
2. Verify gtag installation in browser console:
   ```javascript
   window.gtag
   ```
3. Use GA4 DebugView for real-time testing

### Hotjar Not Recording
1. Verify Site ID is correct
2. Check for ad blockers
3. Ensure cookies are enabled
4. Test in incognito mode

### A/B Tests Not Working
1. Clear localStorage
2. Check experiment is active
3. Verify variant weights total 100%
4. Test in different browser

## 9. Advanced Features

### Custom Events
```javascript
// Track custom conversion
window.gtag('event', 'custom_action', {
  value: 10,
  custom_parameter: 'test'
});

// Track in Hotjar
window.hj('event', 'custom_action');
```

### User Properties
```javascript
// Set user properties for segmentation
window.gtag('set', 'user_properties', {
  user_type: 'premium',
  lifetime_value: 50
});
```

### Enhanced Measurement
GA4 automatically tracks:
- Scroll depth (90%)
- Outbound clicks
- Site search
- Video engagement
- File downloads

## 10. Monitoring & Alerts

### Set Up Alerts For:
- Conversion rate drops below 2%
- Daily revenue below $100
- High bounce rate (>70%)
- Checkout abandonment >50%

### Weekly Review Checklist
- [ ] Check conversion rates by source
- [ ] Review A/B test results
- [ ] Analyze funnel drop-offs
- [ ] Monitor page load speeds
- [ ] Review Hotjar recordings
- [ ] Update experiments

## Support

For additional help:
- GA4 Documentation: https://support.google.com/analytics
- Hotjar Help: https://help.hotjar.com
- A/B Testing Best Practices: https://vwo.com/ab-testing/

---

**Remember**: The goal is continuous improvement. Small gains compound - a 1% conversion increase at scale = significant revenue growth!