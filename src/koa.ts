import Koa from 'koa'

export async function startKoa() {
  const app = new Koa()

  app.use(async(ctx) => {
    ctx.body = 'Hello World'
  })

  app.listen(3000)
}
