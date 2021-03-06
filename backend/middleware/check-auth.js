const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // verify method gives back a decoded token;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    // express allows us to add additional data to request
    // every method, every middleware after the check-auth middleware will have access to req.userData
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch(error) {
    res.status(401).json({
      message: 'You are not authenticated!'
    });
  }

}


