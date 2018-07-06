const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: {type: String, required: true},
  // title: {type: String, required: true, default: 'hello there!'},
  content: {type: String, required: true},
  imagePath: {type: String, required: true}
});


module.exports = mongoose.model('Post', postSchema);
