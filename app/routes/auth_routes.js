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
  app.use(checkUserSession);
  app.post('/login', loginUser);

  function checkUserSession(req, res, next) {
    console.log('[MW] check authentication')
    if (req.originalUrl === '/login' || req.originalUrl === '/users') {
      next();
    } else if (!req.get('Authorization')) {
      console.log('No Authorization header added');
      res.send({ message: 'No Authorization header added' });
    } else {
      let token = req.get('Authorization').split(' ')[1];
      console.log(token);
      checkToken(token)
        .then(result => {
          console.log('[MW] check authentication passed');
          next();
        })
        .catch(error => {
          console.log('[MW] check authentication not passed:', error);
          res.send(token);
        })
    }
  }

  function checkToken(token) {
    return new Promise((resolve, reject) => {
      const details = { '_id': new ObjectID(token) };
      let date = new Date();
      date = date.getTime() / 1000;
      db.collection('sessions').findOne(details, (err, sessionFound) => {
        if (err) {
          reject(err);
        } else if (!sessionFound) {
          reject({ message: 'Incorrect token.' });
        } else if (date >= sessionFound.expireAt) {
          console.log(Math.floor(date), sessionFound.expireAt);
          reject({ message: 'Session expired.' });
        } else {
          console.log('Session:', sessionFound, ' valid');
          resolve(sessionFound);
        }
      })
    })
  }

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
          if (item) {
            console.log('Old session of user ', session.userName, ' deleted');
          }

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
};
