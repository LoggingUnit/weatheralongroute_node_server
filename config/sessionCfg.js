module.exports = {
    lifeTime : 6000, //sec per session
    unsafeHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'X-Requested-With,content-type, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': true
    }
  };