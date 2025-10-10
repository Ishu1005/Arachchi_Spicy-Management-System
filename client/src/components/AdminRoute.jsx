import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => {
        if (res.data.user?.role === 'admin') {
          setAuthorized(true);
        } else {
          toast.error('You do not have permission to access this page.');
          setTimeout(() => navigate('/'), 2000);
        }
      })
      .catch(error => {
        const backendMsg = error.response?.data?.message;
        if (backendMsg === 'Access Denied') {
          toast.error('You do not have permission to access this page.');
        } else {
          toast.error('Please log in to continue.');
        }
        setTimeout(() => navigate('/'), 2000);
      });
  }, [navigate]);

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      {authorized ? children : null}
    </>
  );
}

export default AdminRoute;
