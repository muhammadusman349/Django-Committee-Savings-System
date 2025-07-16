import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/committee';

// Fetch all contributions for a membership
export const getContributions = async (membershipId) => {
  try {
    const response = await axios.get(`${API_URL}/memberships/${membershipId}/contributions/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch contributions for membership ${membershipId}:`, error);
    throw error;
  }
};

// Create a new contribution
export const createContribution = async (membershipId, contributionData) => {
  try {
    const response = await axios.post(`${API_URL}/memberships/${membershipId}/contributions/`, contributionData);
    return response.data;
  } catch (error) {
    console.error('Failed to create contribution:', error);
    throw error;
  }
};

// Update a contribution
export const updateContribution = async (membershipId, contributionId, contributionData) => {
  try {
    const response = await axios.put(`${API_URL}/memberships/${membershipId}/contributions/${contributionId}/`, contributionData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update contribution ${contributionId}:`, error);
    throw error;
  }
};

// Delete a contribution
export const deleteContribution = async (membershipId, contributionId) => {
  try {
    await axios.delete(`${API_URL}/memberships/${membershipId}/contributions/${contributionId}/`);
  } catch (error) {
    console.error(`Failed to delete contribution ${contributionId}:`, error);
    throw error;
  }
};

// Verify a contribution
export const verifyContribution = async (contributionId) => {
  try {
    const response = await axios.patch(`${API_URL}/contributions/${contributionId}/verify/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to verify contribution ${contributionId}:`, error);
    throw error;
  }
};

export default {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
  verifyContribution,
};
