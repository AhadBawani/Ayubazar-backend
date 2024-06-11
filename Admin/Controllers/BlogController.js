const Blogs = require('../../Models/BlogModel');
const path = require('path');
require('dotenv/config');

module.exports.ADD_BLOG = async (req, res) => {
    const { blogTitle, blogText } = req.body;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const blogImage = req.files.blogImage; // Assuming the file input name is "blogImage"

        // Move the uploaded file to the desired folder
        const uploadPath = path.join(__dirname, '..', '..', 'Images', 'BlogImages', blogImage.name);
        await blogImage.mv(uploadPath);

        // Create a new blog object with the uploaded image path
        const newBlog = new Blogs({
            blogTitle,
            blogText,
            blogImage: blogImage.name
        });

        // Save the new blog to the database
        await newBlog.save();

        res.status(201).json({ message: 'Blog added successfully.' });
    } catch (error) {
        console.log('Error in add blog controller:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports.GET_ALL_BLOGS = async (req, res) => {
    try {
        await Blogs.find({ delete: false })
            .exec()
            .then((blogResponse) => {
                if (blogResponse) {
                    res.status(200).json(blogResponse);
                }
            })
    }
    catch (error) {
        console.log('error in getting all the blogs : ', error);
    }
}

module.exports.EDIT_BLOG = async (req, res) => {
    const blogId = req.params.blogId;
    try {
        const blog = await Blogs.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found!" });
        }
        const { blogTitle, blogText } = req.body;

        blog.blogTitle = blogTitle;
        blog.blogText = blogText;
        if (req.files) {
            const blogImage = req.files.blogImage;

            const uploadPath = path.join(__dirname, '..', '..', 'Images', 'BlogImages', blogImage.name);
            await blogImage.mv(uploadPath);

            blog.blogImage = blogImage.name;
        }
        await blog.save();

        res.status(200).json({ message: 'Blog updated successfully!', blog });
    }
    catch (error) {
        console.log('error in edit blog controller : ', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports.DELETE_BLOG = async (req, res) => {
    const blogId = req.params.blogId;

    try {
        await Blogs.findByIdAndUpdate(blogId, { delete: true }, { new: true })
            .exec()
            .then((deleteResponse) => {
                if (deleteResponse) {
                    res.status(200).send({
                        message: "Blog deleted successfully!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in delete blog controller : ', error);
    }
}