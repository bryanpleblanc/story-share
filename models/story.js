// ===============================================
// Basic Setup
// ===============================================
var mongoose = require("mongoose");


// ===============================================
// STORY - Schema
// ===============================================
var storiesSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    image: String,
    description: String,
    featured: Boolean,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
});

// Create schema model =>"Story" is the name of the collection
var Story = mongoose.model("Story", storiesSchema);


// Can now be used in other backend files
module.exports = Story;

// Could also be...
//module.exports = mongoose.model("Story", storiesSchema);
