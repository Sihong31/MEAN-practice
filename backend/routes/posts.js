const express = require("express");
const multer = require("multer");

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    // backend/images is relative to server.js
    callback(error, "backend/images");
  },
  filename: (req, file, callback) => {
      const name = file.originalname.toLowerCase().split(' ').join('-');
      const ext = MIME_TYPE_MAP[file.mimetype];
      callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post("", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  //body field added by body-parser
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    // multer provides .file
    imagePath: url + "/images/" + req.file.filename
  });
  //save provided by mongoose
  post.save().then( createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      // postId: createdPost._id
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  });
});

router.get("",(req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      // decide how many items to skip when on a current page
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  // Post.find()
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      // res.json(posts);
      // res.status(200).json({
      //   message: 'Posts fetched successfully',
      //   posts: documents
      // });
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    });

});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
      console.log(post)
    } else {
      res.status(404).json({
        message: 'Post not found!'
      })
    }
  })
});

router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    //return same _id so database doesn't try to generate a new id for post
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  })
  console.log(post);
  Post.updateOne({_id: req.params.id}, post).then( result => {
    res.status(200).json({
      message: 'Update successful!'
    });
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then( result => {
    res.status(200).json({
      message: 'Post deleted!'
    });
  });
});

module.exports = router;
