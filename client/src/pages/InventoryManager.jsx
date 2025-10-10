import { useEffect, useState } from 'react';
import axios from 'axios';
import InventoryForm from '../components/InventoryForm';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';

// heroicons v2
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';


function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/inventory?search=${search}`);
      setInventoryItems(res.data);
    } catch (err) {
      toast.error('Error fetching inventory items');
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
        fetchInventoryItems();
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Error deleting item');
      }
    }
  };

  // 📄 Generate Low Stock Report (e.g., quantity <= 10)
  const generateLowStockReport = () => {
    const lowStockItems = inventoryItems.filter(item => item.quantity <= 10);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Low Stock Inventory Report – Thamaindu Sulakdhans', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumns = ['Product Name', 'Category', 'Price (Rs)', 'Quantity'];
    const tableRows = lowStockItems.map(item => [
      item.name,
      item.category,
      item.price,
      item.quantity,
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 99, 71] }, // Tomato red header
    });

    doc.save(`Low_Stock_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Inventory Manager
      </motion.h1>


      <InventoryForm fetchInventoryItems={fetchInventoryItems} editing={editing} setEditing={setEditing} />
     <div className="mt-8 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-cinnamon-light" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-cinnamon-light
                       focus:outline-none focus:ring-2 focus:ring-cinnamon"
          />
        </div>
      {/* Report Button */}
      <button
        onClick={generateLowStockReport}
        className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                     text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Generate Low Stock PDF Report
        </button>
      </div>

      <table className="w-full mt-6 text-left border">
        <thead>
          <tr className="bg-[#F1E1C6]">
            <th className="p-4 text-[#7B3F00]">Product Name</th>
            <th className="p-4 text-[#7B3F00]">Category</th>
            <th className="p-4 text-[#7B3F00]">Price</th>
            <th className="p-4 text-[#7B3F00]">Quantity</th>
            <th className="p-4 text-[#7B3F00]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventoryItems.length > 0 ? (
            inventoryItems.map(item => (
              <tr key={item._id} className="border-t hover:bg-[#FFEDD5]">
                <td className="p-4">{item.name}</td>
                <td>{item.category}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>
                  <button onClick={() => setEditing(item)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="ml-2 text-red-600">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-[#7B3F00]">No inventory items available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryManager;
