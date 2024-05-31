import type { Router } from './router'

export const createOpenApiHandler = (router: Router, title: string, version: string) => {
  const handler = () => {
    const allRoutes = router.allRoutes
    const paths = allRoutes.reduce((acc, route) => {
      acc[route.path] = {
        ...acc[route.path],
        [route.method.toLowerCase()]: {
          summary: route.info,
          responses: route.responses,
        },
      }
      return acc
    }, {} as Record<string, object>)
    const spec = {
      openapi: '3.0.0',
      info: {
        title,
        version,
      },
      paths,
    }
    return new Response(JSON.stringify(spec), { status: 200 })
  }

  return handler
}
