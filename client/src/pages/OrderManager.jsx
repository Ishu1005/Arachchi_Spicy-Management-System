import { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from '../components/OrderForm';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders`, {
        withCredentials: true
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      toast.error('Failed to load orders.');
    }
  };

  const fetchSession = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/session', {
        withCredentials: true
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('No user session:', err.response?.data || err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [search, user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`, {
          withCredentials: true
        });
        if (editing && editing._id === id) setEditing(null);
        fetchOrders();
        toast.success('Order deleted successfully!');
      } catch (err) {
        console.error('Error deleting order:', err.response?.data || err.message);
        toast.error('Failed to delete the order.');
      }
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ['Customer', 'Contact', 'Items', 'Payment', 'Delivery', 'Address'];
    const tableRows = orders.map(order => [
      order.customerName || '-',
      order.customerContact || '-',
      (order.items || []).map(item => `${item.name} (${item.quantity})`).join(', '),
      order.paymentMethod,
      order.deliveryMethod,
      order.address
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save(`Order_Report_${Date.now()}.pdf`);
    toast.success('PDF Report generated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] overflow-x-hidden p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Order Management
      </motion.h1>

      <OrderForm fetchOrders={fetchOrders} editing={editing} setEditing={setEditing} />

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
          onClick={generatePDFReport}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                     text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Order Report
        </button>
      </div>

      <table className="w-full mt-6 text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-amber-200">
            <th className="p-3 border border-gray-300">Customer</th>
            <th className="p-3 border border-gray-300">Contact</th>
            <th className="p-3 border border-gray-300">Items</th>
            <th className="p-3 border border-gray-300">Payment</th>
            <th className="p-3 border border-gray-300">Delivery</th>
            <th className="p-3 border border-gray-300">Address</th>
            <th className="p-3 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id} className="border-t border-gray-300 align-top">
                <td className="p-2 border border-gray-300">{order.customerName || '-'}</td>
                <td className="p-2 border border-gray-300">{order.customerContact || '-'}</td>
                <td className="p-2 border border-gray-300">
                  <ul className="list-disc ml-4">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} ({item.quantity}) {item.category && `- ${item.category}`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2 border border-gray-300">{order.paymentMethod}</td>
                <td className="p-2 border border-gray-300">{order.deliveryMethod}</td>
                <td className="p-2 border border-gray-300">{order.address}</td>
                <td className="p-2 border border-gray-300 whitespace-nowrap">
                  {(user?.role === 'admin' || user?.id === order.createdBy) && (
                    <>
                      <button
                        onClick={() => setEditing(order)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="ml-2 text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderManager;
