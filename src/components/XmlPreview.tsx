import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type XmlPreviewProps = {
  xml: string
}

export function XmlPreview({ xml }: XmlPreviewProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nuclei SVD preview</p>
        <CardTitle>Nuclei SVD XML 预览</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="min-w-0 max-h-[32rem] w-full overflow-auto rounded-2xl border border-slate-200 bg-slate-950">
          <pre className="m-0 min-w-full w-max p-5 text-sm leading-6 text-slate-100" data-testid="xml-preview">
            {xml || '转换成功后将在这里显示 XML 内容。'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
