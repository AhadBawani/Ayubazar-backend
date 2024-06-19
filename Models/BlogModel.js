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
            type:Array,
            required:true
        },
        delete:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model('Blog', BlogModel);