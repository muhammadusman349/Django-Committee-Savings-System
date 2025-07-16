import React, { useState, useEffect } from 'react';
import { getPayouts, confirmPayout } from '../services/payout';

const PayoutList = ({ committeeId, isOrganizer }) => {
  const [payouts, setPayouts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const data = await getPayouts(committeeId);
        setPayouts(data);
      } catch (error) {
        console.error('Failed to fetch payouts:', error);
      }
    };

    if (committeeId && isOrganizer) {
      fetchPayouts();
    }
  }, [committeeId, isOrganizer, refreshKey]);

  const handleConfirm = async (payoutId) => {
    if (window.confirm('Are you sure you want to confirm this payout?')) {
      try {
        await confirmPayout(payoutId);
        setRefreshKey(prev => prev + 1); // Refresh the list
      } catch (error) {
        console.error('Failed to confirm payout:', error);
      }
    }
  };

  if (!isOrganizer) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">Payouts</h3>
      {payouts.length === 0 ? (
        <p>No payouts have been made for this committee yet.</p>
      ) : (
        <ul className="space-y-2">
          {payouts.map(p => (
            <li key={p.id} className="p-2 border rounded">
              <p>Member: {p.member_name}</p>
              <p>Amount: ${p.total_amount}</p>
              <p>Paid At: {new Date(p.paid_at).toLocaleString()}</p>
              <p>Status: {p.is_confirmed ? `Confirmed on ${new Date(p.confirmed_at).toLocaleDateString()}` : 'Pending Confirmation'}</p>
              {!p.is_confirmed && (
                <button 
                  onClick={() => handleConfirm(p.id)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirm Payout
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PayoutList;
