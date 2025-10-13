import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SupplierForm({ fetchSuppliers, editing, setEditing }) {
  const INITIAL_FORM = {
    name: "",
    companyName: "",
    contact: "",
    email: "",
    address: "",
    supplyCategories: [],
    pricingAgreement: [],
    isActive: true,
    contractStart: "",
    contractEnd: "",
    gstNumber: "",
    deliverySchedule: ""
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [newPricing, setNewPricing] = useState({ item: "", unitPrice: "" });
  const [errors, setErrors] = useState({});
  const [pricingErrors, setPricingErrors] = useState({});

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
      setNewPricing({ item: "", unitPrice: "" });
      setErrors({});
    }
  }, [editing]);

  const emailRegex = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^\d{7,15}$/;
  const gstRegex = /^[A-Za-z0-9]{6,15}$/;

  const validateField = (name, value, fullForm = form) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Name is required";
      case "companyName":
        return value.trim() ? "" : "Company name is required";
      case "contact":
        if (!value) return "Contact number is required";
        return phoneRegex.test(value) ? "" : "Invalid contact (7‑15 digits)";
      case "email":
        if (!value) return "Email is required";
        return emailRegex.test(value) ? "" : "Invalid email";
      case "address":
        return value.trim() ? "" : "Address is required";
      case "contractStart":
        return value ? "" : "Start date required";
      case "contractEnd": {
        if (!value) return "End date required";
        const start = fullForm.contractStart || form.contractStart;
        if (start && new Date(value) < new Date(start))
          return "End date must be after start";
        return "";
      }
      case "gstNumber":
        if (!value) return "GST/VAT number required";
        return gstRegex.test(value)
          ? ""
          : "GST/VAT should be 6‑15 alphanumerics";
      case "deliverySchedule":
        return value.trim() ? "" : "Delivery schedule required";
      case "unitPrice": {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0)
          return "Unit price must be a positive number";
        return "";
      }
      default:
        return "";
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const err = validateField(key, value, { ...form });
      if (err) nextErrors[key] = err;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        supplyCategories: checked
          ? [...prev.supplyCategories, value]
          : prev.supplyCategories.filter((v) => v !== value)
      }));
    } else if (type === "radio") {
      setForm((prev) => ({ ...prev, isActive: value === "true" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, { ...form, [name]: value })
      }));
      if (name === "contractStart" || name === "contractEnd") {
        const other = name === "contractStart" ? "contractEnd" : "contractStart";
        setErrors((prev) => ({
          ...prev,
          [other]: validateField(other, form[other], {
            ...form,
            [name]: value
          })
        }));
      }
    }
  };

  const handleAddPricing = () => {
    const itemError = newPricing.item.trim() === "" ? "Item name is required" : "";
    const priceError = validateField("unitPrice", newPricing.unitPrice);

    if (itemError || priceError) {
      setPricingErrors({ item: itemError, unitPrice: priceError });
      return;
    }

    setForm((prev) => ({
      ...prev,
      pricingAgreement: [...prev.pricingAgreement, newPricing]
    }));
    setNewPricing({ item: "", unitPrice: "" });
    setPricingErrors({});
  };

  const handleRemovePricing = (index) => {
    setForm((prev) => ({
      ...prev,
      pricingAgreement: prev.pricingAgreement.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors first.");
      return;
    }

    try {
      if (editing) {
        await axios.put(
          `http://localhost:5000/api/suppliers/${editing._id}`,
          form,
          { withCredentials: true }
        );
        toast.success("Supplier updated");
        setEditing(null);
      } else {
        await axios.post(`http://localhost:5000/api/suppliers`, form, {
          withCredentials: true
        });
        toast.success("Supplier added");
      }
      fetchSuppliers();
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  const borderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (form[field] && !errors[field]) return "border-green-500";
    return "border-gray-300";
  };

  const textInput = (name, placeholder, otherProps = {}) => (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 ${borderClass(
          name
        )}`}
        {...otherProps}
      />
      {errors[name] && (
        <p className="text-red-600 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-amber-50 p-9 rounded-lg shadow-md border border-[#D6A77A] max-w-xl mx-auto"
      >
        {textInput("name", "Supplier Name")}
        {textInput("companyName", "Company Name")}
        {textInput("contact", "Contact Number")}
        {textInput("email", "Email", { type: "email" })}
        {textInput("address", "Address")}

        <div className="flex gap-4 text-sm">
          {["whole", "powder", "organic"].map((cat) => (
            <label key={cat} className="flex items-center text-[#7B3F00]">
              <input
                type="checkbox"
                value={cat}
                checked={form.supplyCategories.includes(cat)}
                onChange={handleChange}
                className="mr-2"
              />
              {cat}
            </label>
          ))}
        </div>

        {/* Pricing Agreement */}
        <div className="space-y-2">
          <label className="block font-medium text-[#7B3F00] text-sm">
            Pricing Agreement:
          </label>
          <div className="flex gap-2 mb-2">
            <div className="w-1/2">
              <input
                placeholder="Spice item"
                value={newPricing.item}
                onChange={(e) => {
                  setNewPricing({ ...newPricing, item: e.target.value });
                  setPricingErrors((prev) => ({ ...prev, item: "" }));
                }}
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm ${
                  pricingErrors.item ? "border-red-500" : "border-gray-300"
                }`}
              />
              {pricingErrors.item && (
                <p className="text-red-600 text-xs mt-1">{pricingErrors.item}</p>
              )}
            </div>

            <div className="w-1/2">
              <input
                placeholder="Unit price"
                type="number"
                min="0.01"
                value={newPricing.unitPrice}
                onChange={(e) => {
                  setNewPricing({ ...newPricing, unitPrice: e.target.value });
                  setPricingErrors((prev) => ({ ...prev, unitPrice: "" }));
                }}
                className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm ${
                  pricingErrors.unitPrice ? "border-red-500" : "border-gray-300"
                }`}
              />
              {pricingErrors.unitPrice && (
                <p className="text-red-600 text-xs mt-1">
                  {pricingErrors.unitPrice}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddPricing}
              className="bg-[#7B3F00] text-white px-3 py-1 rounded-lg text-sm h-fit mt-1"
            >
              Add
            </button>
          </div>

          {/* Recently Added Pricing List */}
          <div className="mt-4">
            <h4 className="text-[#7B3F00] font-semibold mb-2 text-sm">
              Recently Added Items:
            </h4>
            {form.pricingAgreement.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No items added yet.</p>
            ) : (
              <div className="grid gap-2">
                {form.pricingAgreement.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white p-2 px-4 rounded-lg border border-amber-200 shadow-sm"
                  >
                    <span className="text-[#5C2C00] text-sm font-medium">
                      {p.item}: Rs.{p.unitPrice}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePricing(i)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex gap-4 text-sm">
          <label className="text-[#7B3F00]">
            <input
              type="radio"
              name="isActive"
              value="true"
              checked={form.isActive === true}
              onChange={handleChange}
            />
            Active
          </label>
          <label className="text-[#7B3F00]">
            <input
              type="radio"
              name="isActive"
              value="false"
              checked={form.isActive === false}
              onChange={handleChange}
            />
            Inactive
          </label>
        </div>

        {/* Dates */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <input
              type="date"
              name="contractStart"
              value={form.contractStart?.slice(0, 10)}
              onChange={handleChange}
              className={`p-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 ${borderClass(
                "contractStart"
              )}`}
            />
            {errors.contractStart && (
              <p className="text-red-600 text-xs mt-1">
                {errors.contractStart}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <input
              type="date"
              name="contractEnd"
              value={form.contractEnd?.slice(0, 10)}
              onChange={handleChange}
              className={`p-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 ${borderClass(
                "contractEnd"
              )}`}
            />
            {errors.contractEnd && (
              <p className="text-red-600 text-xs mt-1">{errors.contractEnd}</p>
            )}
          </div>
        </div>

        {textInput("gstNumber", "GST/VAT Number")}
        {textInput("deliverySchedule", "Delivery Schedule")}

        <button
          type="submit"
          className="bg-[#7B3F00] text-white py-2 px-6 rounded-lg text-lg font-semibold"
        >
          {editing ? "Update" : "Add"} Supplier
        </button>
      </form>
    </>
  );
}

export default SupplierForm;
