import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function UserRoute({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/session', { 
          withCredentials: true 
        });
        
        if (res.data?.user) {
          setAuthorized(true);
        } else {
          toast.error('Please log in to access this page');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Session expired. Please log in again');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3F00] mx-auto mb-4"></div>
          <p className="text-[#7B3F00] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return authorized ? children : null;
}

export default UserRoute;
