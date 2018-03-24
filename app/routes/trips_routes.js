// trips_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {

  app.get('/trips/:user', (req, res) => {
    const user = req.params.user;
    const details = { 'userName': user };
    db.collection('trips').find(details, {}).toArray()
      .then((data) => {
        res.send(data);
      })
  })

  app.post('/trips', (req, res) => {
    console.log('[POST] trips')
    const trip = req.body;
    // console.log(trip);
    db.collection('trips').insert(trip, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  app.delete('/trips/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('trips').remove(details, (err, item) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send('Trip ' + id + ' deleted!');
      }
    });
  });

  app.put('/trips/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    const note = { text: req.body.body, title: req.body.title };
    db.collection('trips').update(details, note, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(note);
      }
    });
  });
};
