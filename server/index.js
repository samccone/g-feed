const Koa = require('koa');
const _ = require('koa-route');

const app = new Koa();
const port = process.env.port || 3000;

const routes = {
  index: ctx => {
    ctx.body = 'yo';
  },
};

app.use(_.get('*', routes.index));

app.listen(port);
