import api from '@/services/api';
import toast from 'react-hot-toast';

interface InitiatePaymentOptions {
  bookingId: string;
  amount: number;
  currency: string;
  carName: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  onSuccess: (response: any) => void;
  onCancel?: () => void;
  onError?: (errMessage: string) => void;
}

export const initiateRazorpayPayment = async ({
  bookingId,
  amount,
  currency,
  carName,
  user,
  onSuccess,
  onCancel,
  onError,
}: InitiatePaymentOptions) => {
  try {
    // Open the custom Razorpay payment page link in a new tab
    window.open('https://rzp.io/rzp/nIdvz7E', '_blank');
    toast.success('Payment page opened in a new tab!');
    if (onSuccess) onSuccess({ redirected: true });
  } catch (err: any) {
    const errMsg = 'Failed to open payment redirect link';
    toast.error(errMsg);
    if (onError) onError(errMsg);
  }
};
