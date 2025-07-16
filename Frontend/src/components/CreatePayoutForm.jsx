import React, { useState, useEffect } from 'react';
import { createPayout } from '../services/payout';
import { getMemberships } from '../services/membership';
import { getCommitteeById } from '../services/committee';

const CreatePayoutForm = ({ committeeId, onPayoutCreated }) => {
  const [members, setMembers] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [committee, setCommittee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, committeeData] = await Promise.all([
          getMemberships(committeeId),
          getCommitteeById(committeeId),
        ]);
        setMembers(membersData.filter(m => m.status === 'ACTIVE'));
        setCommittee(committeeData);
      } catch (err) {
        console.error('Failed to fetch data for payout form:', err);
      }
    };
    fetchData();
  }, [committeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedMembership || !committee) {
      setError('Please select a member and ensure committee details are loaded.');
      return;
    }

    const total_amount = committee.monthly_amount * committee.duration_months;

    try {
      await createPayout(committeeId, { 
        membership: selectedMembership,
        total_amount: total_amount
      });
      setSelectedMembership('');
      onPayoutCreated(); // Refresh the payout list
    } catch (err) {
      const errorMessage = err.response?.data?.membership?.[0] || err.response?.data?.detail || 'Failed to create payout. The member might have unpaid contributions or has already received a payout.';
      setError(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h4 className="text-lg font-semibold">Create Payout</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={selectedMembership}
          onChange={(e) => setSelectedMembership(e.target.value)}
          className="p-2 border rounded w-full"
          required
        >
          <option value="">Select a Member</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.member_name}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Create Payout
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CreatePayoutForm;
