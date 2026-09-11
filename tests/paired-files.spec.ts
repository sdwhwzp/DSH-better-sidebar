import { describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'
import type { SidebarHttpRequest, SidebarWebRoute } from '../src/context-types.ts'

describe('paired folder routes', () => {
  it('uses the authenticated adapter for trees, previews and media; refuses uploads without writing the placeholder', async () => {
    const routes: SidebarWebRoute[] = []
    const cleanups: Array<() => void> = []
    const calls: string[] = []
    const bytes = Buffer.from([0, 255, 128, 42])
    const ctx = {
      webRuntime: { trustedHosts: ['example.com'] },
      webServer: {
        register: (route: SidebarWebRoute) => { routes.push(route); return () => {} },
        registerUpgrade: () => () => {},
      },
      sessions: { get: () => undefined },
      tools: { register: () => () => {} },
      effect: (fn: () => unknown) => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup as () => void) },
      inject: () => () => {},
      on: () => () => {},
      get: (name: string) => name !== 'localWorkspaceFiles' ? undefined : {
        sidebar: async (method: string, _payload: unknown, request: SidebarHttpRequest) => {
          calls.push(method)
          if (request.headers.cookie !== 'owner') throw new Error('account unavailable')
          if (method === 'fs.upload') throw new Error('local upload unsupported')
          return { value: method === 'fs.bytes' ? bytes : { path: 'local-root', entries: [{ name: '中文.md', isDir: false }] } }
        },
      },
    }
    apply(ctx as never)
    const run = async (route: string, method: string, url: string, body = '{}', cookie = 'owner') => {
      let status = 0
      let result = Buffer.alloc(0)
      const request = { method, url, headers: { host: 'example.com', origin: 'https://example.com', 'sec-fetch-site': 'same-origin', cookie },
        [Symbol.asyncIterator]: async function* () { yield Buffer.from(body) } }
      const response = { writeHead: (value: number) => { status = value }, end: (value?: string | Buffer) => { result = Buffer.from(value ?? '') } }
      const handler = routes.find(row => row.path === route)!.handler
      await handler(request as never, response as never)
      return { status, result }
    }
    try {
      const tree = await run('/sidebar/api', 'POST', '/sidebar/api/fs.tree', '{"sessionId":"paired"}')
      expect(tree.status).toBe(200)
      expect(tree.result.toString()).toContain('中文.md')
      const media = await run('/sidebar/file', 'GET', '/sidebar/file?sessionId=paired&path=%2Fabsent%2Fimage.png')
      expect(media.status).toBe(200)
      expect(media.result).toEqual(bytes)
      const rejected = await run('/sidebar/api', 'POST', '/sidebar/api/fs.tree', '{"sessionId":"paired"}', 'other')
      expect(rejected.status).not.toBe(200)
      const upload = await run('/sidebar/upload', 'POST', '/sidebar/upload?sessionId=paired&dir=%2Fabsent&relativePath=x.txt')
      expect(upload.result.toString()).toContain('local upload unsupported')
      expect(calls).toEqual(['fs.tree', 'fs.bytes', 'fs.tree', 'fs.upload'])
    } finally { for (const cleanup of cleanups.reverse()) cleanup() }
  })
})
