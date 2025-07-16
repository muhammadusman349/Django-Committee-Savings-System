import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/committee';

// Fetch all payouts for a committee
export const getPayouts = async (committeeId) => {
  try {
    const response = await axios.get(`${API_URL}/committees/${committeeId}/payouts/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch payouts for committee ${committeeId}:`, error);
    throw error;
  }
};

// Create a new payout
export const createPayout = async (committeeId, payoutData) => {
  try {
    const response = await axios.post(`${API_URL}/committees/${committeeId}/payouts/`, payoutData);
    return response.data;
  } catch (error) {
    console.error('Failed to create payout:', error);
    throw error;
  }
};

// Fetch a single payout by ID
export const getPayoutById = async (payoutId) => {
  try {
    const response = await axios.get(`${API_URL}/payouts/${payoutId}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch payout ${payoutId}:`, error);
    throw error;
  }
};

// Update a payout
export const updatePayout = async (payoutId, payoutData) => {
  try {
    const response = await axios.put(`${API_URL}/payouts/${payoutId}/`, payoutData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update payout ${payoutId}:`, error);
    throw error;
  }
};

// Delete a payout
export const deletePayout = async (payoutId) => {
  try {
    await axios.delete(`${API_URL}/payouts/${payoutId}/`);
  } catch (error) {
    console.error(`Failed to delete payout ${payoutId}:`, error);
    throw error;
  }
};

// Confirm a payout
export const confirmPayout = async (payoutId) => {
  try {
    const response = await axios.patch(`${API_URL}/payouts/${payoutId}/confirm/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to confirm payout ${payoutId}:`, error);
    throw error;
  }
};

export default {
  getPayouts,
  createPayout,
  getPayoutById,
  updatePayout,
  deletePayout,
  confirmPayout,
};
