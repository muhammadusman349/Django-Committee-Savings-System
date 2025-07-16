import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import Committees from './pages/Committees' 
import CommitteeDetail from './pages/CommitteeDetail' 
import CommitteeForm from './pages/CommitteeForm' 
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import OrganizerRoute from './components/OrganizerRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Authenticated routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Committee routes accessible to all authenticated users */}
            <Route path="/committees" element={<Committees />} />
            <Route path="/committees/:id" element={<CommitteeDetail />} />
            
            {/* Organizer-only routes */}
            <Route element={<OrganizerRoute />}>
              <Route path="/committee-form" element={<CommitteeForm />} />
              <Route path="/committee-form/:id" element={<CommitteeForm />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App