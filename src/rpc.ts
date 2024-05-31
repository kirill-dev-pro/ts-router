import type { App } from './app'

type Callback = (opts: CallbackOptions) => unknown

interface CallbackOptions {
  path: string[]
  args: any[]
}

const createProxy = (callback: Callback, path: string[]) => {
  const proxy: unknown = new Proxy(() => {}, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        return undefined
      }
      return createProxy(callback, [...path, key])
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args,
      })
    },
  })
  return proxy
}

const mergePath = (base: string, path: string) => {
  base = base.replace(/\/+$/, '')
  base = base + '/'
  path = path.replace(/^\/+/, '')
  return base + path
}

export function createClient<T extends App>(baseUrl: string) {
  createProxy(function proxyCallback(opts) {
    const parts = [...opts.path]
    let method = ''
    if (/^\$/.test(parts[parts.length - 1])) {
      const last = parts.pop()
      if (last) {
        method = last.replace(/^\$/, '')
      }
    }

    const path = parts.join('/')
    const url = mergePath(baseUrl, path)
    if (method === 'url') {
      if (opts.args[0] && opts.args[0].param) {
        return new URL(replaceUrlParam(url, opts.args[0].param))
      }
      return new URL(url)
    }

    const req = new ClientRequestImpl(url, method)
    if (method) {
      options ??= {}
      const args = deepMerge<ClientRequestOptions>(options, { ...(opts.args[1] ?? {}) })
      return req.fetch(opts.args[0], args)
    }
  }, [])
}

const client = createClient<App>('http://localhost:8000')

client.api.hello.$url({ param: { name: 'world' } })
