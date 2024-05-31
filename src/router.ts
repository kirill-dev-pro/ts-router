import { type ZodSchema, z } from 'zod'

const isError = (value: unknown): value is Error => value instanceof Error
const isZodParseError = (value: unknown): value is z.ZodError => value instanceof z.ZodError

interface Context<TBody, TParams, TForm> {
  url: string
  method: string
  body?: TBody
  params?: TParams
  form?: TForm
}

interface Handler {
  (c: Context<any, any, any>): Response
}

export interface RouteHandler<TBody, TParams, TForm> extends Handler {
  (c: Context<TBody, TParams, TForm>): Response
}

interface ResponseInfo {
  description: string
  content: Record<string, unknown>
}

interface RouteInfo {
  responses: Record<string, unknown>
}

export type Route = {
  path: string
  method: string
  params?: ZodSchema
  body?: ZodSchema
  form?: ZodSchema
  info?: string
  responses?: Record<string, unknown>
}

interface RouteWithHandler extends Route {
  handler: Handler
}

export interface NewRoute<
  TParams extends ZodSchema,
  TBody extends ZodSchema,
  TForm extends ZodSchema,
> extends Route {
  params?: TParams
  body?: TBody
  form?: TForm
}

export class Router {
  private routes: Map<string, RouteWithHandler>

  constructor() {
    this.routes = new Map()
  }

  private routeKey({ path, method }: { path: string; method: string }) {
    return method + path
  }

  get allRoutes() {
    return Array.from(this.routes.values()).map((route) => {
      const { handler, ...rest } = route
      return rest
    })
  }

  add<TBody extends ZodSchema, TParams extends ZodSchema, TForm extends ZodSchema>(
    route: NewRoute<TBody, TParams, TForm>,
    handler: RouteHandler<z.infer<TBody>, z.infer<TParams>, z.infer<TForm>>,
  ) {
    this.routes.set(this.routeKey(route), {
      ...route,
      handler,
    })
  }

  async handle(req: Request): Promise<Response> {
    const { url, method, body, formData } = req
    const { pathname } = new URL(url)
    const route = this.routes.get(this.routeKey({ path: pathname, method }))

    if (!route) {
      return new Response('Not Found', { status: 404 })
    }

    try {
      if (route.body) {
        const bodyString = body ? await Bun.readableStreamToText(body) : ''
        const parsedBody = route.body.parse(JSON.parse(bodyString))
        return route.handler({
          url: route.path,
          method: route.method,
          body: parsedBody,
        })
      }
      if (route.form) {
        const form = await formData()
        const parsedForm = route.form.parse(form)
        return route.handler({
          url: route.path,
          method: route.method,
          form: parsedForm.data,
        })
      }
      if (route.params) {
        throw new Error('Not implemented')
      }
    } catch (error) {
      if (isZodParseError(error)) {
        return new Response(error.message, { status: 400 })
      }
      if (isError(error)) {
        return new Response(error.message, { status: 500 })
      }
      console.error(error)
    }

    return route.handler({
      url: route.path,
      method: route.method,
    })
  }
}
