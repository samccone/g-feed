const Koa = require('koa');
const router = require('koa-router')();
const koaStatic = require('koa-static');
const koaConvert = require('koa-convert');

const app = new Koa();
const port = process.env.port || 3000;
const controllers = require('./controllers');

router.get('/api/notifications/:id', controllers.notifications.get);
router.get('/api/notifications', controllers.notifications.list);

app.use(router.routes());
app.use(koaConvert(koaStatic('../web')));
app.listen(port);

console.log(`server listening on port ${port}`);
