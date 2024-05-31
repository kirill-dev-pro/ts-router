import type { ZodSchema } from 'zod'
import type { Router } from './router'

export function createServer<
  TParams extends ZodSchema,
  TBody extends ZodSchema,
  TForm extends ZodSchema,
>(router: Router, port: number) {
  async function fetch(req: Request) {
    try {
      const response = await router.handle(req)
      console.log(req.method, req.url, '===>', response.status, response.statusText)
      return response
    } catch (error) {
      console.error(req.method, req.url, '===>', error)
      return new Response('Not Found', { status: 404 })
    }
  }
  const server = Bun.serve({
    fetch,
    port,
  })
  console.log(`Server running at http://localhost:${port}/`)
  return server
}
