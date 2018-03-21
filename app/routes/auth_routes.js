// auth_routes.js
var ObjectID = require('mongodb').ObjectID;
const sessionCfg = require('../../config/sessionCfg');

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

  //check current session
  app.use(function (req, res, next) {
    console.log('[MW] check authentication')
    next();
  })

  app.post('/login', loginUser);

  function loginUser(req, res) {
    console.log('[POST] loginUser');
    let details = { userName: req.body.userName };
    db.collection('users').findOne(details, (err, userFound) => {
      if (err) {
        res.send(err);
      } else if (!userFound) {
        res.send({ message: 'Incorrect username.' });
      } else if (req.body.userPassword !== userFound.userPassword) {
        console.log(req.body.userPassword, userFound.userPassword);
        res.send({ message: 'Incorrect password.' });
      } else {
        createSession(userFound.userName)
          .then(result => {
            console.log('New session:', result);
            res.send(result);
          })
          .catch(error => res.send(result));
      }
    })
  }

  function createSession(user) {
    return new Promise((resolve, reject) => {
      console.log('Create session for', user);
      let date = new Date();
      let expireAt = Math.floor(date.getTime() / 1000) + sessionCfg.lifeTime;
      let session = {
        userName: user,
        expireAt: expireAt
      };

      db.collection('sessions').remove({ userName: session.userName }, (err, item) => {
        if (err) {
          reject(err)
        } else {
          console.log('Old session of user ', session.userName, ' deleted');
          db.collection('sessions').insert(session, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result.ops[0]);
            }
          });
        }
      });
    })
  }

  // app.get('/trips/:user', (req, res) => {
  //   const user = req.params.user;
  //   const details = { 'user': user };
  //   db.collection('trips').find(details, {}).toArray()
  //     .then((data) => {
  //       // console.log(data);
  //       res.setHeader('Access-Control-Allow-Origin', '*');
  //       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //       res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
  //       res.setHeader('Access-Control-Allow-Credentials', true);
  //       res.send(data);
  //     })
  // })

  // app.get('/trips/:user/:id', (req, res) => {
  //   const id = req.params.id;
  //   const details = { '_id': new ObjectID(id) };
  //   db.collection('trips').findOne(details, (err, item) => {
  //     if (err) {
  //       res.send({ 'error': 'An error has occurred' });
  //     } else {
  //       res.send(item);
  //     }
  //   });
  // });

  // app.post('/trips', (req, res) => {
  //   console.log('[POST] trips')
  //   const trip = req.body;
  //   // console.log(trip);
  //   db.collection('trips').insert(trip, (err, result) => {
  //     if (err) {
  //       res.send({ 'error': 'An error has occurred' });
  //     } else {
  //       // Website you wish to allow to connect
  //       res.setHeader('Access-Control-Allow-Origin', '*');
  //       // Request methods you wish to allow
  //       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //       // Request headers you wish to allow
  //       res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
  //       // Set to true if you need the website to include cookies in the requests sent
  //       // to the API (e.g. in case you use sessions)
  //       res.setHeader('Access-Control-Allow-Credentials', true);
  //       res.send(result.ops[0]);
  //     }
  //   });
  // });

  // app.delete('/trips/:id', (req, res) => {
  //   const id = req.params.id;
  //   const details = { '_id': new ObjectID(id) };
  //   db.collection('trips').remove(details, (err, item) => {
  //     if (err) {
  //       res.send({ 'error': 'An error has occurred' });
  //     } else {
  //       res.setHeader('Access-Control-Allow-Origin', '*');
  //       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //       res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'Content-Type');
  //       res.setHeader('Access-Control-Allow-Credentials', true);
  //       res.send('Trip ' + id + ' deleted!');
  //     }
  //   });
  // });

  // app.put('/trips/:id', (req, res) => {
  //   const id = req.params.id;
  //   const details = { '_id': new ObjectID(id) };
  //   const note = { text: req.body.body, title: req.body.title };
  //   db.collection('trips').update(details, note, (err, result) => {
  //     if (err) {
  //       res.send({ 'error': 'An error has occurred' });
  //     } else {
  //       res.send(note);
  //     }
  //   });
  // });
};
