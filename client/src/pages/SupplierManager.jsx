import { useEffect, useState } from 'react';
import axios from 'axios';
import SupplierForm from '../components/SupplierForm';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

function SupplierManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/suppliers?search=${search}`, {
        withCredentials: true,
      });
      setSuppliers(res.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      if (error.response?.status === 401) {
        // User not authenticated - UserRoute will handle this
        return;
      }
      // Show error message for other errors
      alert('Failed to fetch suppliers. Please try again.');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleDelete = async id => {
    if (window.confirm('Delete this supplier?')) {
      try {
        await axios.delete(`http://localhost:5000/api/suppliers/${id}`, { withCredentials: true });
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier. Please try again.');
      }
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18).text('Supplier Report', 14, 22);
    doc.setFontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const columns = [
      'Name', 'Company', 'Contact', 'Email', 'Categories',
      'Status', 'GST No.', 'Contract Start', 'Contract End'
    ];
    const rows = suppliers.map(s => [
      s.name,
      s.companyName,
      s.contact,
      s.email,
      (s.supplyCategories || []).join(', '),
      s.isActive ? 'Active' : 'Inactive',
      s.gstNumber || '-',
      s.contractStart?.slice(0, 10) || '-',
      s.contractEnd?.slice(0, 10) || '-'
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [123, 63, 0] } // cinnamon
    });

    doc.save(`Supplier_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-cinnamon-bg px-6 py-8">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Supplier Manager
      </motion.h1>

      <SupplierForm fetchSuppliers={fetchSuppliers} editing={editing} setEditing={setEditing} />

      <div className="mt-8 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        <button
          onClick={generatePDFReport}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                     text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          PDF Report
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-cinnamon text-white sticky top-0">
            <tr>
              {['Name','Company','Contact','Email','Address','Categories',
                'Pricing','Status','Contract','GST No.','Delivery','Actions'].map(h => (
                <th key={h} className="py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {suppliers.map((s, idx) => (
              <tr
                key={s._id}
                className={`${
                  idx % 2 ? 'bg-cinnamon-light/20' : 'bg-white'
                } hover:bg-cinnamon-light/40 transition`}
              >
                <td className="py-3 px-4">{s.name}</td>
                <td className="py-3 px-4">{s.companyName}</td>
                <td className="py-3 px-4">{s.contact}</td>
                <td className="py-3 px-4">{s.email}</td>
                <td className="py-3 px-4">{s.address}</td>
                <td className="py-3 px-4">{s.supplyCategories?.join(', ')}</td>
                <td className="py-3 px-4">
                  <ul className="list-disc list-inside">
                    {s.pricingAgreement?.map((p, i) => (
                      <li key={i}>{p.item} – Rs.{p.unitPrice}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 px-4">{s.isActive ? 'Active' : 'Inactive'}</td>
                <td className="py-3 px-4">
                  {s.contractStart?.slice(0,10)} → {s.contractEnd?.slice(0,10)}
                </td>
                <td className="py-3 px-4">{s.gstNumber}</td>
                <td className="py-3 px-4">{s.deliverySchedule}</td>
                <td className="py-3 px-4 space-x-2">
                  {(user?.role === 'admin' || user?.id === s.createdBy) && (
                    <>
                      <button
                        onClick={() => setEditing(s)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierManager;
