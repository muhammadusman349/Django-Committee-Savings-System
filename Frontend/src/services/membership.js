import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/committee';

// Fetch all memberships for a committee
export const getMemberships = async (committeeId) => {
  try {
    const response = await axios.get(`${API_URL}/committees/${committeeId}/members/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch memberships for committee ${committeeId}:`, error);
    throw error;
  }
};

// Add a member to a committee
export const addMember = async (committeeId, memberData) => {
  try {
    const response = await axios.post(`${API_URL}/committees/${committeeId}/members/`, memberData);
    return response.data;
  } catch (error) {
    console.error(`Failed to add member to committee ${committeeId}:`, error);
    throw error;
  }
};

// Update a membership
export const updateMembership = async (committeeId, memberId, membershipData) => {
  try {
    const response = await axios.put(`${API_URL}/committees/${committeeId}/members/${memberId}/`, membershipData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update membership ${memberId}:`, error);
    throw error;
  }
};

// Remove a member from a committee
export const removeMember = async (committeeId, memberId) => {
  try {
    const response = await axios.delete(`${API_URL}/committees/${committeeId}/members/${memberId}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove member ${memberId}:`, error);
    throw error;
  }
};

export default {
  getMemberships,
  addMember,
  updateMembership,
  removeMember,
};
