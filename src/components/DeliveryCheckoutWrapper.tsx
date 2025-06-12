import { useNavigate } from 'react-router-dom';
import DeliveryCheckout from './DeliveryCheckout';

export default function DeliveryCheckoutWrapper() {
  const navigate = useNavigate();

  const handleSuccess = (transactionId: string) => {
    // Navigate to order confirmation or tracking page
    navigate(`/orders/${transactionId}`);
  };

  const handleCancel = () => {
    // Navigate back to previous page
    navigate(-1);
  };

  return (
    <DeliveryCheckout
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
} 