import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';

export const fetchBidsByGigId = createAsyncThunk('bids/fetchByGig', async (gigId, thunkAPI) => {
  try {
    const response = await api.get(`/bids/${gigId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const hireFreelancer = createAsyncThunk('bids/hire', async (bidId, thunkAPI) => {
  try {
    const response = await api.patch(`/bids/${bidId}/hire`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBids: (state) => {
      state.bids = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsByGigId.pending, (state) => { state.loading = true; })
      .addCase(fetchBidsByGigId.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(hireFreelancer.fulfilled, (state, action) => {
        const hiredBidId = action.payload.bid._id;
        state.bids = state.bids.map((bid) => {
          if (bid._id === hiredBidId) {
            return { ...bid, status: 'hired' };
          }
          return { ...bid, status: 'rejected' };
        });
      });
  },
});

export const { clearBids } = bidSlice.actions;
export default bidSlice.reducer;