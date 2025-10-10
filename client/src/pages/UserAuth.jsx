// // src/pages/UserAuth.jsx
// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function UserAuth() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [form, setForm] = useState({ username: '', email: '', password: '' });
//   const navigate = useNavigate();

//   const toggleForm = () => {
//     setForm({ username: '', email: '', password: '' });
//     setIsLogin(!isLogin);
//   };

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       if (isLogin) {
//         const res = await axios.post('http://localhost:5000/api/auth/login', form);
//         localStorage.setItem('token', res.data.token);
//         alert('Login success!');
//         if (res.data.user.role === 'admin') navigate('/admin-dashboard');
//         else navigate('/user-home');
//       } else {
//         await axios.post('http://localhost:5000/api/auth/register', { ...form, role: 'user' });
//         alert('User registered successfully');
//         setIsLogin(true); // redirect to login form
//       }
//     } catch (err) {
//       alert(err.response?.data?.msg || 'Error occurred');
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <div className="card mx-auto p-4" style={{ maxWidth: '400px' }}>
//         <h3 className="text-center mb-3">{isLogin ? 'User Login' : 'User Registerxxxx'}</h3>
//         <form onSubmit={handleSubmit}>
//           {!isLogin && (
//             <div className="mb-3">
//               <input className="form-control" name="username" placeholder="Username" onChange={handleChange} required />
//             </div>
//           )}
//           <div className="mb-3">
//             <input className="form-control" type="email" name="email" placeholder="Email" onChange={handleChange} required />
//           </div>
//           <div className="mb-3">
//             <input className="form-control" type="password" name="password" placeholder="Password" onChange={handleChange} required />
//           </div>
//           <button className="btn btn-primary w-100" type="submit">
//             {isLogin ? 'Login' : 'Register'}
//           </button>
//         </form>

//         <div className="text-center mt-3">
//           <small>
//             {isLogin ? 'New user?' : 'Already registered?'}{' '}
//             <button onClick={toggleForm} className="btn btn-link p-0">
//               {isLogin ? 'Register here' : 'Login'}
//             </button>
//           </small>
//         </div>

//         <div className="text-center mt-2">
//           <button onClick={() => navigate('/admin-register')} className="btn btn-outline-secondary btn-sm">
//             Admin Registration
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserAuth;
// // This code provides a user authentication interface with login and registration forms.
// // It uses React hooks for state management and Axios for API requests.