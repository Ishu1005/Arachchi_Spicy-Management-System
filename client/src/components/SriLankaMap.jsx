import React, { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/solid';

const SriLankaMap = ({ isOpen, onClose, order }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Sri Lanka center
  const [deliveryStatus, setDeliveryStatus] = useState('Processing');

  useEffect(() => {
    if (order?.address) {
      // Simulate geocoding - in a real app, you'd use Google Maps API or similar
      const address = order.address.toLowerCase();
      
      // Map common Sri Lankan cities to coordinates
      const cityCoordinates = {
        'colombo': { lat: 6.9271, lng: 79.8612 },
        'kandy': { lat: 7.2906, lng: 80.6337 },
        'galle': { lat: 6.0329, lng: 80.2170 },
        'jaffna': { lat: 9.6615, lng: 80.0255 },
        'anuradhapura': { lat: 8.3114, lng: 80.4037 },
        'trincomalee': { lat: 8.5874, lng: 81.2152 },
        'batticaloa': { lat: 7.7102, lng: 81.6924 },
        'ratnapura': { lat: 6.6828, lng: 80.4012 },
        'kurunegala': { lat: 7.4863, lng: 80.3623 },
        'negombo': { lat: 7.2086, lng: 79.8358 }
      };

      // Find matching city
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (address.includes(city)) {
          setMapCenter(coords);
          break;
        }
      }

      // Simulate delivery status based on order date
      const orderDate = new Date(order.orderDate);
      const daysDiff = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 1) {
        setDeliveryStatus('Processing');
      } else if (daysDiff < 2) {
        setDeliveryStatus('In Transit');
      } else if (daysDiff < 3) {
        setDeliveryStatus('Out for Delivery');
      } else {
        setDeliveryStatus('Delivered');
      }
    }
  }, [order]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-6 w-6 text-[#7B3F00]" />
            <h2 className="text-2xl font-bold text-[#7B3F00]">Order Tracking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {order ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {order.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {order.customerContact}
                  </div>
                  <div>
                    <span className="font-medium">Order Date:</span> {order.orderDate}
                  </div>
                  <div>
                    <span className="font-medium">Delivery Method:</span> {order.deliveryMethod}
                  </div>
                </div>
              </div>

              {/* Delivery Status */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">Delivery Status</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">{deliveryStatus}</span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  {deliveryStatus === 'Processing' && 'Your order is being prepared for shipment.'}
                  {deliveryStatus === 'In Transit' && 'Your order is on its way to the destination.'}
                  {deliveryStatus === 'Out for Delivery' && 'Your order is out for delivery today.'}
                  {deliveryStatus === 'Delivered' && 'Your order has been successfully delivered.'}
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Delivery Location</h3>
                
                {/* Address Display */}
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Delivery Address:</div>
                      <div className="text-gray-600">{order.address}</div>
                    </div>
                    <button
                      onClick={() => {
                        const encodedAddress = encodeURIComponent(order.address + ', Sri Lanka');
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      Open in Google Maps
                    </button>
                  </div>
                </div>

                {/* Simulated Map */}
                <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <div className="text-lg font-semibold text-[#7B3F00] mb-1">Sri Lanka Map</div>
                    <div className="text-sm text-gray-600 mb-4">Delivery Location: {order.address}</div>
                    
                    {/* Delivery Pin */}
                    <div className="relative">
                      <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg mx-auto"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Delivery Point
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Timeline */}
                <div className="mt-4">
                  <h4 className="font-semibold text-[#7B3F00] mb-3">Delivery Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'Processing' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={deliveryStatus === 'Processing' ? 'font-medium' : 'text-gray-500'}>
                        Order Processing
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'In Transit' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={deliveryStatus === 'In Transit' ? 'font-medium' : 'text-gray-500'}>
                        In Transit
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'Out for Delivery' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={deliveryStatus === 'Out for Delivery' ? 'font-medium' : 'text-gray-500'}>
                        Out for Delivery
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={deliveryStatus === 'Delivered' ? 'font-medium' : 'text-gray-500'}>
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-600">No Order Selected</h3>
              <p className="text-gray-500">Please select an order to track.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SriLankaMap;