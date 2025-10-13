import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductForm({ fetchProducts, editing, setEditing }) {
  const INITIAL_FORM = {
    name: "",
    description: "",
    category: "whole",
    price: "",
    quantity: "",
    popularity: "",
    image: null,
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, image: null }); // reset image for editing
      setErrors({});
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [editing]);

  // Validation per field
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Name is required";
      case "price":
        if (value === "") return "Price is required";
        return Number(value) > 0 ? "" : "Price must be positive";
      case "quantity":
        if (value === "") return "Quantity is required";
        return Number(value) >= 0 ? "" : "Quantity cannot be negative";
      case "popularity":
        if (value === "") return "";
        return Number(value) >= 0 ? "" : "Popularity cannot be negative";
      case "image":
        if (!form.image && !editing) return "Product image is required";
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

  // Handle input changes (including file)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

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
      // Compose all error messages into one toast
      const allErrors = Object.values(errors).filter(Boolean).join("\n");
      toast.error(allErrors || "Please fix the errors before submitting", {
        autoClose: 4000,
      });
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== "") {
        data.append(key, val);
      }
    });

    try {
      if (editing) {
        await axios.put(
          `http://localhost:5000/api/products/${editing._id}`,
          data
        );
        toast.success("Product updated successfully!");
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/products", data);
        toast.success("Product added successfully!");
      }
      setForm(INITIAL_FORM);
      setErrors({});
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Please try again!");
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
        <h2 className="text-2xl font-bold text-center text-amber-900">
          {editing ? "Edit Product" : "Add New Product"}
        </h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Spice Name
          </label>
          <input
            name="name"
            placeholder="Enter spice name"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "name"
            )}`}
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter product description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="whole">Whole</option>
            <option value="powder">Powder</option>
            <option value="organic">Organic</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Price (Rs.)
          </label>
          <input
            name="price"
            placeholder="Enter price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "price"
            )}`}
          />
          {errors.price && (
            <p className="text-red-600 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Quantity
          </label>
          <input
            name="quantity"
            placeholder="Enter quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "quantity"
            )}`}
          />
          {errors.quantity && (
            <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Popularity */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Popularity Rating
          </label>
          <input
            name="popularity"
            placeholder="Enter popularity rating"
            type="number"
            value={form.popularity}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
              "popularity"
            )}`}
          />
          {errors.popularity && (
            <p className="text-red-600 text-xs mt-1">{errors.popularity}</p>
          )}
        </div>

        {/* Custom File Upload */}
        <div>
          <label className="block text-sm font-medium text-[#7B3F00] mb-2">
            Product Image
          </label>
          <div className="relative">
            <input
              name="image"
              type="file"
              id="fileInput"
              onChange={handleChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              className={`w-full p-4 border rounded-lg text-center bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
                "image"
              )}`}
            >
              {form.image ? form.image.name : "Choose Product Image"}
            </button>
            {errors.image && (
              <p className="text-red-600 text-xs mt-1">{errors.image}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#7B3F00] text-white py-3 rounded-lg hover:bg-[#6A2C00] transition duration-300"
        >
          {editing ? "Update Product" : "Add Product"}
        </button>
      </form>
    </>
  );
}

export default ProductForm;
