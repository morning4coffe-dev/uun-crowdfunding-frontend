import { createContext, useContext, useMemo, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface PaymentContextType {
  stripePromise: Promise<Stripe | null>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Get publishable key from environment or use a placeholder
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Helper to wait for global Stripe and initialize it
const initializeStripe = (): Promise<Stripe | null> => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not configured. Payment features will not work.');
    return Promise.resolve(null);
  }

  // Check if Stripe is already loaded globally (from index.html script tag)
  if (typeof window !== 'undefined' && (window as any).Stripe) {
    return Promise.resolve((window as any).Stripe(STRIPE_PUBLISHABLE_KEY));
  }

  // Wait for global Stripe to load, with fallback to loadStripe
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    const checkStripe = () => {
      if ((window as any).Stripe) {
        resolve((window as any).Stripe(STRIPE_PUBLISHABLE_KEY));
      } else if (attempts >= maxAttempts) {
        loadStripe(STRIPE_PUBLISHABLE_KEY).then(resolve);
      } else {
        attempts++;
        setTimeout(checkStripe, 100);
      }
    };
    checkStripe();
  });
};

export function PaymentProvider({ children }: { children: ReactNode }) {
  const stripePromise = useMemo(() => {
    return initializeStripe();
  }, []);

  return (
    <PaymentContext.Provider value={{ stripePromise }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
