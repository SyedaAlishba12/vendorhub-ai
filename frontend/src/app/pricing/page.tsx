'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  X,
  RefreshCw,
  CreditCard,
  Bell,
  Star,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../../utils/api/apiClient';

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;
  

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  annual_price: number | null;
  max_rfqs: number;
  max_saved_vendors: number;
  ai_recommendations: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  is_active: boolean;
  order: number;
}

interface SubscriptionData {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  is_trial: boolean;
  trial_ends_at: string | null;
  plan: Plan | null;
}

interface PaymentIntentData {
  id: string;
  client_secret: string;
  status: string;
}

/*
 * Stripe Checkout Form
 */
function StripeCheckoutForm({
  plan,
  paymentIntent,
  onSuccess,
  onCancel,
}: {
  plan: Plan;
  paymentIntent: PaymentIntentData;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe is still loading. Please try again.');
      return;
    }

    try {
      setProcessing(true);
      setPaymentError(null);

      const { error, paymentIntent: confirmedPayment } =
        await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

      if (error) {
        setPaymentError(
          error.message || 'Payment could not be completed.'
        );
        return;
      }

      if (
        confirmedPayment &&
        confirmedPayment.status === 'succeeded'
      ) {
        onSuccess();
      } else if (
        confirmedPayment &&
        confirmedPayment.status === 'processing'
      ) {
        setPaymentError(
          'Your payment is being processed. Please wait before trying again.'
        );
      } else {
        setPaymentError(
          'Payment was not completed. Please try again.'
        );
      }
    } catch (err: any) {
      setPaymentError(
        err?.message || 'An unexpected payment error occurred.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />

            <h2 className="text-base font-black text-slate-900">
              Complete Payment
            </h2>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Subscribe to the{' '}
            <span className="font-bold text-slate-900">
              {plan.name}
            </span>{' '}
            plan for ${plan.price}/month.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Total
          </p>

          <p className="text-xl font-black text-indigo-600">
            ${plan.price}
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-3">
          <p className="text-xs text-rose-700 font-semibold">
            {paymentError}
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handlePayment}
          disabled={!stripe || !elements || processing}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing
            ? 'Processing Payment...'
            : `Pay $${plan.price}`}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

        <p className="text-[10px] text-slate-400">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);

  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState('stripe');

  /*
   * Selected plan waiting for payment
   */
  const [selectedPlan, setSelectedPlan] =
    useState<Plan | null>(null);

  /*
   * Stripe PaymentIntent returned by backend
   */
  const [paymentIntent, setPaymentIntent] =
    useState<PaymentIntentData | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const plansRes = await apiClient.get('/plans');
      setPlans(plansRes.data);

      try {
        const subRes = await apiClient.get('/subscription');
        setSubscription(subRes.data);
      } catch (e) {
        setSubscription(null);
      }

      try {
        const billRes = await apiClient.get('/billing/history');
        setBillingHistory(billRes.data);
      } catch (e) {
        setBillingHistory([]);
      }

      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to load data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*
   * Start payment process
   */
  const handleSubscribe = async (plan: Plan) => {
    try {
      setActionLoading(true);
      setMessage(null);
      setError(null);

      /*
       * Free plan does not require Stripe payment.
       */
      if (plan.price <= 0) {
        await apiClient.post(`/subscription?plan_id=${plan.id}`);

        setMessage(
          `${plan.name} plan activated successfully!`
        );

        const subRes = await apiClient.get('/subscription');
        setSubscription(subRes.data);

        return;
      }

      /*
       * Paid plan:
       * Create Stripe PaymentIntent first.
       */
      if (!stripePublishableKey || !stripePromise) {
        setError(
          'Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.'
        );
        return;
      }

      const paymentRes = await apiClient.post('/payment', {
        amount: plan.price,
        currency: 'USD',
        description: `VendorHub AI - ${plan.name} Subscription`,
      });

      const paymentData = paymentRes.data?.data;

      if (!paymentData?.client_secret) {
        throw new Error(
          'Stripe did not return a client secret.'
        );
      }

      setSelectedPlan(plan);
      setPaymentIntent(paymentData);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to initialize payment.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Payment successful
   *
   * Only after Stripe confirms the payment do we
   * activate the subscription.
   */
  const handlePaymentSuccess = async () => {
    if (!selectedPlan) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await apiClient.post(
        `/subscription?plan_id=${selectedPlan.id}`
      );

      setMessage(
        `Payment successful! Your ${selectedPlan.name} subscription is now active.`
      );

      setSelectedPlan(null);
      setPaymentIntent(null);

      const subRes = await apiClient.get('/subscription');
      setSubscription(subRes.data);

      try {
        const billRes = await apiClient.get('/billing/history');
        setBillingHistory(billRes.data);
      } catch (e) {
        // Billing history refresh is optional.
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Payment succeeded, but the subscription could not be activated. Please contact support.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Cancel Stripe payment screen
   */
  const handleCancelPayment = () => {
    setSelectedPlan(null);
    setPaymentIntent(null);
    setMessage(null);
    setError(null);
  };

  /*
   * Cancel subscription
   */
  const handleCancel = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      setError(null);

      await apiClient.delete('/subscription');

      setMessage('Subscription cancelled.');

      const subRes = await apiClient.get('/subscription');
      setSubscription(subRes.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to cancel subscription'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error && !selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-md">
          <p className="text-sm text-rose-700">
            {error}
          </p>

          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Pricing Plans
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Choose a plan that fits your business.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && selectedPlan && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />

                  {subscription.status === 'active'
                    ? 'Current Subscription'
                    : 'Subscription'}
                </h2>

                <div className="mt-2 space-y-1">

                  <p className="text-xs text-slate-500">
                    Plan:{' '}
                    <span className="font-bold text-slate-900">
                      {subscription.plan?.name || 'Free'}
                    </span>
                  </p>

                  <p className="text-xs text-slate-500">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        subscription.status === 'active'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </p>

                  {subscription.is_trial &&
                    subscription.trial_ends_at && (
                      <p className="text-xs text-amber-600 font-bold">
                        Trial ends:{' '}
                        {subscription.trial_ends_at.slice(0, 10)}
                      </p>
                    )}

                  {subscription.renewal_date && (
                    <p className="text-xs text-slate-500">
                      Renewal date:{' '}
                      <span className="font-bold text-slate-900">
                        {subscription.renewal_date.slice(0, 10)}
                      </span>
                    </p>
                  )}

                  {/* Renewal Reminder */}
                  {subscription.renewal_date &&
                    subscription.status === 'active' &&
                    (() => {
                      const renewDate = new Date(
                        subscription.renewal_date
                      );

                      const now = new Date();

                      const days = Math.ceil(
                        (renewDate.getTime() -
                          now.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      if (days > 0 && days <= 7) {
                        return (
                          <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Renewal in {days} day(s)
                          </p>
                        );
                      }

                      return null;
                    })()}

                  {/* Cancelled Message */}
                  {subscription.status === 'cancelled' && (
                    <p className="text-xs text-rose-600 font-semibold mt-2">
                      Your subscription has been cancelled. Choose a
                      plan below to activate a new subscription.
                    </p>
                  )}
                </div>
              </div>

              {/* Cancel Button */}
              {subscription.status === 'active' &&
                subscription.plan?.slug !== 'free' && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 disabled:opacity-50"
                  >
                    {actionLoading
                      ? 'Cancelling...'
                      : 'Cancel Subscription'}
                  </button>
                )}
            </div>
          </div>
        )}

        {/* Stripe Payment */}
        {selectedPlan &&
          paymentIntent &&
          stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentIntent.client_secret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#4f46e5',
                    borderRadius: '10px',
                  },
                },
              }}
            >
              <StripeCheckoutForm
                plan={selectedPlan}
                paymentIntent={paymentIntent}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancelPayment}
              />
            </Elements>
          )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {plans.map((plan) => {

            /*
             * A plan is only considered the current plan when
             * the subscription is ACTIVE.
             */
            const isCurrent =
              subscription?.status === 'active' &&
              subscription?.plan_id === plan.id;

            const isPopular = plan.slug === 'pro';

            /*
             * Only use the subscription price when active.
             */
            const currentPrice =
              subscription?.status === 'active'
                ? subscription.plan?.price || 0
                : 0;

            const buttonLabel = isCurrent
              ? 'Current Plan'
              : subscription?.status !== 'active'
              ? 'Choose Plan'
              : plan.price > currentPrice
              ? 'Upgrade'
              : 'Downgrade';

            const isSelected =
              selectedPlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all ${
                  isPopular
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl transform lg:scale-105'
                    : isCurrent
                    ? 'bg-white border-indigo-400 text-slate-900 shadow-md'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-400 text-slate-900 shadow-md'
                    : 'bg-white border-slate-200/80 text-slate-900'
                }`}
              >

                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-bold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-black">
                  {plan.name}
                </h3>

                <p
                  className={`text-xs mt-1 ${
                    isPopular
                      ? 'text-indigo-100'
                      : 'text-slate-500'
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline gap-1">

                    <span className="text-3xl font-black">
                      ${plan.price}
                    </span>

                    <span
                      className={`text-xs ${
                        isPopular
                          ? 'text-indigo-100'
                          : 'text-slate-500'
                      }`}
                    >
                      /month
                    </span>

                  </div>
                </div>

                {/* Plan Button */}
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={
                    actionLoading ||
                    isCurrent ||
                    isSelected
                  }
                  className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-indigo-200 text-indigo-700 cursor-not-allowed'
                      : isPopular
                      ? 'bg-white text-indigo-600 hover:bg-slate-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {actionLoading
                    ? 'Processing...'
                    : isSelected
                    ? 'Payment Selected'
                    : buttonLabel}
                </button>

                {/* Features */}
                <div
                  className={`space-y-2 pt-4 border-t mt-4 ${
                    isPopular
                      ? 'border-indigo-400/30'
                      : 'border-slate-100'
                  }`}
                >
                  {[
                    {
                      label: 'RFQs',
                      value:
                        plan.max_rfqs >= 0
                          ? plan.max_rfqs
                          : 'Unlimited',
                    },
                    {
                      label: 'Saved Vendors',
                      value:
                        plan.max_saved_vendors >= 0
                          ? plan.max_saved_vendors
                          : 'Unlimited',
                    },
                    {
                      label: 'AI Recommendations',
                      value: plan.ai_recommendations
                        ? '✓'
                        : '✗',
                    },
                    {
                      label: 'Priority Support',
                      value: plan.priority_support
                        ? '✓'
                        : '✗',
                    },
                    {
                      label: 'Advanced Analytics',
                      value: plan.advanced_analytics
                        ? '✓'
                        : '✗',
                    },
                    {
                      label: 'API Access',
                      value: plan.api_access
                        ? '✓'
                        : '✗',
                    },
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="flex justify-between text-xs"
                    >
                      <span>{feature.label}</span>

                      <span
                        className={`font-bold ${
                          feature.value === '✓'
                            ? 'text-emerald-500'
                            : feature.value === '✗'
                            ? 'text-slate-400'
                            : ''
                        }`}
                      >
                        {feature.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Compare Plans
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">

                  <th className="py-3 px-4">
                    Features
                  </th>

                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className="py-3 px-4 text-center"
                    >
                      {p.name}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {[
                  { key: 'price', label: 'Monthly Price' },
                  { key: 'max_rfqs', label: 'RFQs' },
                  {
                    key: 'max_saved_vendors',
                    label: 'Saved Vendors',
                  },
                  {
                    key: 'ai_recommendations',
                    label: 'AI Recommendations',
                  },
                  {
                    key: 'priority_support',
                    label: 'Priority Support',
                  },
                  {
                    key: 'advanced_analytics',
                    label: 'Advanced Analytics',
                  },
                  {
                    key: 'api_access',
                    label: 'API Access',
                  },
                ].map((feature) => (

                  <tr key={feature.key}>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {feature.label}
                    </td>

                    {plans.map((p) => {

                      let value: any =
                        p[feature.key as keyof Plan];

                      if (feature.key === 'price') {
                        value = `$${p.price}`;
                      }

                      if (
                        feature.key === 'max_rfqs' ||
                        feature.key === 'max_saved_vendors'
                      ) {
                        value =
                          value === -1
                            ? 'Unlimited'
                            : value;
                      }

                      if (typeof value === 'boolean') {
                        value = value ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300 mx-auto" />
                        );
                      }

                      return (
                        <td
                          key={p.id}
                          className="py-3 px-4 text-center"
                        >
                          <span className="font-medium">
                            {value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method UI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">

          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-indigo-500" />
            Payment Method
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Select your preferred payment method.
          </p>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">

            {['stripe', 'paypal', 'wise'].map((method) => (

              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === method
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >

                <p className="text-sm font-bold capitalize">
                  {method}
                </p>

                <p className="text-[10px] mt-1">
                  {paymentMethod === method
                    ? 'Selected'
                    : 'Available'}
                </p>

              </button>
            ))}
          </div>

          {paymentMethod !== 'stripe' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 font-semibold">
                {paymentMethod === 'paypal'
                  ? 'PayPal integration is not available yet.'
                  : 'Wise integration is not available yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Billing History
            </h2>
          </div>

          {billingHistory.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              No billing history yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">

                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">

                    <th className="py-3 px-4">
                      Date
                    </th>

                    <th className="py-3 px-4">
                      Amount
                    </th>

                    <th className="py-3 px-4">
                      Status
                    </th>

                    <th className="py-3 px-4">
                      Method
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {billingHistory.map((item) => (

                    <tr key={item.id}>

                      <td className="py-3 px-4">
                        {item.billing_date?.slice(0, 10) ||
                          'N/A'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${item.amount}
                      </td>

                      <td className="py-3 px-4">

                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'success'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="py-3 px-4">
                        {item.payment_method}
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}