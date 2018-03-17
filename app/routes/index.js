// routes/index.js
const tripsRoutes = require('./trips_routes');
module.exports = function(app, db) {
  tripsRoutes(app, db);
};