import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FeedbackForm({ fetchFeedback, editing, setEditing, products }) {
  const INITIAL_FORM = {
    customerName: "",
    customerEmail: "",
    productId: "",
    rating: "",
    comment: "",
    status: "pending",
    isPublic: false
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
      setErrors({});
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [editing]);

  // Validation per field
  const validateField = (name, value) => {
    switch (name) {
      case "customerName":
        return value.trim() ? "" : "Customer name is required";
      case "customerEmail":
        if (value === "") return "Customer email is required";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
      case "productId":
        return value ? "" : "Product selection is required";
      case "rating":
        if (value === "") return "Rating is required";
        return Number(value) >= 1 && Number(value) <= 5 ? "" : "Rating must be between 1 and 5";
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

        {/* Product Selection */}
        <div>
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "productId"
            )}`}
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.category}
              </option>
            ))}
          </select>
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

        {/* Comment */}
        <div>
          <textarea
            name="comment"
            placeholder="Customer Comment"
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
