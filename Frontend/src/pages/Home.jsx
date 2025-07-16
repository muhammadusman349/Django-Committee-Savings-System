import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome {user?.first_name || 'User'}!</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          {user?.phone && <p><span className="font-medium">Phone:</span> {user.phone}</p>}
        </div>
      </div>

      <div className="mt-6">
        <Link to="/committees" className="text-blue-500 hover:underline">
          View Committees
        </Link>
        {user?.is_organizer && (
          <Link
            to="/committee-form"
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Committee
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;