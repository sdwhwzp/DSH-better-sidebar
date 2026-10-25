/** Download the original PDF from its native document toolbar. */
import type { ReactNode } from 'react'
import { IconDownloadOutlineRegular, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Context } from '../../context-types.ts'
import { downloadUrl } from '../api.ts'
import type { CopyKey } from '../locales.ts'
import { parseFileAddress } from '../resource-address.ts'
import css from '../sidebar.module.css'

/** The native seat supplies the tab, resolved file metadata, and bound locale. */
interface PdfDownloadProps {
  readonly useTabInfo: () => { readonly tab: { readonly contentId: string } }
  readonly useResource: (address: string) => { readonly value?: { readonly absolutePath: string } }
  readonly sessionId: string
  readonly t: (key: CopyKey) => string
}

/**
 * Download the resolved original path using its file session, including cross-session tabs.
 * @param props - native document owner, tab seat, localized copy and enclosing session.
 * @returns the original-file download link, or nothing for an unsupported address.
 */
export function PdfDownload(props: PdfDownloadProps): ReactNode {
  const { tab } = props.useTabInfo()
  const metadata = props.useResource(tab.contentId)
  const file = parseFileAddress(tab.contentId)
  if (file === undefined || !/\.pdf$/i.test(file.path) || metadata.value === undefined) return null
  const sessionId = file.scope === 'session' ? file.sessionId : props.sessionId
  return <Tooltip label={props.t('download')} side="bottom">
    <a className={css.iconButton} href={downloadUrl({ sessionId }, metadata.value.absolutePath)} download
      aria-label={props.t('download')} data-sidebar-pdf-download>
      <IconDownloadOutlineRegular size={14} />
    </a>
  </Tooltip>
}

/**
 * Register only while the native PDF toolbar seat exists; disposal follows the plugin.
 * @param ctx - owning client context.
 * @returns the slot declaration observer's disposer.
 */
export function registerPdfDownload(ctx: Pick<Context, 'slots'>): () => void {
  return ctx.slots.inject('sidebar.right.tab.document.action', () => ctx.slots.register({
    name: 'sidebar.right.tab.document.action',
    key: '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/pdf',
    locale: 'betterSidebar',
    inject: (sessionId: string) => ({ sessionId }),
  }, PdfDownload))
}
