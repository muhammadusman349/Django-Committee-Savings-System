// pages/committees.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import committeeService from '../services/committee';
import ConfirmationModal from '../components/ConfirmationModal'; // Import the modal

const Committees = () => {
  const { user } = useAuth();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [committeeToDelete, setCommitteeToDelete] = useState(null);

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const data = await committeeService.getCommittees();
        setCommittees(data);
      } catch (err) {
        setError('Failed to fetch committees');
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  // Opens the modal
  const handleDeleteClick = (id) => {
    setCommitteeToDelete(id);
    setIsModalOpen(true);
  };

  // Called when deletion is confirmed
  const confirmDelete = async () => {
    if (committeeToDelete) {
      try {
        await committeeService.deleteCommittee(committeeToDelete);
        setCommittees(committees.filter((c) => c.id !== committeeToDelete));
      } catch (err) {
        setError('Failed to delete committee');
      } finally {
        setIsModalOpen(false);
        setCommitteeToDelete(null);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Committees</h1>
        {user?.is_organizer && (
          <Link
            to="/committee-form"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Committee
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {committees.map((committee) => (
          <div key={committee.id} className="border rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-2">{committee.name}</h2>
            <p className="text-gray-600 mb-2">{committee.description}</p>
            <p className="mb-1">Status: <span className="font-medium">{committee.status}</span></p>
            <p className="mb-1">Monthly Amount: ${committee.monthly_amount}</p>
            <p className="mb-3">Duration: {committee.duration_months} months</p>

            <div className="flex justify-between">
              <Link
                to={`/committees/${committee.id}`}
                className="text-blue-500 hover:text-blue-700"
              >
                View Details
              </Link>

              {user?.is_organizer && committee.organizer == user.id && (
                <div className="space-x-2">
                  <Link
                    to={`/committee-form/${committee.id}`}
                    className="text-green-500 hover:text-green-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(committee.id)} // Updated onClick
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add the modal to the component */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this committee? This action cannot be undone."
      />
    </div>
  );
};

export default Committees;