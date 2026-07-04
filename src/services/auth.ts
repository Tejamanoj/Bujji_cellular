import api from './api';

export const authService = {
  login: async (email: string) => {
    // In production: return api.post('/auth/login', { email })
    // For premium frontend preview, we simulate and return mock values
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, message: 'OTP sent to your email.' };
  },

  verifyOtp: async (email: string, otp: string) => {
    // In production: return api.post('/auth/verify-otp', { email, otp })
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      token: 'mock_jwt_token_bujji_cellulars',
      user: {
        id: 'user_1',
        name: 'Teja M',
        email,
        loyaltyPoints: 1250,
      },
    };
  },

  signup: async (name: string, email: string) => {
    // In production: return api.post('/auth/signup', { name, email })
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, message: 'Signup verification OTP sent to your email.' };
  },

  forgotPassword: async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, message: 'Password reset link sent.' };
  },
};
