import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

function InventoryForm({ fetchInventoryItems, editing, setEditing }) {
  const initialForm = { name: '', category: '', price: '', quantity: '' };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(editing || initialForm);
    setErrors({});
  }, [editing]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
      case 'category':
        return value.trim() ? '' : `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
      case 'price':
        return value && parseFloat(value) > 0 ? '' : 'Price must be a positive number.';
      case 'quantity':
        return value && parseInt(value) >= 0 ? '' : 'Quantity must be zero or more.';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) nextErrors[key] = err;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const borderClass = (field) => {
    if (errors[field]) return 'border-red-500';
    if (form[field] && !errors[field]) return 'border-green-500';
    return 'border-[#D6A77A]';
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
      if (!validateForm()) {
        toast.error("Please fix highlighted errors first");
        return;
      }
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/inventory/${editing._id}`, form);
        toast.success('Product updated successfully');
        setEditing(null);
      } else {
        await axios.post('http://localhost:5000/api/inventory', form);
        toast.success('Product added successfully');
      }
      setForm(initialForm);
      fetchInventoryItems();
    } catch (err) {
      toast.error('Error occurred while saving the product');
      console.error(err);
    }
  };

  const slideUpVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      variants={slideUpVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6"
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="text-2xl font-bold text-[#7B3F00] text-center lowercase">
        {editing ? 'Update Product' : 'Add New Product'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Product Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className={`w-full p-3 border ${borderClass('name')} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]`}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Category - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`w-full p-3 border ${borderClass('category')} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]`}
          >
            <option value="" disabled>Select category</option>
            <option value="organic">Organic</option>
            <option value="powder">Powder</option>
            <option value="whole">Whole</option>
          </select>
          {errors.category && (
            <p className="text-red-600 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Price (Rs)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className={`w-full p-3 border ${borderClass('price')} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]`}
          />
          {errors.price && (
            <p className="text-red-600 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">Quantity</label>
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className={`w-full p-3 border ${borderClass('quantity')} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]`}
          />
          {errors.quantity && (
            <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-[#7B3F00] text-white py-3 rounded-lg hover:bg-[#5A2D00] transition-colors"
        >
          {editing ? 'Update Product' : 'Add Product'}
        </button>
      </form>
    </motion.div>
  );
}

export default InventoryForm;
