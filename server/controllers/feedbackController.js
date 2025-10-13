// In-memory feedback storage
let feedbacks = [];
let nextFeedbackId = 1;

exports.createFeedback = async (req, res) => {
  try {
    const { customerName, customerEmail, productId, rating, emojiReaction, mood, comment } = req.body;
    
    const newFeedback = {
      _id: nextFeedbackId++,
      customerName,
      customerEmail,
      productName: productId, // Store as product name instead of ID
      rating: parseInt(rating),
      emojiReaction: emojiReaction || '',
      mood: mood || '',
      comment,
      status: 'pending',
      isPublic: false,
      createdAt: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const { search, status, productId } = req.query;
    let filteredFeedbacks = feedbacks;
    
    // Apply filters
    if (search) {
      filteredFeedbacks = filteredFeedbacks.filter(f => 
        f.customerName.toLowerCase().includes(search.toLowerCase()) ||
        f.comment.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.status === status);
    }
    
    if (productId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.productId === parseInt(productId));
    }
    
    // Sort by creation date (newest first)
    filteredFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(filteredFeedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const feedback = feedbacks.find(f => f._id === id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const feedbackIndex = feedbacks.findIndex(f => f._id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedbacks[feedbackIndex] = { ...feedbacks[feedbackIndex], ...req.body };
    res.json(feedbacks[feedbackIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const feedbackIndex = feedbacks.findIndex(f => f._id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedbacks.splice(feedbackIndex, 1);
    res.json({ msg: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPublicFeedback = async (req, res) => {
  try {
    const publicFeedbacks = feedbacks.filter(f => 
      f.status === 'approved' && f.isPublic === true
    );
    
    // Sort by creation date (newest first)
    publicFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(publicFeedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveFeedback = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const feedbackIndex = feedbacks.findIndex(f => f._id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedbacks[feedbackIndex] = { 
      ...feedbacks[feedbackIndex], 
      status: 'approved', 
      isPublic: true 
    };
    
    res.json(feedbacks[feedbackIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectFeedback = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const feedbackIndex = feedbacks.findIndex(f => f._id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedbacks[feedbackIndex] = { 
      ...feedbacks[feedbackIndex], 
      status: 'rejected', 
      isPublic: false 
    };
    
    res.json(feedbacks[feedbackIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
