module.exports = {
  isUserLoggedIn: function (req) {
    return req.session.user != null;
  } 
};
