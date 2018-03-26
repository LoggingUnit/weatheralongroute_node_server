// auth_routes.js
var ObjectID = require('mongodb').ObjectID;

const sessionCfg = require('../../config/sessionCfg');
const allowedPaths = require('../../config/allowedPaths').allowedPaths;

module.exports = function (app, db) {

  //check current session
  app.use(setUnsafeHeaders);
  app.use(checkUserSession);

  app.post('/auth/login', loginUser);
  app.delete('/auth/logout', logoutUser);

  function logoutUser(req, res, next) {
    let details = { userName: req.body.userName };
    db.collection('sessions').remove(details, (err, item) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send('Session for ' + req.body.userName + ' deleted!');
      }
    });
  }

  function isRequestAllowedWithNoAuthCheck(req) {
    if (req.method === 'OPTIONS') return true;
    let flag = false;
    allowedPaths.forEach(i => {
      req.originalUrl.search(i) === (-1) ? null : flag = true;
    });
    return flag;
  }

  function checkUserSession(req, res, next) {
    if (isRequestAllowedWithNoAuthCheck(req)) {
      console.log(req.originalUrl);
      next();
    } else if (!req.get('Authorization')) {
      console.log(`Access denied: no auth. header to ${req.method} by following URL:${req.originalUrl}`);
      res.status(401).send({ error: `Access denied: no auth. header to ${req.method} by following URL:', ${req.originalUrl}` });
    } else {
      let token = req.get('Authorization').split(' ')[1];
      checkToken(token)
        .then(result => {
          console.log(`Access granted: ${result.userName} to ${req.method} by following URL:${req.originalUrl}`);
          next();
        })
        .catch(error => {
          console.log(`Access denied: ${error} to ${req.method} by following URL:${req.originalUrl}`);
          res.status(401).send({ error: `Access denied: ${error} to ${req.method} by following URL:${req.originalUrl}` });
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
    console.log('Attempt to login by user:', req.body.userName);
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
            console.log('Session created:\n', result);
            res.send(result);
          })
          .catch(error => res.send(result));
      }
    })
  }

  function createSession(user) {
    return new Promise((resolve, reject) => {
      console.log(`Session creating for ${user}:`);
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
            console.log('Session obsolate removed for', session.userName);
          }

          db.collection('sessions').insert(session, (err, result) => {
            if (err) {
              reject(err)
            } else {
              console.log('Session created for', session.userName);
              resolve(result.ops[0]);
            }
          });
        }
      });
    })
  }

  function setUnsafeHeaders(req, res, next) {
    res.set(sessionCfg.unsafeHeaders);
    next();
  };
};
