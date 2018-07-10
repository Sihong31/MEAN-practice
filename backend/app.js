const path = require('path');
const express = require('express');
const bodyParser =  require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();


mongoose.connect("mongodb+srv://sihong:" + process.env.MONGO_ATLAS_PW +"@cluster0-tpb2r.mongodb.net/node-angular")
  .then(() => {
    console.log('connected to database');
  })
  .catch(() => {
    console.log('connection failed');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// any requests targeting /images will be allowed to continue and get files from there
app.use('/images', express.static(path.join(__dirname, "images")));
// when serving angular and node together as one app instead of 2 seperate apps
app.use('/', express.static(path.join(__dirname, "angular")));


//Only need to set headers for 2 app approach and not the integrated app approach
app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  res.setHeader('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);
// when serving angular and node together as one app instead of 2 seperate apps
// ng build --prod required for each update to angular app when combined
// angular.json file "outputPath": "backend/angular", instead of the default "outputPath": "dist/mean-practice"
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});


module.exports = app;
