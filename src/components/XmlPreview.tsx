type XmlPreviewProps = {
  xml: string
}

export function XmlPreview({ xml }: XmlPreviewProps) {
  return (
    <section className="panel preview-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Nuclei SVD preview</p>
          <h2>Nuclei SVD XML 预览</h2>
        </div>
      </div>
      <pre className="xml-preview" data-testid="xml-preview">
        {xml || '转换成功后将在这里显示 XML 内容。'}
      </pre>
    </section>
  )
}
