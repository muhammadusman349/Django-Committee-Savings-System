import React, { useState, useEffect } from 'react';
import { getMemberships, removeMember } from '../services/membership';
import { useParams } from 'react-router-dom';
import ContributionList from './ContributionList';
import AddContributionForm from './AddContributionForm';

const MemberList = ({ isOrganizer }) => {
  const [members, setMembers] = useState([]);
  const { id: committeeId } = useParams();
  const [visibleContributions, setVisibleContributions] = useState({});
  const [refreshContributionKey, setRefreshContributionKey] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMemberships(committeeId);
        setMembers(data);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    fetchMembers();
  }, [committeeId]);

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(committeeId, memberId);
        setMembers(members.filter(m => m.id !== memberId));
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const toggleContributions = (memberId) => {
    setVisibleContributions(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const handleContributionAdded = () => {
    setRefreshContributionKey(prev => prev + 1);
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold">Members</h3>
      <ul className="space-y-2">
        {members.map(membership => (
          <li key={membership.id} className="p-2 border rounded">
            <div className="flex justify-between items-center">
              <span>{membership.member_name} ({membership.status})</span>
              <div className="space-x-2">
                <button onClick={() => toggleContributions(membership.id)} className="px-2 py-1 bg-gray-200 rounded">View Contributions</button>
                {isOrganizer && (
                  <button 
                    onClick={() => handleRemoveMember(membership.id)} 
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {visibleContributions[membership.id] && (
              <div className="mt-4">
                <ContributionList key={refreshContributionKey} membershipId={membership.id} isOrganizer={isOrganizer} />
                <AddContributionForm membershipId={membership.id} onContributionAdded={handleContributionAdded} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;
