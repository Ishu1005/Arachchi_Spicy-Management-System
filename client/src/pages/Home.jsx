import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';
//home page design
function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => {
        toast.warning('Session expired. Please log in again.');
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const slideLeftVariant = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const slideRightVariant = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] overflow-x-hidden">
      {/* Header Background Image */}
      <div
        className="h-[60vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: "url('/assets/cinnamon-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold lowercase">welcome to arachchi spices</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg">
            discover the authentic taste of sri lanka with our premium cinnamon and exotic spices.
          </p>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 space-y-24">

        {/* Why Choose Us Section */}
        <motion.div
          variants={slideRightVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-amber-200"
        >
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-12 lowercase">why choose arachchi spices?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'premium quality assurance', description: 'every spice is carefully selected and tested to ensure the highest quality standards.' },
              { icon: '🚚', title: 'fast worldwide shipping', description: 'we deliver fresh spices to your doorstep within 3-7 days globally.' },
              { icon: '🌱', title: 'sustainably sourced', description: 'we work directly with local farmers using sustainable practices.' },
              { icon: '🏆', title: 'authentic sri lankan heritage', description: 'family recipes and traditional processing methods passed down through generations.' },
              { icon: '👥', title: 'expert customer support', description: 'our spice specialists are here to help you choose the right products.' },
              { icon: '⭐', title: 'satisfaction guaranteed', description: 'not happy? we offer a 30-day money-back guarantee.' },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2 lowercase">{item.title}</h3>
                <p className="text-amber-700">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Available Spices Section */}
        <motion.div
          variants={slideRightVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="bg-white border border-[#D6A77A] rounded-xl shadow-lg p-6"
        >
          <h2 className="text-center text-3xl font-bold text-[#7B3F00] mb-6 lowercase">available spices</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#D6A77A] scrollbar-track-[#fffaf2]">
            {products.map(p => (
              <motion.div
                key={p._id}
                whileHover={{ scale: 1.05 }}
                className="border border-[#D6A77A] rounded-lg bg-white p-4 shadow hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={`http://localhost:5000/uploads/${p.image}`}
                  alt={p.name}
                  className="h-32 w-full object-cover mb-2 rounded"
                />
                <h3 className="text-lg font-bold text-[#7B3F00]">{p.name}</h3>
                <p className="text-sm text-[#5C2C00]">{p.description}</p>
                <p className="text-sm italic text-gray-500">{p.category}</p>
                <p className="text-sm font-medium lowercase">price: ${p.price}</p>
                <p className="text-sm font-medium lowercase">qty: {p.quantity}</p>
              </motion.div>
            ))}
          </div>

          {/* Button below the grid */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/available-spices')}
              className="bg-[#7B3F00] text-white px-6 py-2 rounded-lg"
            >
              View All Available Spices
            </button>
          </div>
        </motion.div>


        {/* Supplier & Order Manager Boxes */}
        <div className="space-y-10">
        
          {/* Supplier Manager */}
          <motion.div
            variants={slideRightVariant}
            initial="hidden"
            whileInView="visible"
            className="flex flex-col md:flex-row items-center bg-white border border-[#D6A77A] rounded-xl shadow-lg p-8 min-h-[280px] md:min-h-[320px]"
          >
            {/* Image on left */}
            <img
              src="/assets/Supplier-bg.jpg"
              className="w-full md:w-1/3 h-60 object-cover rounded-lg mb-4 md:mb-0"
              alt="supplier"
            />

            {/* Text content on right */}
            <div className="md:ml-6 md:w-2/3 w-full">
              <h3 className="text-3xl font-bold text-[#7B3F00] mb-3">supplier management</h3>
              <p className="text-[#5C2C00] mb-3 leading-relaxed">
                Streamline your supplier relationships with a centralized dashboard that enables real-time delivery tracking, 
                performance monitoring, and inventory coordination.
              </p>
              <p className="text-[#5C2C00] mb-4 leading-relaxed">
                Empower your business with better planning, reduced procurement delays, and improved communication between vendors and logistics teams.
              </p>
              <button
                onClick={() => navigate('/supplier-manager')}
                className="bg-[#7B3F00] text-white px-6 py-2 rounded-lg"
              >
                go to supplier
              </button>
            </div>
          </motion.div>


          {/* Order Manager */}
          <motion.div
            variants={slideLeftVariant}
            initial="hidden"
            whileInView="visible"
            className="flex flex-col md:flex-row items-center bg-white border border-[#D6A77A] rounded-xl shadow-lg p-8 min-h-[280px] md:min-h-[320px]"
          >
            {/* Text content first (on left for md and above) */}
            <div className="md:mr-6 md:w-2/3 w-full mt-4 md:mt-0">
              <h3 className="text-3xl font-bold text-[#7B3F00] mb-3">order management</h3>
              <p className="text-[#5C2C00] mb-3 leading-relaxed">
                Seamlessly manage customer orders with real-time tracking, status updates, and centralized order history.
                Our intuitive dashboard ensures accuracy, reduces delays, and improves customer satisfaction.
              </p>
              <p className="text-[#5C2C00] mb-4 leading-relaxed">
                With built-in analytics and delivery notifications, you’ll gain valuable insights and ensure every order is fulfilled efficiently — 
                whether it’s local or international.
              </p>
              <button
                onClick={() => navigate('/order-manager')}
                className="bg-[#7B3F00] text-white px-6 py-2 rounded-lg"
              >
                go to order
              </button>
            </div>

            {/* Image on right */}
            <img
              src="/assets/order-bg.jpg"
              className="w-full md:w-1/3 h-60 object-cover rounded-lg mt-6 md:mt-0"
              alt="order"
            />
          </motion.div>

        </div>

        {/* Our Products and Contact Us */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Our Products */}
          <motion.div
            variants={slideLeftVariant}
            initial="hidden"
            whileInView="visible"
            className="flex-1 flex flex-col md:flex-row bg-white border border-[#D6A77A] rounded-xl shadow-lg overflow-hidden"
          >
            {/* Left: Image */}
            <img
              src="/assets/product-bg.jpg"
              className="w-full md:w-1/2 h-64 md:h-auto object-cover"
              alt="our products"
            />

            {/* Right: Text */}
            <div className="p-6 md:p-9 flex flex-col justify-center text-[#5C2C00] space-y-3 w-full md:w-1/2">
              <h4 className="text-2xl font-bold text-[#7B3F00] lowercase">our products</h4>
              <p className="leading-relaxed">
                At Arachchi Spices, we offer a handpicked selection of pure Ceylon cinnamon, spice blends,
                and traditional flavors, sourced sustainably from Sri Lanka’s finest growers.</p>
            </div>
          </motion.div>


        {/* Contact Us */}
        <motion.div
          variants={slideRightVariant}
          initial="hidden"
          whileInView="visible"
          className="flex-1 flex bg-white border border-[#D6A77A] rounded-xl shadow-lg overflow-hidden"
        >
          {/* Left: Contact Text */}
          <div className="p-6 md:p-8 flex flex-col justify-center text-[#5C2C00] space-y-4 w-full md:w-1/2">
            <h4 className="text-2xl font-bold text-[#7B3F00] mb-2 lowercase">contact us</h4>

            <div>
              <p className="text-base">
                <span className="font-semibold text-[#7B3F00]">email:</span>{' '}
                <a href="mailto:info@arachchispices.lk" className="underline hover:text-amber-600 transition">
                  info@arachchispices.lk
                </a>
              </p>
            </div>

            <div>
              <p className="text-base">
                <span className="font-semibold text-[#7B3F00]">phone:</span>{' '}
                <a href="tel:+94771234567" className="underline hover:text-amber-600 transition">
                  +94 77 123 4567
                </a>
              </p>
            </div>

            <div>
              <p className="text-base">
                <span className="font-semibold text-[#7B3F00]">address:</span><br />
                123 Cinnamon Rd,<br />
                Kandy, Sri Lanka
              </p>
            </div>
          </div>

          {/* Right: Image */}
          <img
            src="/assets/contact-us.jpg"
            alt="contact"
            className="hidden md:block w-1/2 object-cover"
          />
        </motion.div>
        </div>

        {/* Final About (Heritage Section) */}
        <motion.div
          variants={slideLeftVariant}
          initial="hidden"
          whileInView="visible"
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200"
        >
          <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: "url('/assets/cinnamon-bg.jpg')" }}>
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center py-24 flex flex-col items-center gap-4">
              <img src={logo} alt="Arachchi Spice Logo" className="h-420" />
              {/* <h3 className="text-2xl font-bold text-amber-900">our heritage</h3> */}
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-3xl font-bold text-amber-900 mb-6 lowercase">about arachchi spices</h3>
            <p className="text-amber-700 mb-6 leading-relaxed">established in 2008, arachchi spices is rooted in sri lankan spice tradition.</p>
            <p className="text-amber-700 mb-6 leading-relaxed">we work directly with local farmers in the hill country to produce the finest cinnamon.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-amber-50 rounded-lg p-4">
                <h4 className="font-bold text-amber-900 text-2xl">2008</h4>
                <p className="text-amber-700 text-sm">established</p>
              </div>
              <div className="text-center bg-amber-50 rounded-lg p-4">
                <h4 className="font-bold text-amber-900 text-2xl">3rd gen</h4>
                <p className="text-amber-700 text-sm">family business</p>
              </div>
            </div>
            <p className="text-amber-700 font-semibold">"quality is not just our standard—it's our heritage."</p>
          </div>
        </motion.div>

        {/* Logout */}
        {/* <div className="text-center">
          <button onClick={handleLogout} className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 lowercase">logout</button>
        </div> */}
      </div>
    </div>
  );
}

export default Home;
