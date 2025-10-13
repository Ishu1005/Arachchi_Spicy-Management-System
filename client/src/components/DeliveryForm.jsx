import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  PhoneIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  TruckIcon as CourierIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

function DeliveryForm({ fetchDeliveries, editing, setEditing }) {
  const [form, setForm] = useState({
    orderId: '',
    deliveryAddress: '',
    agentName: '',
    agentPhone: '',
    driverCode: '',
    deliveryMethod: '',
    description: '',
    estimatedTime: '',
    deliveryCharge: 0,
    trackingAvailable: false
  });
  
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showDriverCodes, setShowDriverCodes] = useState(false);

  // Sample driver data with codes
  const driverData = [
    { code: 'DRV001', name: 'Kamal Perera', phone: '0771234567', status: 'available' },
    { code: 'DRV002', name: 'Nimal Silva', phone: '0772345678', status: 'available' },
    { code: 'DRV003', name: 'Sunil Fernando', phone: '0773456789', status: 'busy' },
    { code: 'DRV004', name: 'Ajith Kumara', phone: '0774567890', status: 'available' },
    { code: 'DRV005', name: 'Priyantha Rajapaksa', phone: '0775678901', status: 'available' }
  ];

  // Delivery methods with detailed information
  const deliveryMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      icon: TruckIcon,
      description: 'Normal home delivery island-wide',
      eta: '1-3 days',
      charge: 300,
      features: ['Fixed delivery charge', 'Tracking available', 'COD support'],
      suitableFor: 'Regular customers / standard spice orders',
      color: 'blue'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      icon: BoltIcon,
      description: 'Same day delivery for urban areas',
      eta: '4-6 hours',
      charge: 600,
      features: ['Real-time tracking', 'Live ETA', 'Auto notifications'],
      suitableFor: 'Urgent orders, bulk buyers, restaurants',
      color: 'green'
    },
    {
      id: 'pickup',
      name: 'Store Pickup',
      icon: BuildingStorefrontIcon,
      description: 'Customer collects from nearest branch',
      eta: 'Immediate',
      charge: 0,
      features: ['No delivery charge', 'QR code verification', 'SMS confirmation'],
      suitableFor: 'Local customers, near-branch pickups',
      color: 'purple'
    },
    {
      id: 'courier',
      name: 'Third-Party Courier',
      icon: CourierIcon,
      description: 'External courier service delivery',
      eta: '2-5 days',
      charge: 'Variable',
      features: ['Auto tracking number', 'API integration', 'Weight-based pricing'],
      suitableFor: 'Island-wide / international orders',
      color: 'orange'
    },
    {
      id: 'eco',
      name: 'Eco-Friendly Delivery',
      icon: TruckIcon,
      description: 'Bicycle/Electric scooter delivery',
      eta: '30-60 min',
      charge: 150,
      features: ['No fuel cost', 'Eco-friendly', 'Short distance only'],
      suitableFor: 'Green initiative / city-based customers',
      color: 'emerald'
    }
  ];

  // Fetch orders for selection
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders', {
          withCredentials: true
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  // Set drivers data
  useEffect(() => {
    setDrivers(driverData);
  }, []);

  // Sync form when editing
  useEffect(() => {
    if (editing) {
      setForm(editing);
    } else {
      setForm({
        orderId: '',
        deliveryAddress: '',
        agentName: '',
        agentPhone: '',
        driverCode: '',
        deliveryMethod: '',
        description: '',
        estimatedTime: '',
        deliveryCharge: 0,
        trackingAvailable: false
      });
    }
    setErrors({});
  }, [editing]);

  // Phone number validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone number must be exactly 10 digits';
    return '';
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.orderId) newErrors.orderId = 'Please select an order';
    if (!form.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
    if (!form.agentName.trim()) newErrors.agentName = 'Agent name is required';
    
    const phoneError = validatePhone(form.agentPhone);
    if (phoneError) newErrors.agentPhone = phoneError;
    
    if (!form.driverCode) newErrors.driverCode = 'Please select a driver';
    if (!form.deliveryMethod) newErrors.deliveryMethod = 'Please select a delivery method';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-update delivery method details
    if (name === 'deliveryMethod') {
      const method = deliveryMethods.find(m => m.id === value);
      if (method) {
        setForm(prev => ({
          ...prev,
          estimatedTime: method.eta,
          deliveryCharge: method.charge,
          trackingAvailable: method.id !== 'pickup',
          description: method.description
        }));
      }
    }
  };

  // Handle driver selection
  const handleDriverSelect = (driver) => {
    setForm(prev => ({
      ...prev,
      driverCode: driver.code,
      agentName: driver.name,
      agentPhone: driver.phone
    }));
    setShowDriverCodes(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the form errors');
      return;
    }

    try {
      // Map form fields to backend API format
      const deliveryData = {
        orderId: form.orderId,
        customerName: form.agentName,
        customerEmail: 'customer@example.com', // Default email - should be fetched from order
        customerPhone: form.agentPhone,
        deliveryAddress: form.deliveryAddress,
        deliveryCity: 'Colombo', // Default city - should be extracted from address
        deliveryState: 'Western', // Default state - should be extracted from address
        deliveryZipCode: '10000', // Default zip - should be extracted from address
        deliveryDate: new Date().toISOString(),
        deliveryNotes: form.description,
        deliveryPerson: form.agentName,
        estimatedDeliveryTime: form.estimatedTime,
        // Additional fields for frontend compatibility
        address: form.deliveryAddress,
        agentName: form.agentName,
        agentPhone: form.agentPhone,
        driverCode: form.driverCode,
        deliveryMethod: form.deliveryMethod,
        description: form.description,
        estimatedTime: form.estimatedTime,
        deliveryCharge: form.deliveryCharge,
        trackingAvailable: form.trackingAvailable,
        status: editing ? editing.status : 'pending'
      };

      if (editing) {
        await axios.put(`http://localhost:5000/api/delivery/${editing._id}`, deliveryData, {
          withCredentials: true
        });
        toast.success('Delivery updated successfully!');
        setEditing(null);
      } else {
        await axios.post('http://localhost:5000/api/delivery', deliveryData, {
          withCredentials: true
        });
        toast.success('Smart delivery created successfully!');
      }

      fetchDeliveries();
      setForm({
        orderId: '',
        deliveryAddress: '',
        agentName: '',
        agentPhone: '',
        driverCode: '',
        deliveryMethod: '',
        description: '',
        estimatedTime: '',
        deliveryCharge: 0,
        trackingAvailable: false
      });
    } catch (err) {
      console.error('Error submitting delivery:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to create delivery');
    }
  };

  const slideVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800'
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={slideVariant}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto p-8 bg-white border border-[#D6A77A] rounded-2xl shadow-xl space-y-6"
    >
      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-[#7B3F00] lowercase">
        {editing ? "update smart delivery" : "create smart delivery"}
      </h2>

      {/* Order Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#7B3F00]">📦 Order Selection</h3>
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Select Order</label>
          <select
            name="orderId"
            value={form.orderId}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] ${
              errors.orderId ? 'border-red-500' : 'border-[#D6A77A]'
            }`}
          >
            <option value="">Choose an order...</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                Order #{order._id} - {order.customerName || 'Guest'} ({order.items?.length || 0} items)
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="text-red-600 text-xs mt-1">{errors.orderId}</p>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#7B3F00]">📍 Delivery Address</h3>
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Address</label>
          <textarea
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            placeholder="Enter complete delivery address..."
            rows={3}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] resize-none ${
              errors.deliveryAddress ? 'border-red-500' : 'border-[#D6A77A]'
            }`}
          />
          {errors.deliveryAddress && (
            <p className="text-red-600 text-xs mt-1">{errors.deliveryAddress}</p>
          )}
        </div>
      </div>

      {/* Agent Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#7B3F00]">👤 Agent Details</h3>
        
        {/* Driver Selection */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Driver Selection</label>
          <div className="relative">
            <input
              type="text"
              value={form.driverCode ? `${form.driverCode} - ${form.agentName}` : ''}
              onChange={() => {}}
              placeholder="Click to select driver..."
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] cursor-pointer ${
                errors.driverCode ? 'border-red-500' : 'border-[#D6A77A]'
              }`}
              onClick={() => setShowDriverCodes(!showDriverCodes)}
            />
            <UserIcon className="absolute right-3 top-3 h-5 w-5 text-[#D6A77A]" />
            
            {showDriverCodes && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#D6A77A] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {drivers.map(driver => (
                  <button
                    key={driver.code}
                    type="button"
                    onClick={() => handleDriverSelect(driver)}
                    disabled={driver.status === 'busy'}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 ${
                      driver.status === 'busy' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{driver.code} - {driver.name}</div>
                        <div className="text-sm text-gray-600">{driver.phone}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        driver.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.driverCode && (
            <p className="text-red-600 text-xs mt-1">{errors.driverCode}</p>
          )}
        </div>

        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Agent Name</label>
          <input
            type="text"
            name="agentName"
            value={form.agentName}
            onChange={handleChange}
            placeholder="Agent name"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] ${
              errors.agentName ? 'border-red-500' : 'border-[#D6A77A]'
            }`}
          />
          {errors.agentName && (
            <p className="text-red-600 text-xs mt-1">{errors.agentName}</p>
          )}
        </div>

        {/* Agent Phone */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Agent Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              name="agentPhone"
              value={form.agentPhone}
              onChange={handleChange}
              placeholder="0771234567"
              maxLength="10"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] ${
                errors.agentPhone ? 'border-red-500' : 'border-[#D6A77A]'
              }`}
            />
            <PhoneIcon className="absolute right-3 top-3 h-5 w-5 text-[#D6A77A]" />
          </div>
          {errors.agentPhone && (
            <p className="text-red-600 text-xs mt-1">{errors.agentPhone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits (e.g., 0771234567)</p>
        </div>
      </div>

      {/* Delivery Method Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#7B3F00]">🚚 Delivery Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryMethods.map(method => {
            const IconComponent = method.icon;
            const isSelected = form.deliveryMethod === method.id;
            
            return (
              <div
                key={method.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? `${getColorClasses(method.color)} border-opacity-100` 
                    : 'border-gray-200 hover:border-[#D6A77A]'
                }`}
                onClick={() => handleChange({ target: { name: 'deliveryMethod', value: method.id } })}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-6 w-6 mt-1 ${
                    isSelected ? 'text-current' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isSelected ? 'text-current' : 'text-gray-800'}`}>
                      {method.name}
                    </h4>
                    <p className={`text-sm mt-1 ${isSelected ? 'text-current opacity-80' : 'text-gray-600'}`}>
                      {method.description}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>ETA:</span>
                        <span className="font-medium">{method.eta}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Charge:</span>
                        <span className="font-medium">
                          {method.charge === 0 ? 'Free' : 
                           method.charge === 'Variable' ? 'Variable' : 
                           `Rs. ${method.charge}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium">✅ Best for:</p>
                      <p className="text-xs">{method.suitableFor}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.deliveryMethod && (
          <p className="text-red-600 text-xs mt-1">{errors.deliveryMethod}</p>
        )}
      </div>

      {/* Delivery Summary */}
      {form.deliveryMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <h4 className="font-semibold text-[#7B3F00] mb-2">📋 Delivery Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Method:</span> {deliveryMethods.find(m => m.id === form.deliveryMethod)?.name}
            </div>
            <div>
              <span className="font-medium">ETA:</span> {form.estimatedTime}
            </div>
            <div>
              <span className="font-medium">Charge:</span> {form.deliveryCharge === 0 ? 'Free' : `Rs. ${form.deliveryCharge}`}
            </div>
            <div>
              <span className="font-medium">Tracking:</span> {form.trackingAvailable ? 'Available' : 'Not Available'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit and Cancel Buttons */}
      <div className="flex gap-4">
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="flex-1 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors duration-300 lowercase"
          >
            cancel edit
          </button>
        )}
        <button
          type="submit"
          className={`py-3 rounded-xl bg-[#7B3F00] text-white font-semibold hover:bg-[#5C2C00] transition-colors duration-300 lowercase ${
            editing ? 'flex-1' : 'w-full'
          }`}
        >
          {editing ? "update smart delivery" : "create smart delivery"}
        </button>
      </div>
    </motion.form>
  );
}

export default DeliveryForm;