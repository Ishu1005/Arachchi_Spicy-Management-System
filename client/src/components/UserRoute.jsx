import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserRoute({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => {
        if (res.data?.user) {
          setAuthorized(true);
        } else {
          alert('Access Denied');
          navigate('/');
        }
      })
      .catch(() => {
        alert('Please log in');
        navigate('/');
      });
  }, [navigate]);

  return authorized ? children : null;
}

export default UserRoute;
