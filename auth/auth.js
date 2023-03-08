const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed 1!");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userData = { userId: decodedToken.userId };
    console.log(decodedToken.userId)
    next();
  } catch (err) {
   
    console.log(process.env.JWT_SECRET)

      const error = new Error("Authentication failed 2!", 403);
      return next(error);
  }
};
