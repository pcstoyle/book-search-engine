const mongoose = require('mongoose');

// mongoose.connect(process.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');
mongoose.connect("mongodb://localhost/googlebooks")

module.exports = mongoose.connection;
