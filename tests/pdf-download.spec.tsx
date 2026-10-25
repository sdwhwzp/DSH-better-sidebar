// @vitest-environment jsdom
/** Native PDF toolbar links retain the file session and binary download route. */
import type { ReactNode } from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '../src/context-types.ts'
import { PdfDownload, registerPdfDownload } from '../src/client/sidebar/pdf-download.tsx'
import { fileAddressFor, parseFileAddress } from '../src/client/resource-address.ts'
import { en, zh } from '../src/client/locales.ts'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => children,
  IconDownloadOutlineRegular: () => <svg />,
}))
const roots: ReturnType<typeof createRoot>[] = []
afterEach(() => { act(() => { for (const root of roots.splice(0)) root.unmount() }); document.body.replaceChildren() })
function render(element: ReactNode): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => { root.render(element) })
  return host
}

type Props = Parameters<typeof PdfDownload>[0]
function props(address: string, label = en.download): Props {
  return { sessionId: 'seat-session', useTabInfo: () => ({ tab: { contentId: address } }),
    useResource: () => ({ value: { absolutePath: parseFileAddress(address)?.path ?? '' } }),
    t: () => label }
}

describe('native PDF download', () => {
  it.each([zh.download, en.download])('labels the original PDF link %s and keeps its source session', (label) => {
    const view = render(<PdfDownload {...props(fileAddressFor('file-session', undefined, '/work/a #报告.PDF'), label)} />)
    const link = view.querySelector('a')! as HTMLAnchorElement
    const url = new URL(link.href)
    expect(url.pathname).toBe('/sidebar/file')
    expect(url.searchParams.get('sessionId')).toBe('file-session')
    expect(url.searchParams.get('path')).toBe('/work/a #报告.PDF')
    expect(url.searchParams.get('download')).toBe('1')
    expect(link.hasAttribute('download')).toBe(true)
    expect(link.getAttribute('aria-label')).toBe(label)
  })

  it('uses the resolved source path for a relative address instead of the enclosing workspace', () => {
    const input = props(fileAddressFor('owner', undefined, 'reports/result.pdf'))
    const view = render(<PdfDownload {...input}
      useResource={() => ({ value: { absolutePath: '/source/workspace/reports/result.pdf' } })} />)
    const link = view.querySelector('a')! as HTMLAnchorElement
    expect(new URL(link.href).searchParams.get('path')).toBe('/source/workspace/reports/result.pdf')
    expect(new URL(link.href).searchParams.get('sessionId')).toBe('owner')
  })

  it('waits until the original file has an authorized resolved path', () => {
    const view = render(<PdfDownload {...props(fileAddressFor('owner', undefined, 'report.pdf'))}
      useResource={() => ({})} />)
    expect(view.querySelector('a')).toBeNull()
  })

  it('uses the enclosing session for a legacy absolute file address', () => {
    const view = render(<PdfDownload {...props('dsh-resource://file/absolute/work/report.pdf')} />)
    const link = view.querySelector('a')! as HTMLAnchorElement
    expect(new URL(link.href).searchParams.get('sessionId')).toBe('seat-session')
  })

  it.each(['https://example.com/a.pdf', fileAddressFor('owner', undefined, '/work/a.txt')])('offers no PDF action for %s', address => {
    const view = render(<PdfDownload {...props(address)} />)
    expect(view.querySelector('a')).toBeNull()
  })

  it('waits for the keyed document seat and returns its declaration observer disposer', () => {
    const stop = vi.fn()
    const register = vi.fn((_options: object, _component: unknown) => vi.fn())
    const inject = vi.fn((_name: string, callback: () => () => void) => { callback(); return stop })
    const ctx: Pick<Context, 'slots'> = { slots: { register, inject } }
    expect(registerPdfDownload(ctx)).toBe(stop)
    expect(inject.mock.calls[0]?.[0]).toBe('sidebar.right.tab.document.action')
    expect(register).toHaveBeenCalledWith(expect.objectContaining({
      key: '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/pdf', locale: 'betterSidebar',
    }), PdfDownload)
  })
})
