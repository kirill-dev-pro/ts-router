import { App } from './src/app'
import { z } from 'zod'

const app = new App()

app
  .openapi('/api', 'My API', '0.1.0')
  // .get('/hello', (ctx) => new Response('Hello World', { status: 200 }))
  // .post('/hello', z.object({ name: z.string() }), (ctx) => {
  //   return new Response('Hello ' + ctx.body.name, { status: 201 })
  // })
  // .post(
  //   '/route',
  //   {
  //     // opeanapi schema without path and method as it is already defined
  //     info: 'Route Info',
  //     responses: {
  //       200: {
  //         description: 'OK',
  //       },
  //     },
  //     body: z.object({
  //       name: z.string(),
  //     }),
  //   },
  //   (ctx) => {
  //     return new Response('name: ' + ctx.body.name, { status: 201 })
  //   },
  // )
  .route(
    {
      path: '/',
      method: 'GET',
      info: 'Hello World',
      responses: {
        200: {
          description: 'OK',
        },
      },
    },
    () => new Response('Hello World', { status: 200 }),
  )
  .route(
    {
      path: '/',
      method: 'POST',
      body: z.object({
        name: z.string(),
      }),
      responses: {
        201: {
          description: 'Created',
        },
      },
    },
    (ctx) => {
      return new Response('name: ' + ctx.body?.name, { status: 201 })
    },
  )
  .route(
    {
      path: '/hello/:name',
      method: 'GET',
      params: z.object({
        name: z.string(),
      }),
    },
    (ctx) => {
      return new Response('Hello ' + ctx.params?.name, { status: 200 })
    },
  )
  .start(8000)

const fetchAndLog = (url: string, options: RequestInit = {}) => {
  fetch(url, options)
    .then((res) => res.text())
    .then(console.log)
}

fetchAndLog('http://localhost:8000/')
fetchAndLog('http://localhost:8000/hello/world')
fetchAndLog('http://localhost:8000/', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' }),
})
fetchAndLog('http://localhost:8000/api')

type Server = typeof app
