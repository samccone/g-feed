const Koa = require('koa');
const router = require('koa-router')();

const app = new Koa();
const port = process.env.port || 3000;
const controllers = require('./controllers');

router.get('/notifications/:id', controllers.notifications.get);
router.get('/notifications', controllers.notifications.list);

app.use(router.routes());
app.listen(port);

console.log(`server listening on port ${port}`);
