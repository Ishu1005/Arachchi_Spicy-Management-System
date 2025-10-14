import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function OrderForm({ fetchOrders, editing, setEditing }) {
  const emptyItem = { name: "", quantity: "", category: "" };
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
    }),
    productImage: null
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // sync when editing
  useEffect(() => {
    setForm(editing || emptyForm);
    setErrors({});
    
    // Set image preview if editing and has existing image
    if (editing && editing.productImage) {
      setImagePreview(`http://localhost:5000/uploads/${editing.productImage}`);
    } else {
      setImagePreview(null);
    }
    setSelectedImage(null);
  }, [editing]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Please select a JPG or PNG image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

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
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('items', JSON.stringify(form.items));
      formData.append('paymentMethod', form.paymentMethod);
      formData.append('deliveryMethod', form.deliveryMethod);
      formData.append('address', form.address);
      formData.append('customerName', form.customerName);
      formData.append('customerContact', form.customerContact);
      formData.append('orderDate', form.orderDate);
      formData.append('orderTime', form.orderTime);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('productImage', selectedImage);
      }
      
      if (editing) {
        await axios.put(`http://localhost:5000/api/orders/${editing._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Order updated successfully!");
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/orders", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Order created successfully!");
      }
      fetchOrders();
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview(null);
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
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200"
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

              {/* category */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Category</label>
                <input
                  name="category"
                  placeholder="Category"
                  value={item.category}
                  onChange={(e) => handleItemChange(idx, e)}
                  className={baseInput}
                />
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

        {/* Product Image Upload */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Choose Product Image
          </label>
          <div className="space-y-4">
            {/* File Input */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="hidden"
                id="productImage"
              />
              <label
                htmlFor="productImage"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[#D6A77A] rounded-lg cursor-pointer hover:border-[#7B3F00] transition-colors"
              >
                <div className="text-center">
                  <div className="text-4xl text-[#7B3F00] mb-2">📷</div>
                  <p className="text-sm text-[#7B3F00] font-medium">
                    Click to choose JPG or PNG image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB
                  </p>
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <div className="text-sm font-medium text-[#7B3F00] mb-2">
                  Selected Image Preview:
                </div>
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-[#D6A77A]"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
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
