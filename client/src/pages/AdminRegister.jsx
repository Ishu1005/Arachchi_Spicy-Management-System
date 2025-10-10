import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

function AdminRegister() {
  const [enrolled, setEnrolled] = useState(false);
  const [enrollKey, setEnrollKey] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const checkKey = () => {
    if (enrollKey === '1234') {
      setEnrolled(true);
      toast.success('Enrollment key verified!');
    } else {
      toast.error('Invalid enrollment key');
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { ...form, role: 'admin' }, { withCredentials: true });

      await axios.post('http://localhost:5000/api/auth/login', {
        email: form.email,
        password: form.password
      }, { withCredentials: true });

      toast.success('Admin registered & logged in!');
      navigate('/admin-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration or login failed');
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/assets/cinnamon-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20 z-0" />

      <div className="relative z-10 w-full max-w-md bg-[#fffaf2cc] rounded-xl shadow-lg overflow-hidden border border-[#d6a77a] p-8">
        <h2 className="text-2xl font-semibold text-[#7B3F00] mb-6 text-center">Admin Registration</h2>

        {!enrolled ? (
          <div className="space-y-4">
            <input
              placeholder="Enter Enrollment Key"
              value={enrollKey}
              onChange={e => setEnrollKey(e.target.value)}
              className="w-full px-4 py-2 border border-[#D6A77A] rounded-md bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#D6A77A]"
            />
            <button
              onClick={checkKey}
              className="w-full bg-[#7B3F00] text-white py-2 rounded-md hover:bg-[#5c2c00] transition"
            >
              Verify Key
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#D6A77A] rounded-md bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#D6A77A]"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#D6A77A] rounded-md bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#D6A77A]"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#D6A77A] rounded-md bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#D6A77A]"
            />
            <button
              type="submit"
              className="w-full bg-[#7B3F00] text-white py-2 rounded-md hover:bg-[#5c2c00] transition"
            >
              Register as Admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminRegister;
