import useAxiosSecure from '../hooks/useAxiosSecure';

const useEmailService = () => {
  const { publicApi } = useAxiosSecure();

  const sendWelcomeEmail = async (email, name) => {
    try {
      const response = await publicApi.post('/email/welcome', {
        email,
        name
      });
      return response;
    } catch (error) {
      console.error('Welcome email error:', error);
      throw error;
    }
  };

  const sendOrderConfirmation = async (email, orderDetails) => {
    try {
      const response = await publicApi.post('/email/order-confirmation', {
        email,
        orderDetails
      });
      return response;
    } catch (error) {
      console.error('Order confirmation error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email, resetToken) => {
    try {
      const response = await publicApi.post('/email/password-reset', {
        email,
        resetToken
      });
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const sendTestEmail = async (email) => {
    try {
      const response = await publicApi.post('/email/test', {
        email
      });
      return response;
    } catch (error) {
      console.error('Test email error:', error);
      throw error;
    }
  };

  return {
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendPasswordReset,
    sendTestEmail
  };
};

export default useEmailService;
