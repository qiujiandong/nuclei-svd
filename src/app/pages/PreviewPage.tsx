import { StatusPanel, type StatusIssue, type StatusTone } from '../../components/StatusPanel'
import { XmlPreview } from '../../components/XmlPreview'
import { Button } from '../../components/ui/button'

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
    <section className="grid min-w-0 gap-6">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onConvert}>
          校验并转换
        </Button>
        <Button type="button" variant="secondary" onClick={onDownload} disabled={!canDownload}>
          下载 .svd
        </Button>
      </div>
      <StatusPanel tone={tone} headline={headline} detail={detail} issues={issues} />
      <XmlPreview xml={xml} />
    </section>
  )
}
