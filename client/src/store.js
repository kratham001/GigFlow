import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import bidReducer from './features/bidSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bids: bidReducer,
  },
});