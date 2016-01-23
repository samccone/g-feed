const fs = require('fs');
const path = require('path');
const toFixtures = path.join(__dirname, '../../fixtures');

const getFixture = function(name) {
  return new Promise((res, rej) => {
    fs.readFile(path.join(toFixtures, name), 'utf8', (err, d) => {
      if (err) throw err;

      res(JSON.parse(d));
    });
  });
}

module.exports = {
  list: function(ctx) {
    return getFixture('notifications.json').then((v) => ctx.body = v);
  },

  get: function(ctx, id) {
    return getFixture('notification.json').then((v) => ctx.body = v);
  },
}



