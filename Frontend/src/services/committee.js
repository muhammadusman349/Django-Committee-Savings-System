import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/committee';

// Fetch all committees
export const getCommittees = async () => {
  try {
    const response = await axios.get(`${API_URL}/committees/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch committees:', error);
    throw error;
  }
};

// Fetch a single committee by ID
export const getCommitteeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/committees/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch committee with id ${id}:`, error);
    throw error;
  }
};

// Create a new committee
export const createCommittee = async (committeeData) => {
  try {
    const response = await axios.post(`${API_URL}/committees/`, committeeData);
    return response.data;
  } catch (error) {
    console.error('Failed to create committee:', error);
    throw error;
  }
};

// Update an existing committee
export const updateCommittee = async (id, committeeData) => {
  try {
    const response = await axios.put(`${API_URL}/committees/${id}/`, committeeData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update committee with id ${id}:`, error);
    throw error;
  }
};

// Delete a committee
export const deleteCommittee = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/committees/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete committee with id ${id}:`, error);
    throw error;
  }
};

export default {
  getCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  deleteCommittee,
};
