import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function OrderForm({ fetchOrders, editing, setEditing }) {
  const emptyItem = { name: "", quantity: "" };
  const emptyForm = {
    items: [emptyItem],
    paymentMethod: "",
    deliveryMethod: "",
    address: "",
    customerName: "",
    customerContact: "",
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // sync when editing
  useEffect(() => {
    setForm(editing || emptyForm);
    setErrors({});
  }, [editing]);


  const baseInput =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]";
  const borderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (field in form && form[field] && !errors[field]) return "border-green-500";
    return "border-[#D6A77A]";
  };

  const validateField = (name, value) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${name.replace(/([A-Z])/g, " $1")} is required.`;
    }
    if (name === "customerContact" && !/^\d{7,15}$/.test(value)) {
      return "Contact must be 7 to 15 digits.";
    }
    if (name === "quantity" && (+value < 1 || isNaN(+value))) {
      return "Quantity must be 1 or more.";
    }
    if (name === "paymentMethod" || name === "deliveryMethod" || name === "address") {
      return value.trim() ? "" : `${name} is required.`;
    }
    
    // Only date validation (no time validation)
    if (name === "orderDate") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return "Order date cannot be in the past. Please select today or a future date.";
      }
    }
    
    return "";
  };

  const validateForm = () => {
    const nextErrors = {};

    // top‑level fields
    ["paymentMethod", "deliveryMethod", "address", "orderDate"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) nextErrors[f] = err;
    });

    // items
    form.items.forEach((item, idx) => {
      ["name", "quantity"].forEach((f) => {
        const key = `item-${f}-${idx}`;
        const err = validateField(f, item[f]);
        if (err) nextErrors[key] = err;
      });
    });

    // customer contact optional validation
    if (form.customerContact) {
      const err = validateField("customerContact", form.customerContact);
      if (err) nextErrors.customerContact = err;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Validate the changed field
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleItemChange = (idx, { target: { name, value } }) => {
    const updatedItems = form.items.map((it, i) =>
      i === idx ? { ...it, [name]: name === "quantity" ? +value : value } : it
    );
    setForm((prev) => ({ ...prev, items: updatedItems }));

    const key = `item-${name}-${idx}`;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [key]: err }));
  };

  const addItem = () =>
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem] }));
  const removeItem = (idx) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Please complete all required fields.");
      return;
    }
    
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/orders/${editing._id}`, form);
        toast.success("Order updated successfully!");
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/orders", form);
        toast.success("Order created successfully!");
      }
      fetchOrders();
      setForm(emptyForm);
    } catch (err) {
      toast.error(
        `Error: ${err.response?.data?.message || "submission failed"}`
      );
    }
  };

  const slideVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <motion.form
        onSubmit={handleSubmit}
        variants={slideVariant}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto p-8 bg-white border border-[#D6A77A] rounded-2xl shadow-xl space-y-6"
      >
        {/* title */}
        <h2 className="text-3xl font-bold text-center text-[#7B3F00] lowercase">
          {editing ? "update order" : "create new order"}
        </h2>

        {/* items list */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#7B3F00]">order items</h3>

          {form.items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200"
            >
              {/* item name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Item Name</label>
                <input
                  name="name"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, e)}
                  className={`${baseInput} ${borderClass(`item-name-${idx}`)}`}
                />
                {errors[`item-name-${idx}`] && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors[`item-name-${idx}`]}
                  </p>
                )}
              </div>

              {/* quantity */}
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Qty</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, e)}
                  className={`${baseInput} ${borderClass(`item-quantity-${idx}`)}`}
                />
                {errors[`item-quantity-${idx}`] && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors[`item-quantity-${idx}`]}
                  </p>
                )}
              </div>

              

              {/* remove button */}
              {form.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="col-span-full text-right text-sm text-red-600 hover:underline"
                >
                  remove item
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-[#7B3F00] hover:text-amber-600 transition lowercase"
          >
            + add another item
          </button>
        </div>

        {/* payment & delivery */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: "paymentMethod", ph: "Payment method", label: "Payment Method" },
            { name: "deliveryMethod", ph: "Delivery method", label: "Delivery Method" }
          ].map(({ name, ph, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-[#7B3F00] mb-2">{label}</label>
              <input
                name={name}
                placeholder={ph}
                value={form[name]}
                onChange={handleChange}
                className={`${baseInput} ${borderClass(name)}`}
              />
              {errors[name] && (
                <p className="text-red-600 text-xs mt-1">{errors[name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* address */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Delivery Address</label>
          <textarea
            name="address"
            placeholder="Delivery address"
            value={form.address}
            onChange={handleChange}
            className={`${baseInput} ${borderClass("address")} resize-none`}
            rows={3}
          />
          {errors.address && (
            <p className="text-red-600 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        {/* customer info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-2">Customer Name</label>
            <input
              name="customerName"
              placeholder="Customer name"
              value={form.customerName}
              onChange={handleChange}
              className={`${baseInput} ${borderClass("customerName")}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-2">Customer Contact</label>
            <input
              name="customerContact"
              placeholder="Customer contact"
              value={form.customerContact}
              onChange={handleChange}
              className={`${baseInput} ${borderClass("customerContact")}`}
            />
            {errors.customerContact && (
              <p className="text-red-600 text-xs mt-1">
                {errors.customerContact}
              </p>
            )}
          </div>
        </div>

        {/* order date and time */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-2">
              Order Date
            </label>
            <input
              name="orderDate"
              type="date"
              value={form.orderDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`${baseInput} ${borderClass("orderDate")}`}
            />
            {errors.orderDate && (
              <p className="text-red-600 text-xs mt-1">{errors.orderDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-2">
              Order Time
            </label>
            <input
              name="orderTime"
              type="time"
              value={form.orderTime}
              onChange={handleChange}
              className={`${baseInput} ${borderClass("orderTime")}`}
            />
            {errors.orderTime && (
              <p className="text-red-600 text-xs mt-1">{errors.orderTime}</p>
            )}
          </div>
        </div>

        {/* submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#7B3F00] text-white font-semibold hover:bg-[#5C2C00] transition-colors duration-300 lowercase"
        >
          {editing ? "update order" : "create order"}
        </button>
      </motion.form>
    </>
  );
}

export default OrderForm;
