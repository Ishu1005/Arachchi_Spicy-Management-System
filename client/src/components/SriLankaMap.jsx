import React from 'react';

const SriLankaMap = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">Delivery Coverage Map</h3>
      <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h4 className="text-xl font-semibold text-[#7B3F00] mb-2">Sri Lanka Delivery Coverage</h4>
        <p className="text-gray-600 mb-4">We deliver to all major cities and towns across Sri Lanka</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Colombo</div>
            <div className="text-gray-600">Same Day</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Kandy</div>
            <div className="text-gray-600">1-2 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Galle</div>
            <div className="text-gray-600">1-2 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Jaffna</div>
            <div className="text-gray-600">2-3 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Anuradhapura</div>
            <div className="text-gray-600">2-3 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Trincomalee</div>
            <div className="text-gray-600">2-3 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Batticaloa</div>
            <div className="text-gray-600">2-3 Days</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="font-semibold text-[#7B3F00]">Ratnapura</div>
            <div className="text-gray-600">1-2 Days</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center justify-center text-[#7B3F00]">
            <span className="text-2xl mr-2">🚚</span>
            <span className="font-semibold">Free delivery on orders over Rs. 2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SriLankaMap;
