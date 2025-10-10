// In-memory suppliers storage
let suppliers = [];
let nextSupplierId = 1;

// Create Supplier (with createdBy tracking)
exports.createSupplier = async (req, res) => {
  try {
    const { name, companyName, contact, email, address, supplyCategories, pricingAgreement, contractStart, contractEnd, gstNumber, deliverySchedule } = req.body;
    
    const newSupplier = {
      _id: nextSupplierId++,
      name,
      companyName,
      contact,
      email,
      address,
      supplyCategories: supplyCategories || [],
      pricingAgreement: pricingAgreement || [],
      isActive: true,
      contractStart,
      contractEnd,
      gstNumber,
      deliverySchedule,
      createdBy: req.session.user.id,
      createdAt: new Date().toISOString()
    };
    
    suppliers.push(newSupplier);
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Suppliers (with optional search)
exports.getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    let filteredSuppliers = suppliers;
    
    // Apply search filter if provided
    if (search) {
      filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.companyName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredSuppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Supplier (only by creator or admin)
exports.updateSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplierIndex = suppliers.findIndex(s => s._id === id);
    
    if (supplierIndex === -1) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    const supplier = suppliers[supplierIndex];
    const user = req.session.user;
    
    if (supplier.createdBy.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to update this supplier' });
    }

    suppliers[supplierIndex] = { ...supplier, ...req.body };
    res.json(suppliers[supplierIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Supplier (only by creator or admin)
exports.deleteSupplier = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplierIndex = suppliers.findIndex(s => s._id === id);
    
    if (supplierIndex === -1) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    const supplier = suppliers[supplierIndex];
    const user = req.session.user;
    
    if (supplier.createdBy.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to delete this supplier' });
    }

    suppliers.splice(supplierIndex, 1);
    res.json({ msg: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
