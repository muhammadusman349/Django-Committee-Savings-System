import React, { useState, useEffect } from 'react';
import { getContributions, verifyContribution } from '../services/contribution';

const ContributionList = ({ membershipId, isOrganizer }) => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await getContributions(membershipId);
        setContributions(data);
      } catch (error) {
        console.error('Failed to fetch contributions:', error);
      }
    };

    if (membershipId) {
      fetchContributions();
    }
  }, [membershipId]);

  const handleVerify = async (contributionId) => {
    try {
      await verifyContribution(contributionId);
      // Refresh the list
      const data = await getContributions(membershipId);
      setContributions(data);
    } catch (error) {
      console.error('Failed to verify contribution:', error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold">Contributions</h3>
      <ul className="space-y-2">
        {contributions.map(c => (
          <li key={c.id} className="p-2 border rounded">
            <p>Month: {new Date(c.for_month).toLocaleDateString()}</p>
            <p>Amount Paid: ${c.amount_paid}</p>
            <p>Status: {c.payment_status}</p>
            <p>Verified: {c.verified_by_organizer ? 'Yes' : 'No'}</p>
            {isOrganizer && !c.verified_by_organizer && (
              <button 
                onClick={() => handleVerify(c.id)}
                className="mt-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Verify
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContributionList;
