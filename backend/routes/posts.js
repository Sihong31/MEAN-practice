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
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
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
  })
  .catch(error => {
    res.status(500).json({
      message: 'Creating a post failed!'
    })
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
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
  .catch(error => {
    res.status(500).json({
      message: 'Fetching post failed!'
    });
  });
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
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then( result => {
    if (result.nModified > 0) {
      res.status(200).json({
        message: 'Update successful!'
      });
    } else {
      res.status(401).json({
        message: 'Not authorized!'
      });
    }
  })
  // catch will only be reached if there is a technical issue with the 200 and 401 responses above, for example, the server is down
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update post"
    })
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then( result => {
    if (result.n > 0) {
      res.status(200).json({
        message: 'Deletion successful!'
      });
    } else {
      res.status(401).json({
        message: 'Not authorized!'
      });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting post failed!'
    });
  });
});

module.exports = router;
