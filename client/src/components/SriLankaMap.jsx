import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MapPinIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/solid';

const SriLankaMap = ({ isOpen, onClose, order }) => {
  const [selectedTown, setSelectedTown] = useState(null);

  // Sri Lanka districts with coordinates (approximate)
  const districts = {
    'Colombo': { x: 50, y: 40, color: '#7B3F00' },
    'Gampaha': { x: 45, y: 35, color: '#A0522D' },
    'Kalutara': { x: 40, y: 50, color: '#D2691E' },
    'Kandy': { x: 60, y: 60, color: '#CD853F' },
    'Matale': { x: 65, y: 55, color: '#DEB887' },
    'Nuwara Eliya': { x: 70, y: 70, color: '#F4A460' },
    'Galle': { x: 35, y: 80, color: '#D2B48C' },
    'Matara': { x: 30, y: 90, color: '#BC9A6A' },
    'Hambantota': { x: 25, y: 100, color: '#8B4513' },
    'Jaffna': { x: 45, y: 15, color: '#A0522D' },
    'Vavuniya': { x: 55, y: 25, color: '#D2691E' },
    'Mannar': { x: 35, y: 20, color: '#CD853F' },
    'Kilinochchi': { x: 50, y: 10, color: '#DEB887' },
    'Mullaitivu': { x: 60, y: 15, color: '#F4A460' },
    'Trincomalee': { x: 75, y: 30, color: '#D2B48C' },
    'Batticaloa': { x: 80, y: 45, color: '#BC9A6A' },
    'Ampara': { x: 75, y: 55, color: '#8B4513' },
    'Badulla': { x: 70, y: 65, color: '#A0522D' },
    'Monaragala': { x: 65, y: 75, color: '#D2691E' },
    'Ratnapura': { x: 55, y: 70, color: '#CD853F' },
    'Kegalle': { x: 50, y: 65, color: '#DEB887' },
    'Kurunegala': { x: 40, y: 45, color: '#F4A460' },
    'Puttalam': { x: 30, y: 30, color: '#D2B48C' },
    'Anuradhapura': { x: 50, y: 35, color: '#BC9A6A' },
    'Polonnaruwa': { x: 65, y: 40, color: '#8B4513' }
  };

  // Extract main town from address
  const extractMainTown = (address) => {
    if (!address) return null;
    
    const addressLower = address.toLowerCase();
    
    // Check for district names in the address
    for (const district of Object.keys(districts)) {
      if (addressLower.includes(district.toLowerCase())) {
        return district;
      }
    }
    
    // Check for common town names
    const commonTowns = {
      'colombo': 'Colombo',
      'kandy': 'Kandy',
      'galle': 'Galle',
      'jaffna': 'Jaffna',
      'negombo': 'Gampaha',
      'kurunegala': 'Kurunegala',
      'anuradhapura': 'Anuradhapura',
      'trincomalee': 'Trincomalee',
      'batticaloa': 'Batticaloa',
      'matara': 'Matara',
      'hambantota': 'Hambantota',
      'ratnapura': 'Ratnapura',
      'badulla': 'Badulla',
      'nuwara eliya': 'Nuwara Eliya',
      'puttalam': 'Puttalam',
      'kegalle': 'Kegalle',
      'matale': 'Matale',
      'kalutara': 'Kalutara',
      'gampaha': 'Gampaha'
    };
    
    for (const [townKey, districtName] of Object.entries(commonTowns)) {
      if (addressLower.includes(townKey)) {
        return districtName;
      }
    }
    
    return 'Colombo'; // Default to Colombo if no town found
  };

  useEffect(() => {
    if (order && order.address) {
      const town = extractMainTown(order.address);
      setSelectedTown(town);
    }
  }, [order]);

  const getDeliveryStatus = () => {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus;
  };

  const getEstimatedDeliveryTime = () => {
    const times = ['2-3 hours', '1-2 days', '3-4 days', 'Same day'];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    return randomTime;
  };

  const getDeliveryMethod = () => {
    const methods = ['Standard Delivery', 'Express Delivery', 'Pickup Point', 'Third-Party Courier'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    return randomMethod;
  };

  const getPaymentMethod = () => {
    const methods = ['Cash on Delivery', 'Credit Card', 'Bank Transfer', 'Mobile Payment'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    return randomMethod;
  };

  if (!isOpen || !order) return null;

  const deliveryStatus = getDeliveryStatus();
  const estimatedTime = getEstimatedDeliveryTime();
  const deliveryMethod = getDeliveryMethod();
  const paymentMethod = getPaymentMethod();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#7B3F00] text-white p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Order Tracking</h2>
                <p className="text-amber-200">Order ID: #{order._id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Information */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span>{order.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Contact:</span>
                    <span>{order.customerContact || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery:</span>
                    <span>{deliveryMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      deliveryStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      deliveryStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                      deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {deliveryStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">ETA:</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {estimatedTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Delivery Address</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.address}</p>
                      {selectedTown && (
                        <p className="text-blue-600 font-medium mt-1">
                          📍 Main Town: {selectedTown}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sri Lanka Map */}
            <div className="bg-gradient-to-br from-green-100 to-blue-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-[#7B3F00] mb-4 text-center">
                🇱🇰 Sri Lanka Delivery Map
              </h3>
              
              {/* Map Container */}
              <div className="relative bg-gradient-to-br from-green-200 to-blue-200 rounded-lg p-4 min-h-[400px]">
                {/* Map Background */}
                <div className="absolute inset-4 bg-gradient-to-br from-green-300 to-blue-300 rounded-lg opacity-30"></div>
                
                {/* District Markers */}
                <div className="relative h-full">
                  {Object.entries(districts).map(([district, { x, y, color }]) => (
                    <motion.div
                      key={district}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                        selectedTown === district ? 'z-10' : 'z-5'
                      }`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => setSelectedTown(district)}
                    >
                      {/* Marker */}
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                        selectedTown === district 
                          ? 'bg-red-500 scale-150' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } transition-all duration-300`}></div>
                      
                      {/* District Label */}
                      <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded shadow-lg transition-all duration-300 ${
                        selectedTown === district
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}>
                        {district}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Delivery Route Line (if town is selected) */}
                  {selectedTown && (
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <svg className="w-full h-full">
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="#7B3F00"
                            />
                          </marker>
                        </defs>
                        <path
                          d={`M 50% 40% L ${districts[selectedTown].x}% ${districts[selectedTown].y}%`}
                          stroke="#7B3F00"
                          strokeWidth="3"
                          strokeDasharray="5,5"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Available Districts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Delivery Destination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#7B3F00] border-dashed border-[#7B3F00]"></div>
                      <span>Delivery Route</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Progress */}
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Delivery Progress</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Package Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{estimatedTime}</span>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    deliveryStatus === 'completed' ? 'bg-green-500 w-full' :
                    deliveryStatus === 'processing' ? 'bg-blue-500 w-3/4' :
                    deliveryStatus === 'pending' ? 'bg-yellow-500 w-1/2' :
                    'bg-red-500 w-1/4'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SriLankaMap;
