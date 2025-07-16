import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { changePassword } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await changePassword(formData.old_password, formData.new_password)
      setSuccess('Password changed successfully!')
      setError('')
      setFormData({
        old_password: '',
        new_password: '',
      })
      setTimeout(() => {
        setSuccess('');
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.old_password?.[0] || err.message || 'Failed to change password')
      setSuccess('')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="old_password">
            Current Password
          </label>
          <input
            type="password"
            id="old_password"
            name="old_password"
            className="w-full px-3 py-2 border rounded"
            value={formData.old_password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="new_password">
            New Password
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            className="w-full px-3 py-2 border rounded"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Change Password
        </button>
      </form>
    </div>
  )
}

export default ChangePassword