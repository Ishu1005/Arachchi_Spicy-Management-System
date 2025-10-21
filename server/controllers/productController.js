const fs = require('fs');
const path = require('path');

// In-memory products storage
let products = [];
let nextProductId = 1;

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, quantityType } = req.body;
    const image = req.file?.filename || 'default-product.jpg';
    
    // Validate category - only allow valid enum values
    const validCategories = ['whole', 'powder', 'organic'];
    const validatedCategory = validCategories.includes(category) ? category : 'whole';
    
    // Validate quantity type - only allow valid enum values
    const validQuantityTypes = ['kg', 'g'];
    const validatedQuantityType = validQuantityTypes.includes(quantityType) ? quantityType : 'kg';
    
    const newProduct = {
      _id: nextProductId++,
      name,
      description,
      category: validatedCategory,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      quantityType: validatedQuantityType,
      image,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filteredProducts = products;
    
    // Apply search filter if provided
    if (search) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    if (req.file) data.image = req.file.filename;

    const productIndex = products.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[productIndex] = { ...products[productIndex], ...data };
    res.json(products[productIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p._id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = products[productIndex];
    products.splice(productIndex, 1);
    
    // Delete image file if it exists
    if (deleted.image) {
      try {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', deleted.image));
      } catch (fileErr) {
        console.log('Could not delete image file:', fileErr.message);
      }
    }
    
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
