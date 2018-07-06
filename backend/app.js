const path = require('path');
const express = require('express');
const bodyParser =  require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();


mongoose.connect("mongodb+srv://sihong:xZLJm0gEPgzVIFls@cluster0-tpb2r.mongodb.net/node-angular?retryWrites=true")
  .then(() => {
    console.log('connected to database');
  })
  .catch(() => {
    console.log('connection failed');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// any requests targeting /images will be allowed to continue and get files from there
app.use('/images', express.static(path.join("backend/images")));

app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  res.setHeader('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts", postsRoutes);


module.exports = app;
