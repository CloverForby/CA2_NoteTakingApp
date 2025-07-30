module.exports = {
  isUserLoggedIn: function (req) {
    return req.session.user != null;
  },
  isAdmin: function (req){
    return req.session.user.userRole == "admin"
  }
  
};
