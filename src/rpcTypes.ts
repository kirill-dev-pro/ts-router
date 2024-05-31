import type { App } from './app'

type PathToChain<
  Path extends string,
  E extends Schema,
  Original extends string = '',
> = Path extends `/${infer P}`
  ? PathToChain<P, E, Path>
  : Path extends `${infer P}/${infer R}`
  ? { [K in P]: PathToChain<R, E, Original> }
  : {
      [K in Path extends '' ? 'index' : Path]: ClientRequest<
        E extends Record<string, unknown> ? E[Original] : never
      >
    }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Client<T> = T extends App
  ? S extends Record<infer K, Schema>
    ? K extends string
      ? PathToChain<K, S>
      : never
    : never
  : never
