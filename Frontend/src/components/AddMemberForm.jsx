import React, { useState } from 'react';
import { addMember } from '../services/membership';

const AddMemberForm = ({ committeeId, onMemberAdded }) => {
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!memberId) {
      setError('User ID is required.');
      return;
    }

    try {
      await addMember(committeeId, { member: memberId, committee: committeeId });
      setMemberId('');
      onMemberAdded(); // Refresh the member list
    } catch (err) {
      setError('Failed to add member. Please check the User ID and try again.');
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold">Add Member</h3>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="Enter User ID"
          className="p-2 border rounded w-full"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AddMemberForm;
