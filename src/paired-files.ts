/** Optional account-owned local-folder adapter; absent providers retain Host filesystem behavior. */
import type { Context, SidebarHttpRequest } from './context-types.ts'

interface PairedFiles {
  sidebar(method: string, payload: unknown, request: SidebarHttpRequest, signal: AbortSignal): Promise<{ value: unknown } | undefined>
}

/** Forward file reads to the pairing owner, preserving the authenticated transport headers. */
export async function pairedFileApi(ctx: Context, method: string, payload: unknown, request: SidebarHttpRequest): Promise<{ value: unknown } | undefined> {
  const provider = ctx.get('localWorkspaceFiles') as PairedFiles | undefined
  return provider?.sidebar(method, payload, request, AbortSignal.timeout(30_000))
}
