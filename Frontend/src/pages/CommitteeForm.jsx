// pages/CommitteeForm.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import committeeService from '../services/committee'
import { useAuth } from '../hooks/useAuth'

const CommitteeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_amount: '',
    duration_months: 6,
    start_date: '',
  });
  const [loading, setLoading] = useState(!!id); // Load if editing
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchCommittee = async () => {
        try {
          const data = await committeeService.getCommitteeById(id);
          // Ensure start_date is correctly formatted for the input
          const formattedData = {
            ...data,
            start_date: data.start_date ? data.start_date.split('T')[0] : '',
          };
          setFormData(formattedData);
        } catch (err) {
          setError('Failed to fetch committee data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchCommittee();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await committeeService.updateCommittee(id, formData);
      } else {
        await committeeService.createCommittee(formData);
      }
      navigate('/committees');
    } catch (err) {
      setError('An error occurred while saving the committee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center p-8">Loading committee details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {id ? 'Edit Committee' : 'Create New Committee'}
      </h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="monthly_amount" className="block text-sm font-medium text-gray-700">Monthly Amount ($)</label>
            <input
              id="monthly_amount"
              type="number"
              name="monthly_amount"
              value={formData.monthly_amount}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700">Duration</label>
            <select
              id="duration_months"
              name="duration_months"
              value={formData.duration_months}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="8">8 months</option>
              <option value="9">9 months</option>
              <option value="12">1 year</option>
              <option value="18">1.5 months</option>
              <option value="24">2 years</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="start_date"
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/committees')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (id ? 'Update Committee' : 'Create Committee')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommitteeForm