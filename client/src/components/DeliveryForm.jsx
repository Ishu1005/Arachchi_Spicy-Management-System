import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeliveryForm({ fetchDelivery, editing, setEditing, orders }) {
  const INITIAL_FORM = {
    orderId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZipCode: "",
    deliveryDate: "",
    status: "pending",
    deliveryNotes: "",
    deliveryPerson: "",
    estimatedDeliveryTime: "",
    
    // Enhanced Order Information
    orderInfo: {
      orderDate: "",
      productsList: [],
      totalAmount: 0,
      paymentStatus: "pending", // Paid / COD / Pending
      orderNumber: ""
    },
    
    // Enhanced Delivery Address
    addressDetails: {
      street: "",
      city: "",
      postalCode: "",
      district: "",
      province: "",
      coordinates: {
        latitude: "",
        longitude: ""
      },
      specialNotes: ""
    },
    
    // Delivery Agent Details
    agentDetails: {
      driverSelection: "",
      agentId: "",
      agentName: "",
      agentPhone: "",
      contactNumber: "",
      vehicleNumber: "",
      deliveryStatus: "assigned" // Assigned / In Progress / Delivered / Cancelled
    },
    
    // Delivery Time & Tracking
    timeTracking: {
      estimatedArrival: "",
      actualDeliveryTime: "",
      deliveryDistance: 0,
      realTimeLocation: "",
      aiPrediction: ""
    },
    
    // Delivery Status & Notifications
    statusTracking: {
      currentStatus: "packing", // Packing / Dispatched / On the way / Delivered / Failed
      notifications: []
    },
    
    // Delivery Method
    deliveryMethod: {
      type: "standard", // standard / express / pickup / courier / eco
      description: "",
      charge: 0,
      estimatedTime: "",
      features: []
    },
    
    smartDelivery: {
      routeOptimized: false,
      weatherChecked: false,
      trafficConsidered: false,
      bulkOrderDetected: false,
      expressDeliverySuggested: false
    }
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [smartFeatures, setSmartFeatures] = useState({
    routeOptimization: false,
    weatherAlert: false,
    trafficUpdate: false,
    bulkOrderSuggestion: false
  });

  // Delivery Methods Configuration
  const deliveryMethods = {
    standard: {
      name: "Standard Home Delivery",
      description: "Once the customer confirms the order, a company delivery driver brings it directly to their home.",
      charge: 300,
      estimatedTime: "1–3 days",
      features: [
        "Fixed delivery charge (Rs. 300 island-wide)",
        "Estimated delivery time: 1–3 days",
        "Tracking available: On the way → Delivered",
        "COD (Cash on Delivery) support"
      ],
      bestFor: "Regular customers and standard spice orders",
      icon: "📦"
    },
    express: {
      name: "Express Delivery (Same-Day Delivery)",
      description: "High-priority delivery for urban areas like Colombo, Galle, Kandy — same-day delivery guaranteed.",
      charge: 600,
      estimatedTime: "4–6 hours",
      features: [
        "Higher delivery charge (Rs. 600)",
        "Estimated delivery time: 4–6 hours",
        "Real-time tracking & live ETA",
        "Auto notifications: 'Your express delivery is on the way!'"
      ],
      bestFor: "Urgent orders, bulk buyers, restaurants",
      icon: "⚡"
    },
    pickup: {
      name: "Pickup Point / Store Pickup",
      description: "Customers place the order online and collect it from their nearest branch.",
      charge: 0,
      estimatedTime: "Immediate",
      features: [
        "No delivery charge",
        "Pickup confirmation via SMS/Email",
        "QR code-based pickup verification"
      ],
      bestFor: "Local customers near branch locations",
      icon: "🏪"
    },
    courier: {
      name: "Third-Party Courier Delivery",
      description: "Orders are delivered using external courier companies (e.g., Domex, Pronto, Speedee).",
      charge: 400,
      estimatedTime: "2–5 days",
      features: [
        "Courier tracking number auto-generated",
        "ETA updates via integrated API",
        "Delivery charges auto-calculated based on weight & distance"
      ],
      bestFor: "Island-wide or international deliveries",
      icon: "📦"
    },
    eco: {
      name: "Eco-Friendly / Bicycle Delivery",
      description: "Short-distance deliveries (within 5 km) handled by eco-delivery riders using bicycles or electric scooters.",
      charge: 200,
      estimatedTime: "30–60 minutes",
      features: [
        "No fuel cost → eco-friendly",
        "Estimated delivery time: 30–60 minutes",
        "Ideal for small spice packs"
      ],
      bestFor: "Customers wanting fast, sustainable deliveries",
      icon: "🚴‍♂️"
    }
  };

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
      setErrors({});
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [editing]);

  // Smart delivery analysis when order is selected
  useEffect(() => {
    if (form.orderId && orders && orders.length > 0) {
      const selectedOrder = orders.find(order => order._id === form.orderId);
      if (selectedOrder) {
        analyzeOrderForSmartDelivery(selectedOrder);
      }
    }
  }, [form.orderId, orders]);

  const analyzeOrderForSmartDelivery = (order) => {
    const smartAnalysis = {
      routeOptimization: false,
      weatherAlert: false,
      trafficUpdate: false,
      bulkOrderSuggestion: false
    };

    // Populate order information
    const orderInfo = {
      orderDate: order?.createdAt || new Date().toISOString(),
      productsList: order?.items || [],
      totalAmount: order?.totalAmount || 0,
      paymentStatus: order?.paymentStatus || "pending",
      orderNumber: order?.orderNumber || `ORD-${Date.now()}`
    };

    // Check if it's a bulk order (quantity > 10)
    const totalQuantity = order?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    if (totalQuantity > 10) {
      smartAnalysis.bulkOrderSuggestion = true;
      toast.info("🤖 Bulk order detected! Consider express delivery for better customer satisfaction.", {
        autoClose: 5000
      });
    }

    // Check delivery city for route optimization
    if (form.deliveryCity) {
      const majorCities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura'];
      if (majorCities.includes(form.deliveryCity)) {
        smartAnalysis.routeOptimization = true;
        toast.success("🚚 Route optimization available for this city!", {
          autoClose: 3000
        });
      }
    }

    // Simulate weather check (in real app, this would call a weather API)
    const weatherConditions = ['sunny', 'rainy', 'stormy'];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    if (randomWeather === 'rainy' || randomWeather === 'stormy') {
      smartAnalysis.weatherAlert = true;
      toast.warning(`🌧️ Weather Alert: ${randomWeather} conditions predicted. Consider rescheduling outdoor deliveries.`, {
        autoClose: 6000
      });
    }

    // Traffic update simulation
    const trafficLevels = ['low', 'medium', 'high'];
    const randomTraffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
    
    if (randomTraffic === 'high') {
      smartAnalysis.trafficUpdate = true;
      toast.info(`🚦 Traffic Alert: High traffic detected. Estimated delivery time may increase by 30 minutes.`, {
        autoClose: 4000
      });
    }

    setSmartFeatures(smartAnalysis);
    
    // Update form with smart delivery data and order info
    setForm(prev => ({
      ...prev,
      orderInfo: orderInfo,
      smartDelivery: {
        routeOptimized: smartAnalysis.routeOptimization,
        weatherChecked: smartAnalysis.weatherAlert,
        trafficConsidered: smartAnalysis.trafficUpdate,
        bulkOrderDetected: smartAnalysis.bulkOrderSuggestion,
        expressDeliverySuggested: smartAnalysis.bulkOrderSuggestion
      }
    }));
  };

  // Validation per field
  const validateField = (name, value) => {
    switch (name) {
      case "orderId":
        return value ? "" : "Order selection is required";
      case "customerName":
        return value.trim() ? "" : "Customer name is required";
      case "customerEmail":
        if (value === "") return "Customer email is required";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
      case "customerPhone":
        return value.trim() ? "" : "Customer phone is required";
      case "deliveryAddress":
        return value.trim() ? "" : "Delivery address is required";
      case "deliveryCity":
        return value.trim() ? "" : "Delivery city is required";
      case "deliveryState":
        return value.trim() ? "" : "Delivery state is required";
      case "deliveryZipCode":
        return value.trim() ? "" : "Delivery zip code is required";
      case "deliveryDate":
        if (!value) return "Delivery date is required";
        const selectedDate = new Date(value);
        const now = new Date();
        if (selectedDate <= now) return "Delivery date must be in the future";
        return "";
      default:
        return "";
    }
  };

  // Validate entire form
  const validateForm = () => {
    const nextErrors = {};
    Object.entries(form).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) nextErrors[key] = err;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Live validation on field change
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Handle driver selection
  const handleDriverSelection = (e) => {
    const { value } = e.target;
    const driverData = {
      driver1: { agentName: "Nimal Perera", agentPhone: "0771234567", vehicleNumber: "ABC-1234" },
      driver2: { agentName: "Sunil Jayawardena", agentPhone: "0719876543", vehicleNumber: "XYZ-5678" },
      driver3: { agentName: "Kamal Fernando", agentPhone: "0723456789", vehicleNumber: "DEF-4321" },
      driver4: { agentName: "Priya Silva", agentPhone: "0708765432", vehicleNumber: "GHI-8765" },
      driver5: { agentName: "Roshan De Silva", agentPhone: "0752345678", vehicleNumber: "JKL-6543" }
    };

    const selectedDriver = driverData[value] || {};
    
    setForm(prev => ({
      ...prev,
      agentDetails: {
        ...prev.agentDetails,
        driverSelection: value,
        agentName: selectedDriver.agentName || "",
        agentPhone: selectedDriver.agentPhone || "",
        vehicleNumber: selectedDriver.vehicleNumber || ""
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      const allErrors = Object.values(errors).filter(Boolean).join("\n");
      toast.error(allErrors || "Please fix the errors before submitting", {
        autoClose: 4000,
      });
      return;
    }

    try {
      if (editing) {
        await axios.put(
          `http://localhost:5000/api/delivery/${editing._id}`,
          form
        );
        toast.success("Delivery updated successfully!");
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/delivery", form);
        toast.success("Delivery added successfully!");
      }
      setForm(INITIAL_FORM);
      setErrors({});
      fetchDelivery();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save delivery. Please try again!");
    }
  };

  // Border colors for inputs
  const borderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (form[field] && !errors[field]) return "border-green-500";
    return "border-amber-300";
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-8 bg-white shadow-lg rounded-xl border border-amber-200 mx-auto max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-center text-[#7B3F00]">
          {editing ? "Edit Delivery" : "Add New Delivery"}
        </h2>

        {/* Order Selection */}
        <div>
          <select
            name="orderId"
            value={form.orderId}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "orderId"
            )}`}
          >
            <option value="">Select Order</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                Order #{order?.orderNumber || order._id} - ${order?.totalAmount || 0}
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="text-red-600 text-xs mt-1">{errors.orderId}</p>
          )}
        </div>

        {/* Order Information Section */}
        {form.orderId && form.orderInfo?.orderNumber && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">📋</span>
              <h3 className="text-lg font-semibold text-amber-700">Order Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Order ID:</span>
                  <span className="text-sm font-semibold text-amber-700">{form.orderInfo?.orderNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Order Date:</span>
                  <span className="text-sm text-gray-800">{form.orderInfo?.orderDate ? new Date(form.orderInfo.orderDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="text-sm font-semibold text-green-600">Rs. {form.orderInfo?.totalAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    form.orderInfo?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    form.orderInfo?.paymentStatus === 'cod' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(form.orderInfo?.paymentStatus || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Ordered Products:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(form.orderInfo?.productsList || []).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs bg-white p-2 rounded border">
                      <span>{item?.name || item?.productName || 'Unknown Product'}</span>
                      <span className="text-gray-600">Qty: {item?.quantity || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Delivery Status */}
        {form.orderId && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🤖</span>
              <h3 className="text-lg font-semibold text-indigo-700">Smart Delivery Analysis</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${smartFeatures.routeOptimization ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">🚚</span>
                  <div>
                    <p className="text-sm font-medium">Route Optimization</p>
                    <p className="text-xs text-gray-600">
                      {smartFeatures.routeOptimization ? 'Available' : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${smartFeatures.weatherAlert ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-100'}`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">🌧️</span>
                  <div>
                    <p className="text-sm font-medium">Weather Check</p>
                    <p className="text-xs text-gray-600">
                      {smartFeatures.weatherAlert ? 'Alert detected' : 'Clear conditions'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${smartFeatures.trafficUpdate ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100'}`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">🚦</span>
                  <div>
                    <p className="text-sm font-medium">Traffic Status</p>
                    <p className="text-xs text-gray-600">
                      {smartFeatures.trafficUpdate ? 'High traffic' : 'Normal traffic'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${smartFeatures.bulkOrderSuggestion ? 'bg-purple-100 border border-purple-300' : 'bg-gray-100'}`}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">📦</span>
                  <div>
                    <p className="text-sm font-medium">Order Type</p>
                    <p className="text-xs text-gray-600">
                      {smartFeatures.bulkOrderSuggestion ? 'Bulk order detected' : 'Standard order'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {smartFeatures.bulkOrderSuggestion && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-2">💡</span>
                  <p className="text-sm text-purple-700">
                    <strong>Suggestion:</strong> Consider express delivery for better customer satisfaction
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Name */}
        <div>
          <input
            name="customerName"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "customerName"
            )}`}
          />
          {errors.customerName && (
            <p className="text-red-600 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Customer Email */}
        <div>
          <input
            name="customerEmail"
            type="email"
            placeholder="Customer Email"
            value={form.customerEmail}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "customerEmail"
            )}`}
          />
          {errors.customerEmail && (
            <p className="text-red-600 text-xs mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Customer Phone */}
        <div>
          <input
            name="customerPhone"
            placeholder="Customer Phone"
            value={form.customerPhone}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "customerPhone"
            )}`}
          />
          {errors.customerPhone && (
            <p className="text-red-600 text-xs mt-1">{errors.customerPhone}</p>
          )}
        </div>

        {/* Enhanced Delivery Address Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">📍</span>
            <h3 className="text-lg font-semibold text-green-700">Delivery Address Details</h3>
          </div>
          
          <div className="space-y-4">
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <textarea
                name="deliveryAddress"
                placeholder="Enter complete delivery address..."
                value={form.deliveryAddress}
                onChange={handleChange}
                rows="3"
                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${borderClass(
                  "deliveryAddress"
                )}`}
              />
              {errors.deliveryAddress && (
                <p className="text-red-600 text-xs mt-1">{errors.deliveryAddress}</p>
              )}
            </div>

            {/* City, District, Province Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  name="deliveryCity"
                  placeholder="City"
                  value={form.deliveryCity}
                  onChange={handleChange}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${borderClass(
                    "deliveryCity"
                  )}`}
                />
                {errors.deliveryCity && (
                  <p className="text-red-600 text-xs mt-1">{errors.deliveryCity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  name="deliveryState"
                  value={form.deliveryState}
                  onChange={handleChange}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${borderClass(
                    "deliveryState"
                  )}`}
                >
                  <option value="">Select District</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Matale">Matale</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Galle">Galle</option>
                  <option value="Matara">Matara</option>
                  <option value="Hambantota">Hambantota</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kilinochchi">Kilinochchi</option>
                  <option value="Mannar">Mannar</option>
                  <option value="Vavuniya">Vavuniya</option>
                  <option value="Mullaitivu">Mullaitivu</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Ampara">Ampara</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Puttalam">Puttalam</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                  <option value="Badulla">Badulla</option>
                  <option value="Monaragala">Monaragala</option>
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Kegalle">Kegalle</option>
                </select>
                {errors.deliveryState && (
                  <p className="text-red-600 text-xs mt-1">{errors.deliveryState}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  name="deliveryZipCode"
                  placeholder="Postal Code"
                  value={form.deliveryZipCode}
                  onChange={handleChange}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${borderClass(
                    "deliveryZipCode"
                  )}`}
                />
                {errors.deliveryZipCode && (
                  <p className="text-red-600 text-xs mt-1">{errors.deliveryZipCode}</p>
                )}
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <select
                name="addressDetails.province"
                value={form.addressDetails?.province || ""}
                onChange={handleChange}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Province</option>
                <option value="Western Province">Western Province</option>
                <option value="Central Province">Central Province</option>
                <option value="Southern Province">Southern Province</option>
                <option value="Northern Province">Northern Province</option>
                <option value="Eastern Province">Eastern Province</option>
                <option value="North Central Province">North Central Province</option>
                <option value="North Western Province">North Western Province</option>
                <option value="Uva Province">Uva Province</option>
                <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date & Time</label>
          <input
            name="deliveryDate"
            type="datetime-local"
            value={form.deliveryDate}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "deliveryDate"
            )}`}
          />
          {errors.deliveryDate && (
            <p className="text-red-600 text-xs mt-1">{errors.deliveryDate}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Please select a future date and time for delivery</p>
        </div>

        {/* Status (only for editing) */}
        {editing && (
          <div>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}

        {/* Enhanced Agent Details Section */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">👤</span>
            <h3 className="text-lg font-semibold text-purple-700">Delivery Agent / Driver Details</h3>
          </div>
          
          <div className="space-y-4">
            {/* Driver Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👤 Select Driver</label>
              <select
                name="agentDetails.driverSelection"
                value={form.agentDetails?.driverSelection || ""}
                onChange={handleDriverSelection}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a Driver</option>
                <option value="driver1">Nimal Perera - ABC-1234</option>
                <option value="driver2">Sunil Jayawardena - XYZ-5678</option>
                <option value="driver3">Kamal Fernando - DEF-4321</option>
                <option value="driver4">Priya Silva - GHI-8765</option>
                <option value="driver5">Roshan De Silva - JKL-6543</option>
              </select>
            </div>

            {/* Agent Name and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                <input
                  name="agentDetails.agentName"
                  placeholder="Agent name"
                  value={form.agentDetails?.agentName || ""}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from driver selection</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Phone Number</label>
                <div className="relative">
                  <input
                    name="agentDetails.agentPhone"
                    placeholder="0771234567"
                    value={form.agentDetails?.agentPhone || ""}
                    onChange={handleChange}
                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12 bg-gray-50"
                    readOnly
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-filled from driver selection</p>
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
              <input
                name="agentDetails.vehicleNumber"
                placeholder="ABC-1234"
                value={form.agentDetails?.vehicleNumber || ""}
                onChange={handleChange}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from driver selection</p>
            </div>

            {/* Delivery Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
              <select
                name="agentDetails.deliveryStatus"
                value={form.agentDetails?.deliveryStatus || "assigned"}
                onChange={handleChange}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Delivery Method Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🚚</span>
            <h3 className="text-lg font-semibold text-indigo-700">Delivery Method</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(deliveryMethods).map(([key, method]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    form.deliveryMethod?.type === key
                      ? 'border-indigo-500 bg-indigo-50'
                      : key === 'eco' 
                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      deliveryMethod: {
                        type: key,
                        description: method.description,
                        charge: method.charge,
                        estimatedTime: method.estimatedTime,
                        features: method.features
                      }
                    }));
                  }}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{method.icon}</span>
                    <h4 className="font-semibold text-gray-800">{method.name}</h4>
                    <div className="ml-auto flex items-center space-x-2">
                      {key === 'eco' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          🌱 ECO
                        </span>
                      )}
                      {form.deliveryMethod?.type === key && (
                        <span className="text-green-600">✓</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ETA:</span>
                      <span className="font-medium text-blue-600">{method.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Charge:</span>
                      <span className={`font-bold ${method.charge === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {method.charge === 0 ? 'FREE' : `Rs. ${method.charge}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center mb-1">
                      <span className="text-green-500 mr-1">✅</span>
                      <strong>Best for:</strong>
                    </div>
                    <span className="text-gray-700">{method.bestFor}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Selected Method Details */}
            {form.deliveryMethod?.type && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-700 mb-2">
                  {deliveryMethods[form.deliveryMethod.type].icon} {deliveryMethods[form.deliveryMethod.type].name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Features:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {deliveryMethods[form.deliveryMethod.type].features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Delivery Summary:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-medium">{deliveryMethods[form.deliveryMethod.type].estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charge:</span>
                        <span className={`font-bold text-lg ${deliveryMethods[form.deliveryMethod.type].charge === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {deliveryMethods[form.deliveryMethod.type].charge === 0 ? 'FREE' : `Rs. ${deliveryMethods[form.deliveryMethod.type].charge}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best For:</span>
                        <span className="font-medium text-blue-600">{deliveryMethods[form.deliveryMethod.type].bestFor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (Optional)</label>
          <textarea
            name="deliveryNotes"
            placeholder="Additional delivery instructions or notes..."
            value={form.deliveryNotes}
            onChange={handleChange}
            rows="3"
            className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#7B3F00] text-white py-3 rounded-lg hover:bg-[#6A2C00] transition duration-300"
        >
          {editing ? "Update Delivery" : "Add Delivery"}
        </button>
      </form>
    </>
  );
}

export default DeliveryForm;
