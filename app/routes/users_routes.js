// users_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {

  app.get('/users/:token', userGetController);
  app.post('/users', userPostController);
  app.delete('/users/:user', userDeleteController);
  app.put('/users/:user', userPutController);

  function userGetController(req, res) {
    console.log(`users_routes.js userGetController ${req.method} to ${req.originalUrl}`);
    let token = req.get('Authorization').split(' ')[1];
    findSessionByToken(token)
      .then(result => findUserByUserName(result.userName))
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(error => console.log);
  }

  function userPostController(req, res) {
    console.log('Attempt to add user with username', req.body.userName);
    const user = req.body;

    findUserByUserName(req.body.userName)
      .then(result => {
        res.status(409).send({ error: `Attempt failed for username ${req.body.userName}, user already exists` })
        console.log(`Attempt failed for username ${req.body.userName}, user already exists`);
      })
      .catch(err => {
        db.collection('users').insert(user, (err, result) => {
          if (err) {
            res.send({ 'error': 'An error has occurred' });
          } else {
            res.send(result.ops[0]);
          }
        });
      })
  };

  function userDeleteController(req, res) {
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
  };

  function userPutController(req, res) {
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
  };

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




};
