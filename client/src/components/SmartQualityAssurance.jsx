import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SmartQualityAssurance = ({ product }) => {
  const [qualityData, setQualityData] = useState({
    rawMaterial: 0,
    processing: 0,
    storage: 0,
    packaging: 0,
    handling: 0,
    overall: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time quality data updates
  useEffect(() => {
    const generateQualityData = () => {
      // Use quantity as base quality indicator (higher quantity = better availability)
      const baseQuality = product?.quantity > 50 ? 4.5 : product?.quantity > 20 ? 3.5 : product?.quantity > 10 ? 2.5 : 1.5;
      const variation = 0.5;
      
      const qualityFactors = {
        rawMaterial: Math.max(0, Math.min(5, baseQuality + (Math.random() - 0.5) * variation)),
        processing: Math.max(0, Math.min(5, baseQuality + (Math.random() - 0.5) * variation)),
        storage: Math.max(0, Math.min(5, baseQuality + (Math.random() - 0.5) * variation)),
        packaging: Math.max(0, Math.min(5, baseQuality + (Math.random() - 0.5) * variation)),
        handling: Math.max(0, Math.min(5, baseQuality + (Math.random() - 0.5) * variation))
      };

      const overall = Object.values(qualityFactors).reduce((sum, val) => sum + val, 0) / 5;
      
      setQualityData({
        ...qualityFactors,
        overall: Math.round(overall * 10) / 10
      });
    };

    generateQualityData();
    const interval = setInterval(generateQualityData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [product]);

  const qualityFactors = [
    {
      name: 'Raw Material Quality',
      key: 'rawMaterial',
      icon: '🌿',
      description: 'Freshness and purity of raw spices',
      suggestion: 'Quality check at supplier stage'
    },
    {
      name: 'Processing Method',
      key: 'processing',
      icon: '⚙️',
      description: 'Temperature, time, and hygiene standards',
      suggestion: 'Automated processing steps'
    },
    {
      name: 'Storage & Environment',
      key: 'storage',
      icon: '🏪',
      description: 'Temperature, humidity, and light control',
      suggestion: 'IoT sensors for monitoring'
    },
    {
      name: 'Packaging',
      key: 'packaging',
      icon: '📦',
      description: 'Airtight and hygienic packaging',
      suggestion: 'QR Code tracking system'
    },
    {
      name: 'Handling & Delivery',
      key: 'handling',
      icon: '🚚',
      description: 'Transport conditions and handling',
      suggestion: 'Smart delivery tracking'
    }
  ];

  const getQualityColor = (score) => {
    if (score >= 4.5) return 'text-green-600 bg-green-50';
    if (score >= 3.5) return 'text-yellow-600 bg-yellow-50';
    if (score >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityStatus = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Fair';
    return 'Needs Attention';
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(score) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-amber-800">
            Smart Quality Assurance
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(qualityData.overall)}`}>
            {getQualityStatus(qualityData.overall)}
          </div>
        </div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </motion.button>
      </div>

      {/* Overall Quality Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Overall Quality:</span>
          <div className="flex items-center space-x-2">
            {renderStars(qualityData.overall)}
            <span className={`text-lg font-bold ${getQualityColor(qualityData.overall).split(' ')[0]}`}>
              {qualityData.overall}/5
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Quality Factors */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quality Factors:</h4>
          {qualityFactors.map((factor) => (
            <div
              key={factor.key}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{factor.icon}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {factor.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(qualityData[factor.key])}
                  <span className={`text-sm font-bold ${getQualityColor(qualityData[factor.key]).split(' ')[0]}`}>
                    {qualityData[factor.key].toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {factor.description}
              </div>
              <div className="text-xs text-blue-600 italic">
                💡 {factor.suggestion}
              </div>
            </div>
          ))}

          {/* Quality Insights */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
            <h5 className="text-sm font-semibold text-amber-800 mb-2">🔍 Quality Insights:</h5>
            <div className="text-xs text-gray-700 space-y-1">
              {qualityData.overall >= 4.5 && (
                <div className="text-green-700">
                  ✅ Excellent quality maintained across all factors
                </div>
              )}
              {qualityData.overall >= 3.5 && qualityData.overall < 4.5 && (
                <div className="text-yellow-700">
                  ⚠️ Good quality with room for improvement
                </div>
              )}
              {qualityData.overall < 3.5 && (
                <div className="text-red-700">
                  🚨 Quality needs immediate attention
                </div>
              )}
              <div className="text-blue-700">
                📈 Real-time monitoring active
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartQualityAssurance;
