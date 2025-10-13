// In-memory inventory storage
let inventoryItems = [];
let nextInventoryId = 1;

exports.createInventoryItem = async (req, res) => {
  try {
    const { name, quantity, price, category, supplier } = req.body;
    
    const newInventoryItem = {
      _id: nextInventoryId++,
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category,
      supplier,
      createdAt: new Date().toISOString()
    };
    
    inventoryItems.push(newInventoryItem);
    res.status(201).json(newInventoryItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInventoryItems = async (req, res) => {
  try {
    const { search } = req.query;
    let filteredItems = inventoryItems;
    
    // Apply search filter if provided
    if (search) {
      filteredItems = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = inventoryItems.findIndex(item => item._id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    inventoryItems[itemIndex] = { ...inventoryItems[itemIndex], ...req.body };
    res.json(inventoryItems[itemIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = inventoryItems.findIndex(item => item._id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    inventoryItems.splice(itemIndex, 1);
    res.json({ msg: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
