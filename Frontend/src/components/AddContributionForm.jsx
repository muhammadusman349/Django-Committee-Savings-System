import React, { useState } from 'react';
import { createContribution } from '../services/contribution';

const AddContributionForm = ({ membershipId, onContributionAdded }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [forMonth, setForMonth] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const contributionData = {
      membership: membershipId,
      amount_paid: amountPaid,
      for_month: forMonth,
      due_date: dueDate,
      payment_date: paymentDate || null,
    };

    try {
      await createContribution(membershipId, contributionData);
      setAmountPaid('');
      setForMonth('');
      setDueDate('');
      setPaymentDate('');
      onContributionAdded(); // Refresh the contribution list
    } catch (err) {
      setError('Failed to add contribution. Please check the details and try again.');
      console.error(err);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h4 className="text-lg font-semibold">Add Contribution</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Amount Paid" className="p-2 border rounded w-full" required />
        <input type="date" value={forMonth} onChange={(e) => setForMonth(e.target.value)} placeholder="For Month" className="p-2 border rounded w-full" required />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due Date" className="p-2 border rounded w-full" required />
        <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="Payment Date" className="p-2 border rounded w-full" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Contribution
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AddContributionForm;
