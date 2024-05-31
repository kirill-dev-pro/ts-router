import { ZodSchema, z } from 'zod'
import { Router, type NewRoute } from './router'
import { createServer } from './server'
import { createOpenApiHandler } from './openapi'

export class App {
  private router: Router
  constructor() {
    this.router = new Router()
  }

  route<TBody extends ZodSchema, TParams extends ZodSchema, TForm extends ZodSchema>(
    route: NewRoute<TBody, TParams, TForm>,
    handler: (ctx: {
      url: string
      method: string
      body?: z.infer<TBody>
      params?: z.infer<TParams>
      form?: z.infer<TForm>
    }) => Response,
  ) {
    this.router.add(route, handler)
    return this
  }

  get(path: string, handler: (ctx: { url: string; method: string }) => Response) {
    this.router.add({ path, method: 'GET' }, handler)
    return this
  }

  post<TBody extends ZodSchema>(
    path: string,
    body: TBody,
    handler: (ctx: { url: string; method: string; body: z.infer<TBody> }) => Response,
  ) {
    this.router.add({ path, method: 'POST', body }, handler)
    return this
  }

  openapi(path: string, title: string = 'API', version: string = '1.0.0') {
    this.router.add({ path, method: 'GET' }, createOpenApiHandler(this.router, title, version))
    return this
  }

  start(port: number) {
    return createServer(this.router, port)
  }
}
