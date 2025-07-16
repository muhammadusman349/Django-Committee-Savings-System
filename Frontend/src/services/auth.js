import axios from 'axios';

const API_URL = 'http://localhost:8000/account/';

const signup = async (userData) => {
  const response = await axios.post(API_URL + 'signup/', userData);
  const data = response.data;
  // Extract tokens and user fields
  const { access_token, refresh_token, ...user } = data;
  return { user, access_token, refresh_token };
};

const login = async (userData) => {
  const response = await axios.post(API_URL + 'login/', userData);
  const data = response.data;
  const user = {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    is_organizer: data.is_organizer
  };
  return { user, access_token: data.access_token, refresh_token: data.refresh_token };
};

const updateProfile = async (profileData, token) => {
  const response = await axios.patch(`${API_URL}profile/`, profileData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

const changePassword = async (passwords, token) => {
  const response = await axios.patch(`${API_URL}change-password/`, passwords, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export default {
  signup,
  login,
  logout,
  updateProfile,
  changePassword
};