// users_routes.js
var ObjectID = require('mongodb').ObjectID;
module.exports = function (app, db) {

  app.options('*', (req, res) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.send();
  })


  app.get('/users/:user', (req, res) => {
    const user = req.params.user;
    const details = { 'user': user };
    db.collection('users').findOne(details, (err, item) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        if (!item) {
          res.send({ 'error': 'No user found' });
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.send(item);
      }
    });
  });

  app.post('/users', (req, res) => {
    console.log('[POST] users')
    const user = req.body;
    db.collection('users').insert(user, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.send(result.ops[0]);
      }
    });
  });

  app.delete('/users/:user', (req, res) => {
    const user = req.params.user;
    console.log(user);
    const details = { 'user': user };
    db.collection('users').remove(details, (err, item) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.send('User ' + user + ' deleted!');
      }
    });
  });

  app.put('/users/:user', (req, res) => {
    const user = req.params.user;
    const details = { 'user': user };
    const note = { text: req.body.body, title: req.body.title };
    db.collection('users').update(details, note, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(note);
      }
    });
  });
};
