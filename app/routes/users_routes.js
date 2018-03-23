// users_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {

  app.get('/users/:token', userGetController);

  function userGetController(req, res) {
    console.log(`users_routes.js userGetController ${req.method} to ${req.originalUrl}`);
    let token = req.get('Authorization').split(' ')[1];
    findSessionByToken(token)
      .then(result => findUserByUserName(result.userName),
        error => console.log(error))
      .then(result => {
        console.log(result);
        res.send(result);
      },
        error => console.log(error));
  }

  function findSessionByToken(token) {
    return new Promise((resolve, reject) => {
      const details = { '_id': new ObjectID(token) };
      db.collection('sessions').findOne(details, (err, item) => {
        if (err) {
          reject({ 'error': 'An error has occurred' });
        } else {
          if (!item) {
            reject({ 'error': 'No session found' });
          }
          resolve(item);
        }
      })
    })
  }

  function findUserByUserName(userName) {
    return new Promise((resolve, reject) => {
      const details = { 'userName': userName };

      db.collection('users').findOne(details, (err, item) => {
        if (err) {
          reject({ 'error': 'An error has occurred' });
        } else {
          if (!item) {
            reject({ 'error': 'No user found' });
          }
          resolve(item);
        }
      })
    })
  }

  app.post('/users', (req, res) => {
    console.log('[POST] users')
    const user = req.body;
    db.collection('users').insert(user, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
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
