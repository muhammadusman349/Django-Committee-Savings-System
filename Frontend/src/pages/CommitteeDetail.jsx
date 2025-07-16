// pages/CommitteeDetail.jsx
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import committeeService from '../services/committee';
import MemberList from '../components/MemberList';
import AddMemberForm from '../components/AddMemberForm';
import PayoutList from '../components/PayoutList';
import CreatePayoutForm from '../components/CreatePayoutForm';

const CommitteeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [payoutRefreshKey, setPayoutRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const data = await committeeService.getCommitteeById(id);
        setCommittee(data);
      } catch (err) {
        setError('Failed to fetch committee details');
      } finally {
        setLoading(false);
      }
    };

    fetchCommittee();
  }, [id, refreshKey]);

  const handleMemberAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const handlePayoutCreated = () => {
    setPayoutRefreshKey(oldKey => oldKey + 1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!committee) return <div>Committee not found</div>;

  const isOrganizer = user?.is_organizer && committee.organizer == user.id;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{committee.name}</h1>
        {isOrganizer && (
          <div className="space-x-2">
            <Link 
              to={`/committee-form/${id}`}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <p className="mb-4">{committee.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <p>Status: {committee.status}</p>
            <p>Monthly Amount: ${committee.monthly_amount}</p>
            <p>Duration: {committee.duration_months} months</p>
            <p>Total Amount: ${committee.total_amount}</p>
            <p>Start Date: {new Date(committee.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(committee.end_date).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Organizer</h2>
            <p>{committee.organizer_name}</p>
            <p>Total Collected: ${committee.total_collected || 0}</p>
            <p>Current Members: {committee.current_members_count}</p>
          </div>
        </div>

        <MemberList key={refreshKey} isOrganizer={isOrganizer} />

        {isOrganizer && (
          <AddMemberForm committeeId={id} onMemberAdded={handleMemberAdded} />
        )}

        <hr className="my-6" />

        <PayoutList key={payoutRefreshKey} committeeId={id} isOrganizer={isOrganizer} />
        {isOrganizer && (
          <CreatePayoutForm committeeId={id} onPayoutCreated={handlePayoutCreated} />
        )}
      </div>

      <Link 
        to="/committees" 
        className="text-blue-500 hover:text-blue-700"
      >
        &larr; Back to Committees
      </Link>
    </div>
  );
};

export default CommitteeDetail;