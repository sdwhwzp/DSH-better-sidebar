/** Download the original PDF from its native document toolbar. */
import type { ReactNode } from 'react'
import { IconDownloadOutlineRegular, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Context } from '../../context-types.ts'
import { downloadUrl } from '../api.ts'
import type { CopyKey } from '../locales.ts'
import { parseFileAddress } from '../resource-address.ts'
import css from '../sidebar.module.css'

/** The native keyed document seat supplies its tab observer and bound locale. */
interface PdfDownloadProps {
  readonly useTabInfo: () => { readonly tab: { readonly contentId: string } }
  readonly sessionId: string
  readonly t: (key: CopyKey) => string
}

/**
 * Render a link using the file address's session, even when another session owns the sidebar.
 * @param props - native document owner, tab seat, localized copy and enclosing session.
 * @returns the original-file download link, or nothing for an unsupported address.
 */
export function PdfDownload(props: PdfDownloadProps): ReactNode {
  const { tab } = props.useTabInfo()
  const file = parseFileAddress(tab.contentId)
  if (file === undefined || !/\.pdf$/i.test(file.path)) return null
  const sessionId = file.scope === 'session' ? file.sessionId : props.sessionId
  return <Tooltip label={props.t('download')} side="bottom">
    <a className={css.iconButton} href={downloadUrl({ sessionId }, file.path)} download
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
