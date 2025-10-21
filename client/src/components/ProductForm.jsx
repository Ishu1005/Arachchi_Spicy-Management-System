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
    quantityType: "kg",
    image: null,
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, image: null }); // reset image for editing
      setErrors({});
      
      // Set image preview if editing and has existing image
      if (editing.image) {
        setImagePreview(`http://localhost:5000/uploads/${editing.image}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
      setImagePreview(null);
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
      case "quantityType":
        return value ? "" : "Quantity type is required";
      case "image":
        if (!form.image && !editing) return "Product image is required";
        if (form.image && !form.image.type.match(/^image\/(jpeg|jpg|png)$/)) {
          return "Only JPG and PNG images are allowed";
        }
        if (form.image && form.image.size > 5 * 1024 * 1024) {
          return "Image size must be less than 5MB";
        }
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

    // Handle image preview
    if (name === "image" && files && files[0]) {
      const file = files[0];
      
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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    // Live validation on field change
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
    }));
  };

  // Remove selected image
  const removeImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, image: "" }));
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
      setImagePreview(null);
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


        {/* Spice Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spice Name</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="flex space-x-2">
            <input
              name="quantity"
              placeholder="Enter quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              className={`flex-1 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${borderClass(
                "quantity"
              )}`}
            />
            <select
              name="quantityType"
              value={form.quantityType}
              onChange={handleChange}
              className="p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="kg">Kg</option>
              <option value="g">g</option>
            </select>
          </div>
          {errors.quantity && (
            <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
          )}
          {errors.quantityType && (
            <p className="text-red-600 text-xs mt-1">{errors.quantityType}</p>
          )}
        </div>


        {/* Product Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="space-y-4">
            {/* File Input */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange}
                className="hidden"
                id="productImage"
                name="image"
              />
              <label
                htmlFor="productImage"
                className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-amber-500 transition-colors ${borderClass("image")}`}
              >
                <div className="text-center">
                  <div className="text-4xl text-amber-600 mb-2">📷</div>
                  <p className="text-sm text-amber-600 font-medium">
                    Click to choose JPG or PNG image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB
                  </p>
                  {form.image && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Selected: {form.image.name}
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Selected Image Preview:
                </div>
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-amber-300"
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
          {errors.image && (
            <p className="text-red-600 text-xs mt-1">{errors.image}</p>
          )}
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
