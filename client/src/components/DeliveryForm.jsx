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
    estimatedDeliveryTime: ""
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
        return value ? "" : "Delivery date is required";
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
                Order #{order.orderNumber} - ${order.totalAmount}
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="text-red-600 text-xs mt-1">{errors.orderId}</p>
          )}
        </div>

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

        {/* Delivery Address */}
        <div>
          <textarea
            name="deliveryAddress"
            placeholder="Delivery Address"
            value={form.deliveryAddress}
            onChange={handleChange}
            rows="3"
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "deliveryAddress"
            )}`}
          />
          {errors.deliveryAddress && (
            <p className="text-red-600 text-xs mt-1">{errors.deliveryAddress}</p>
          )}
        </div>

        {/* City, State, Zip Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              name="deliveryCity"
              placeholder="City"
              value={form.deliveryCity}
              onChange={handleChange}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
                "deliveryCity"
              )}`}
            />
            {errors.deliveryCity && (
              <p className="text-red-600 text-xs mt-1">{errors.deliveryCity}</p>
            )}
          </div>
          <div>
            <input
              name="deliveryState"
              placeholder="State"
              value={form.deliveryState}
              onChange={handleChange}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
                "deliveryState"
              )}`}
            />
            {errors.deliveryState && (
              <p className="text-red-600 text-xs mt-1">{errors.deliveryState}</p>
            )}
          </div>
          <div>
            <input
              name="deliveryZipCode"
              placeholder="Zip Code"
              value={form.deliveryZipCode}
              onChange={handleChange}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
                "deliveryZipCode"
              )}`}
            />
            {errors.deliveryZipCode && (
              <p className="text-red-600 text-xs mt-1">{errors.deliveryZipCode}</p>
            )}
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <input
            name="deliveryDate"
            type="datetime-local"
            value={form.deliveryDate}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "deliveryDate"
            )}`}
          />
          {errors.deliveryDate && (
            <p className="text-red-600 text-xs mt-1">{errors.deliveryDate}</p>
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
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}

        {/* Delivery Person */}
        <div>
          <input
            name="deliveryPerson"
            placeholder="Delivery Person (Optional)"
            value={form.deliveryPerson}
            onChange={handleChange}
            className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Estimated Delivery Time */}
        <div>
          <input
            name="estimatedDeliveryTime"
            placeholder="Estimated Delivery Time (e.g., 2-3 business days)"
            value={form.estimatedDeliveryTime}
            onChange={handleChange}
            className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Delivery Notes */}
        <div>
          <textarea
            name="deliveryNotes"
            placeholder="Delivery Notes (Optional)"
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
