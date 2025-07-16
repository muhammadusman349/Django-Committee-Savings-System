import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  UserCircleIcon, 
  CogIcon, 
  ArrowRightStartOnRectangleIcon 
} from '@heroicons/react/24/outline'

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {user?.first_name || 'Profile'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              My Profile
            </div>
          </Link>
          <button
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center">
              <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown