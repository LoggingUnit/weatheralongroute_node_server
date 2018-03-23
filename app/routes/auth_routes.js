// auth_routes.js
var ObjectID = require('mongodb').ObjectID;

const sessionCfg = require('../../config/sessionCfg');

module.exports = function (app, db) {

  //check current session
  app.use(setUnsafeHeaders);
  app.use(checkUserSession);
  app.post('/login', loginUser);

  function setUnsafeHeaders(req, res, next) {
    res.set(sessionCfg.unsafeHeaders);
    next();
  };

  function checkUserSession(req, res, next) {
    console.log('[MW] check authentication')
    if (req.originalUrl === '/login' || req.originalUrl === '/users' || req.method === 'OPTIONS') {
      console.log('...skipped')
      next();
    } else if (!req.get('Authorization')) {
      console.log(`Access denied: no auth. header to ${req.method} url: ${req.originalUrl}`);
      res.status(401).send({ error: `Access denied: no auth. header to ${req.method} url: ', ${req.originalUrl}` });
    } else {
      let token = req.get('Authorization').split(' ')[1];
      checkToken(token)
        .then(result => {
          console.log(`Access granted: ${result} to do ${req.method} with url ${req.originalUrl}`);
          next();
        })
        .catch(error => {
          console.log(`Access denied: ${error} to do ${req.method} with url: ${req.originalUrl}`);
          res.status(401).send({ error: `Access denied: ${error} to do ${req.method} with url: ${req.originalUrl}` });
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
          reject('incorrect credentials');
        } else if (date >= sessionFound.expireAt) {
          console.log(Math.floor(date), sessionFound.expireAt);
          reject('session expired');
        } else {
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
        res.status(403).send({ error: `Access denied: incorrect username ${req.originalUrl}` });
      } else if (req.body.userPassword !== userFound.userPassword) {
        console.log(req.body.userPassword, userFound.userPassword);
        res.status(403).send({ error: `Access denied: incorrect password ${req.originalUrl}` });
      } else {
        createSession(userFound.userName)
          .then(result => {
            console.log('New session created:', result);
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
