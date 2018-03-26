// routes/index.js
const authRoutes = require('./auth_routes');
const staticRoutes = require('./static_routes');
const tripsRoutes = require('./trips_routes');
const usersRoutes = require('./users_routes');

module.exports = function(app, db) {
  authRoutes(app, db);
  staticRoutes(app, db);
  tripsRoutes(app, db);
  usersRoutes(app, db);
};