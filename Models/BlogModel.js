const mongoose = require('mongoose');

const BlogModel = new mongoose.Schema(
    {
        blogImage:{
            type:String,
            required:true
        },
        blogTitle:{
            type:String,
            required:true
        },
        blogText:{
            type:String,
            required:true
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model('Blog', BlogModel);