// routes/index.js
const tripsRoutes = require('./trips_routes');
const usersRoutes = require('./users_routes');
module.exports = function(app, db) {
  tripsRoutes(app, db);
  usersRoutes(app, db);
};