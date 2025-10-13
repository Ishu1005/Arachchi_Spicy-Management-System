import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function FeedbackForm({ fetchFeedback, editing, setEditing, products, fetchRatingHistory }) {
  const INITIAL_FORM = {
    customerName: "",
    customerEmail: "",
    productId: "",
    rating: "",
    emojiReaction: "",
    mood: "",
    comment: "",
    status: "pending",
    isPublic: false
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Enhanced Smart Emoji Rating System
  const smartEmojiRatings = {
    excellent: { 
      emoji: "🌟", 
      label: "Excellent", 
      color: "text-yellow-500", 
      rating: 5,
      description: "Outstanding quality and service"
    },
    very_good: { 
      emoji: "😊", 
      label: "Very Good", 
      color: "text-green-500", 
      rating: 4,
      description: "Great experience overall"
    },
    good: { 
      emoji: "😌", 
      label: "Good", 
      color: "text-blue-500", 
      rating: 3,
      description: "Satisfied with the product"
    },
    fair: { 
      emoji: "😐", 
      label: "Fair", 
      color: "text-gray-500", 
      rating: 2,
      description: "Average experience"
    },
    poor: { 
      emoji: "😞", 
      label: "Poor", 
      color: "text-red-500", 
      rating: 1,
      description: "Needs improvement"
    }
  };

  // Additional mood-based emojis for emotional context
  const moodEmojis = {
    excited: { emoji: "🤩", label: "Excited", color: "text-orange-500" },
    surprised: { emoji: "😲", label: "Surprised", color: "text-purple-500" },
    frustrated: { emoji: "😤", label: "Frustrated", color: "text-red-600" },
    angry: { emoji: "😠", label: "Angry", color: "text-red-700" },
    loved: { emoji: "🥰", label: "Loved It", color: "text-pink-500" },
    impressed: { emoji: "🤯", label: "Impressed", color: "text-indigo-500" }
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

  // Fetch customers for auto-suggestion
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Filter customers based on input
  const filterCustomers = (input, field) => {
    if (!input || input.length < 1) {
      setFilteredCustomers([]);
      return;
    }
    
    const filtered = customers.filter(customer => 
      customer[field]?.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  // Handle customer name input with auto-suggestion
  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, customerName: value }));
    setErrors(prev => ({ ...prev, customerName: validateField("customerName", value) }));
    
    if (value.length > 0) {
      filterCustomers(value, 'name');
      setShowNameSuggestions(true);
    } else {
      setShowNameSuggestions(false);
    }
  };

  // Handle customer email input with auto-suggestion
  const handleCustomerEmailChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, customerEmail: value }));
    setErrors(prev => ({ ...prev, customerEmail: validateField("customerEmail", value) }));
    
    if (value.length > 0) {
      filterCustomers(value, 'email');
      setShowEmailSuggestions(true);
    } else {
      setShowEmailSuggestions(false);
    }
  };

  // Select customer from suggestion
  const selectCustomer = (customer) => {
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email
    }));
    setShowNameSuggestions(false);
    setShowEmailSuggestions(false);
    setFilteredCustomers([]);
  };

  // Handle smart emoji rating selection
  const handleSmartRating = (ratingKey) => {
    const selectedRating = smartEmojiRatings[ratingKey];
    setForm(prev => ({
      ...prev,
      rating: selectedRating.rating.toString(),
      emojiReaction: selectedRating.emoji,
      mood: ratingKey
    }));
    
    setErrors(prev => ({
      ...prev,
      rating: "",
      emojiReaction: "",
      mood: ""
    }));
  };

  // Handle mood emoji selection
  const handleMoodSelection = (moodKey) => {
    const selectedMood = moodEmojis[moodKey];
    setForm(prev => ({
      ...prev,
      emojiReaction: selectedMood.emoji,
      mood: moodKey
    }));
    
    setErrors(prev => ({
      ...prev,
      emojiReaction: "",
      mood: ""
    }));
  };

  // Validation per field
  const validateField = (name, value) => {
    switch (name) {
      case "customerName":
        return value.trim() ? "" : "Customer name is required";
      case "customerEmail":
        if (value === "") return "Customer email is required";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
      case "productId":
        return value.trim() ? "" : "Product name is required";
      case "rating":
        if (value === "") return "Rating is required";
        return Number(value) >= 1 && Number(value) <= 5 ? "" : "Rating must be between 1 and 5";
      case "emojiReaction":
        return value ? "" : "Please select your mood reaction";
      case "mood":
        return value ? "" : "Please select your mood";
      case "comment":
        return value.trim() ? "" : "Comment is required";
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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));

    // Live validation on field change
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
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
          `http://localhost:5000/api/feedback/${editing._id}`,
          form
        );
        toast.success("Feedback updated successfully!");
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/feedback", form);
        toast.success("Feedback added successfully!");
      }
      setForm(INITIAL_FORM);
      setErrors({});
      fetchFeedback();
      if (fetchRatingHistory) {
        fetchRatingHistory(); // Refresh chart data
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save feedback. Please try again!");
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
          {editing ? "Edit Feedback" : "Add New Feedback"}
        </h2>

        {/* Customer Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
          <input
            name="customerName"
            placeholder="Enter customer name"
            value={form.customerName}
            onChange={handleCustomerNameChange}
            onFocus={() => form.customerName && setShowNameSuggestions(true)}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "customerName"
            )}`}
          />
          {showNameSuggestions && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={index}
                  onClick={() => selectCustomer(customer)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                </div>
              ))}
            </div>
          )}
          {errors.customerName && (
            <p className="text-red-600 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Customer Email */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
          <input
            name="customerEmail"
            type="email"
            placeholder="Enter customer email"
            value={form.customerEmail}
            onChange={handleCustomerEmailChange}
            onFocus={() => form.customerEmail && setShowEmailSuggestions(true)}
            onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "customerEmail"
            )}`}
          />
          {showEmailSuggestions && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={index}
                  onClick={() => selectCustomer(customer)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                </div>
              ))}
            </div>
          )}
          {errors.customerEmail && (
            <p className="text-red-600 text-xs mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input
            name="productId"
            placeholder="Enter product name (e.g., Cinnamon, Cardamom, Pepper)"
            value={form.productId}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "productId"
            )}`}
          />
          {errors.productId && (
            <p className="text-red-600 text-xs mt-1">{errors.productId}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "rating"
            )}`}
          >
            <option value="">Select Rating</option>
            <option value="1">1 Star - Poor</option>
            <option value="2">2 Stars - Fair</option>
            <option value="3">3 Stars - Good</option>
            <option value="4">4 Stars - Very Good</option>
            <option value="5">5 Stars - Excellent</option>
          </select>
          {errors.rating && (
            <p className="text-red-600 text-xs mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Smart Emoji Rating System */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
          <label className="block text-sm font-medium text-[#7B3F00] mb-4">
            🌟 Smart Rating System - Rate Your Experience
          </label>
          
          {/* Primary Rating Emojis */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {Object.entries(smartEmojiRatings).map(([key, rating]) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => handleSmartRating(key)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  form.mood === key
                    ? 'border-[#7B3F00] bg-amber-100 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className={`text-4xl mb-2 ${rating.color}`}>
                    {rating.emoji}
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    {rating.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {rating.rating}/5
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Selected Rating Display */}
          {form.emojiReaction && smartEmojiRatings[form.mood] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{form.emojiReaction}</span>
                  <div>
                    <div className="text-green-800 font-bold text-lg">
                      {smartEmojiRatings[form.mood].label} ({smartEmojiRatings[form.mood].rating}/5)
                    </div>
                    <div className="text-green-700 text-sm">
                      {smartEmojiRatings[form.mood].description}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < smartEmojiRatings[form.mood].rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Additional Mood Emojis */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              😊 Additional Emotional Context (Optional)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(moodEmojis).map(([key, mood]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => handleMoodSelection(key)}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    form.mood === key && !smartEmojiRatings[key]
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className={`text-2xl ${mood.color}`}>
                      {mood.emoji}
                    </div>
                    <div className="text-xs text-gray-600">
                      {mood.label}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {errors.emojiReaction && (
            <p className="text-red-600 text-xs mt-2">{errors.emojiReaction}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Comment</label>
          <textarea
            name="comment"
            placeholder="Enter customer comment"
            value={form.comment}
            onChange={handleChange}
            rows="4"
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "comment"
            )}`}
          />
          {errors.comment && (
            <p className="text-red-600 text-xs mt-1">{errors.comment}</p>
          )}
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {/* Public Visibility (only for editing) */}
        {editing && (
          <div className="flex items-center space-x-2">
            <input
              name="isPublic"
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange}
              className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
            />
            <label className="text-sm text-gray-700">Make feedback public</label>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#7B3F00] text-white py-3 rounded-lg hover:bg-[#6A2C00] transition duration-300"
        >
          {editing ? "Update Feedback" : "Add Feedback"}
        </button>
      </form>
    </>
  );
}

export default FeedbackForm;
