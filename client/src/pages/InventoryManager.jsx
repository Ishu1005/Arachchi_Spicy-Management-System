import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    supplier: ''
  });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  // Fetch session user
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/inventory?search=${search}`, {
        withCredentials: true
      });
      setInventoryItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err.response?.data || err.message);
      toast.error('Failed to load inventory items.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchInventoryItems();
    }
  }, [search, user]);

  // Form validation
  const validateField = (name, value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${name.replace(/([A-Z])/g, ' $1')} is required.`;
    }
    if (name === 'quantity' && (+value < 0 || isNaN(+value))) {
      return 'Quantity must be a positive number.';
    }
    if (name === 'price' && (+value < 0 || isNaN(+value))) {
      return 'Price must be a positive number.';
    }
    return '';
  };

  const validateForm = () => {
    const nextErrors = {};
    ['name', 'quantity', 'price', 'category'].forEach(field => {
      const err = validateField(field, form[field]);
      if (err) nextErrors[field] = err;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning('Please complete all required fields.');
      return;
    }

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/inventory/${editing._id}`, form, {
          withCredentials: true
        });
        toast.success('Inventory item updated successfully!');
        setEditing(null);
      } else {
        await axios.post('http://localhost:5000/api/inventory', form, {
          withCredentials: true
        });
        toast.success('Inventory item created successfully!');
      }
      fetchInventoryItems();
      setForm({ name: '', quantity: '', price: '', category: '', supplier: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || 'submission failed'}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
          withCredentials: true
        });
        if (editing && editing._id === id) setEditing(null);
        fetchInventoryItems();
        toast.success('Inventory item deleted successfully!');
      } catch (err) {
        console.error('Error deleting inventory item:', err.response?.data || err.message);
        toast.error('Failed to delete the inventory item.');
      }
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      supplier: item.supplier
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', quantity: '', price: '', category: '', supplier: '' });
    setShowForm(false);
    setErrors({});
  };

  // Generate Inventory Details Report
  const generateInventoryReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('ARACHCHCHI SPICES', 14, 22);
    doc.setFontSize(16);
    doc.text('Inventory Details Report', 14, 32);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    
    // Summary Statistics
    const totalItems = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const lowStockItems = inventoryItems.filter(item => item.quantity <= 30).length;
    const criticalStockItems = inventoryItems.filter(item => item.quantity <= 10).length;
    
    doc.setFontSize(14);
    doc.text('Summary Statistics:', 14, 50);
    doc.setFontSize(10);
    doc.text(`Total Items: ${totalItems}`, 14, 58);
    doc.text(`Total Inventory Value: LKR ${totalValue.toFixed(2)}`, 14, 66);
    doc.text(`Low Stock Items (≤30): ${lowStockItems}`, 14, 74);
    doc.text(`Critical Stock Items (≤10): ${criticalStockItems}`, 14, 82);
    
    // Inventory Table
    const tableColumn = ['Item Name', 'Category', 'Quantity', 'Price (LKR)', 'Supplier', 'Stock Status', 'Value (LKR)'];
    const tableRows = inventoryItems.map(item => {
      const stockStatus = item.quantity <= 10 ? 'Critical' : 
                         item.quantity <= 30 ? 'Low' : 'Good';
      const itemValue = item.price * item.quantity;
      return [
        item.name,
        item.category || '-',
        item.quantity.toString(),
        item.price ? item.price.toFixed(2) : '-',
        item.supplier || '-',
        stockStatus,
        itemValue.toFixed(2)
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [123, 63, 0], // Brown color
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [255, 250, 242] // Light background
      },
      columnStyles: {
        2: { halign: 'center' }, // Quantity
        3: { halign: 'right' },  // Price
        5: { halign: 'center' }, // Stock Status
        6: { halign: 'right' }   // Value
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text('ARACHCHCHI SPICES - Inventory Management System', 
               doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, 
               { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Inventory report generated successfully!');
  };

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity <= 10) return { status: 'critical', color: 'text-red-600', icon: XCircleIcon };
    if (quantity <= 30) return { status: 'low', color: 'text-yellow-600', icon: ExclamationTriangleIcon };
    return { status: 'good', color: 'text-green-600', icon: CheckCircleIcon };
  };

  const baseInput = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] text-[#5C2C00]";
  const borderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (field in form && form[field] && !errors[field]) return "border-green-500";
    return "border-[#D6A77A]";
  };

  const slideVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] overflow-x-hidden p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Inventory Management
      </motion.h1>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          variants={slideVariant}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto p-8 bg-white border border-[#D6A77A] rounded-2xl shadow-xl mb-8"
        >
          <h2 className="text-2xl font-bold text-center text-[#7B3F00] mb-6 lowercase">
            {editing ? 'update inventory item' : 'add new inventory item'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="name"
                  placeholder="Item Name"
                  value={form.name}
                  onChange={handleChange}
                  className={`${baseInput} ${borderClass('name')}`}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  name="category"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleChange}
                  className={`${baseInput} ${borderClass('category')}`}
                />
                {errors.category && (
                  <p className="text-red-600 text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className={`${baseInput} ${borderClass('quantity')}`}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price (LKR)"
                  value={form.price}
                  onChange={handleChange}
                  className={`${baseInput} ${borderClass('price')}`}
                />
                {errors.price && (
                  <p className="text-red-600 text-xs mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div>
              <input
                name="supplier"
                placeholder="Supplier"
                value={form.supplier}
                onChange={handleChange}
                className={baseInput}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#7B3F00] text-white font-semibold hover:bg-[#5C2C00] transition-colors duration-300 lowercase"
              >
                {editing ? 'update item' : 'add item'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors duration-300 lowercase"
              >
                cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-[#D6A77A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-[#D6A77A] focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 bg-[#7B3F00] hover:bg-[#5C2C00] text-white px-5 py-2 rounded-md shadow transition"
        >
          <PlusIcon className="h-5 w-5" />
          {showForm ? 'Hide Form' : 'Add Item'}
        </button>

        {/* Report Button */}
        <button
          onClick={generateInventoryReport}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Generate Report
        </button>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <table className="w-full text-left">
          <thead className="bg-[#7B3F00] text-white">
            <tr>
              <th className="p-4 font-semibold">Item Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Quantity</th>
              <th className="p-4 font-semibold">Price (LKR)</th>
              <th className="p-4 font-semibold">Supplier</th>
              <th className="p-4 font-semibold">Stock Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.length > 0 ? (
              inventoryItems.map((item, index) => {
                const stockStatus = getStockStatus(item.quantity);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-[#5C2C00]">{item.name}</td>
                    <td className="p-4 text-gray-600">{item.category || '-'}</td>
                    <td className="p-4 font-semibold">{item.quantity}</td>
                    <td className="p-4 text-green-600 font-semibold">
                      {item.price ? `LKR ${item.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-gray-600">{item.supplier || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${stockStatus.color}`} />
                        <span className={`font-medium ${stockStatus.color}`}>
                          {stockStatus.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Item"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl text-gray-300">📦</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Inventory Items Found</h3>
                      <p className="text-gray-500">
                        {search ? 'Try adjusting your search criteria.' : 'Start by adding your first inventory item.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Stock Status Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-6 bg-white p-4 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-3">Stock Status Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Good Stock (30+ units)</span>
          </div>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-gray-700">Low Stock (11-30 units)</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-gray-700">Critical Stock (≤10 units)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default InventoryManager;