// In-memory customers storage
let customers = [];
let nextCustomerId = 1;

exports.createCustomer = async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;
    
    const newCustomer = {
      _id: nextCustomerId++,
      name,
      contact,
      email,
      address,
      createdAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let filteredCustomers = customers;
    
    // Apply search filter if provided
    if (search) {
      filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const customerIndex = customers.findIndex(c => c._id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customers[customerIndex] = { ...customers[customerIndex], ...req.body };
    res.json(customers[customerIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const customerIndex = customers.findIndex(c => c._id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customers.splice(customerIndex, 1);
    res.json({ msg: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};