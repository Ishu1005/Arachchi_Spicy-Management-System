const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// This code defines a Mongoose schema for a User model, which includes fields for username, email, password, and role. The schema also includes timestamps for created and updated times. The model is then exported for use in other parts of the application.
// The schema ensures that usernames and emails are unique, and the role can either be 'admin' or 'user', defaulting to 'user'. This structure is typical for user management in web applications, allowing for basic authentication and authorization functionalities.