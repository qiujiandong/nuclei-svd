import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'

type XmlPreviewProps = {
  xml: string
}

export function XmlPreview({ xml }: XmlPreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nuclei SVD preview</p>
        <CardTitle>Nuclei SVD XML 预览</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[32rem] rounded-2xl border border-slate-200 bg-slate-950">
          <pre className="m-0 p-5 text-sm leading-6 text-slate-100" data-testid="xml-preview">
            {xml || '转换成功后将在这里显示 XML 内容。'}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
