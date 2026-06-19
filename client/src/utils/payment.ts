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
    // 1. Create order on the backend
    const orderRes = await api.post('/payments/create-order', {
      bookingId,
    });
    const order = orderRes.data.data.order;

    // 2. Setup checkout options
    const options = {
      key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid',
      amount: order.amount,
      currency: order.currency,
      name: 'Raino Cars',
      description: `Rental Booking for ${carName}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          // 3. Verify signature on backend
          await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            bookingId,
          });
          onSuccess(response);
        } catch (err: any) {
          const errMsg = err.response?.data?.message || 'Payment verification failed';
          toast.error(errMsg);
          if (onError) onError(errMsg);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || '',
      },
      theme: {
        color: '#ef4444',
      },
      modal: {
        ondismiss: () => {
          toast.error('Payment cancelled');
          if (onCancel) onCancel();
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    const errMsg = err.response?.data?.message || 'Failed to initialize payment';
    toast.error(errMsg);
    if (onError) onError(errMsg);
  }
};
