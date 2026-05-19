import { StatusPanel, type StatusIssue, type StatusTone } from '../../components/StatusPanel'
import { XmlPreview } from '../../components/XmlPreview'

export type PreviewPageProps = {
  canDownload: boolean
  tone: StatusTone
  headline: string
  detail: string
  issues: StatusIssue[]
  xml: string
  onConvert: () => void
  onDownload: () => void
}

export function PreviewPage({
  canDownload,
  tone,
  headline,
  detail,
  issues,
  xml,
  onConvert,
  onDownload,
}: PreviewPageProps) {
  return (
    <section className="editor-section preview-page">
      <div className="preview-actions">
        <button type="button" className="primary" onClick={onConvert}>
          校验并转换
        </button>
        <button type="button" className="secondary" onClick={onDownload} disabled={!canDownload}>
          下载 .svd
        </button>
      </div>
      <StatusPanel tone={tone} headline={headline} detail={detail} issues={issues} />
      <XmlPreview xml={xml} />
    </section>
  )
}
