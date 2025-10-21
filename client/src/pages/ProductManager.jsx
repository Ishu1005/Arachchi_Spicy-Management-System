import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductForm from '../components/ProductForm';
import SmartQualityAssurance from '../components/SmartQualityAssurance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';



import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products?search=${search}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Category', 'Description', 'Price', 'Qty', 'Qty Type']],
      body: products.map(p => [
        p.name,
        p.category,
        p.description,
        p.price,
        p.quantity,
        p.quantityType
      ])
    });
    doc.save('spices.pdf');
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      products.map(p => ({
        Name: p.name,
        Category: p.category,
        Description: p.description,
        Price: p.price,
        Quantity: p.quantity,
        'Quantity Type': p.quantityType
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'spices.csv';
    link.click();
  };

  return (
    <div className="p-6 bg-[#fffaf2] min-h-screen">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Product Manager
      </motion.h1>


      {/* Product Form */}
      <ProductForm fetchProducts={fetchProducts} editing={editing} setEditing={setEditing} />
      
      
        {/* search */}
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
      {/* Product Table */}
      <table className="w-full mt-8 text-left border border-amber-200 rounded-lg">
        <thead>
          <tr className="bg-[#f6f6f6]">
            <th className="p-4 text-amber-900">Image</th>
            <th className="p-4 text-amber-900">Name</th>
            <th className="p-4 text-amber-900">Category</th>
            <th className="p-4 text-amber-900">Description</th>
            <th className="p-4 text-amber-900">Qty</th>
            <th className="p-4 text-amber-900">Qty Type</th>
            <th className="p-4 text-amber-900">Price</th>
            <th className="p-4 text-amber-900">Quality Status</th>
            <th className="p-4 text-amber-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            // Use quantity as a basis for quality assessment (higher quantity = better availability)
            const qualityScore = p.quantity > 50 ? 4.5 : p.quantity > 20 ? 3.5 : p.quantity > 10 ? 2.5 : 1.5;
            const getQualityStatus = (score) => {
              if (score >= 4.5) return { text: 'Excellent', color: 'text-green-600 bg-green-50', icon: '🌟' };
              if (score >= 3.5) return { text: 'Good', color: 'text-yellow-600 bg-yellow-50', icon: '✅' };
              if (score >= 2.5) return { text: 'Fair', color: 'text-orange-600 bg-orange-50', icon: '⚠️' };
              return { text: 'Poor', color: 'text-red-600 bg-red-50', icon: '🚨' };
            };
            const quality = getQualityStatus(qualityScore);
            
            return (
              <tr key={p._id} className="border-t border-amber-200">
                <td className="p-4">
                  <img src={`http://localhost:5000/uploads/${p.image}`} alt="" className="h-12 w-12 object-cover rounded-full" />
                </td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{p.description}</td>
                <td className="p-4">{p.quantity}</td>
                <td className="p-4">{p.quantityType}</td>
                <td className="p-4">${p.price}</td>
                <td className="p-4">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${quality.color}`}>
                    <span>{quality.icon}</span>
                    <span>{quality.text}</span>
                  </div>
                </td>
                <td className="p-4">
                  <button onClick={() => setEditing(p)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="ml-4 text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
        <div className="mt-6 flex gap-4">
          <button
            onClick={exportPDF}
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                      text-white px-5 py-2 rounded-md shadow transition"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            PDF Report
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                      text-white px-5 py-2 rounded-md shadow transition"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            CSV Report
          </button>
        </div>
            {/* Product Quantity Chart */}
      <h2 className="text-xl font-semibold text-center text-amber-900 mt-8 mb-4">Product Quantities</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={products}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Smart Quality Assurance Dashboard */}
      {products.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-center text-[#7B3F00] mb-4">
            📊 Smart Quality Assurance Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <img 
                    src={`http://localhost:5000/uploads/${product.image}`} 
                    alt={product.name}
                    className="h-8 w-8 object-cover rounded-full"
                  />
                </div>
                <SmartQualityAssurance product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    
  );
}

export default ProductManager;
