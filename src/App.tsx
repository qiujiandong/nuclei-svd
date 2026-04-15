import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
import { FieldGuide } from './components/FieldGuide'
import { StatusPanel, type StatusIssue, type StatusTone } from './components/StatusPanel'
import { XmlPreview } from './components/XmlPreview'
import { svdYamlTemplate } from './domain/template'
import { ConversionError } from './lib/errors'
import { convertYamlToSvd } from './lib/convertYamlToSvd'

type ConversionState = {
  tone: StatusTone
  headline: string
  detail: string
  issues: StatusIssue[]
  xml: string
  downloadName: string
}

const initialState: ConversionState = {
  tone: 'idle',
  headline: '等待转换',
  detail: '上传 YAML 文件或直接在编辑区修改模板，然后点击“校验并转换”。',
  issues: [],
  xml: '',
  downloadName: 'device.svd',
}

function App() {
  const [yamlInput, setYamlInput] = useState(svdYamlTemplate)
  const [sourceName, setSourceName] = useState('default-template.yaml')
  const [state, setState] = useState<ConversionState>(initialState)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const canDownload = state.tone === 'success' && state.xml.length > 0
  const stats = useMemo(() => {
    const lines = yamlInput.split('\n').length
    const chars = yamlInput.length
    return { lines, chars }
  }, [yamlInput])

  const handleYamlChange = (value: string) => {
    setYamlInput(value)

    if (state.tone === 'success' || state.xml) {
      setState({
        ...initialState,
        detail: '输入已变更，请重新执行校验与转换。',
      })
    }
  }

  const handleConvert = () => {
    try {
      const result = convertYamlToSvd(yamlInput)
      setState({
        tone: 'success',
        headline: '转换成功',
        detail: 'YAML 已通过语法、schema 与语义校验，可下载生成的 CMSIS-SVD 文件。',
        issues: [],
        xml: result.xml,
        downloadName: result.normalized.metadata.downloadFileName,
      })
    } catch (error) {
      const issues =
        error instanceof ConversionError
          ? error.issues
          : [{ path: 'document', message: '发生未知错误，请检查输入或查看控制台。', rule: 'unknown' }]

      setState({
        tone: 'error',
        headline: '校验失败',
        detail: '请先修复以下错误，转换被阻止。',
        issues,
        xml: '',
        downloadName: 'device.svd',
      })
    }
  }

  const handleReset = () => {
    setYamlInput(svdYamlTemplate)
    setSourceName('default-template.yaml')
    setState(initialState)
    inputRef.current?.focus()
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text =
      typeof file.text === 'function'
        ? await file.text()
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result ?? ''))
            reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
            reader.readAsText(file)
          })

    setYamlInput(text)
    setSourceName(file.name)
    setState({
      ...initialState,
      detail: `已加载 ${file.name}，现在可以执行校验与转换。`,
    })
  }

  const handleDownload = () => {
    if (!canDownload) return

    const blob = new Blob([state.xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = state.downloadName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Pure frontend · GitHub Pages ready</p>
          <h1>YAML to CMSIS-SVD Converter</h1>
          <p className="hero-copy">
            为 SoC 软件调试人员提供更易填写的 YAML 模板，浏览器内完成校验、转换、预览与下载，
            优先避免寄存器地址类错误。
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={handleConvert}>
            校验并转换
          </button>
          <button type="button" className="secondary" onClick={handleReset}>
            恢复默认模板
          </button>
          <button type="button" className="secondary" onClick={handleDownload} disabled={!canDownload}>
            下载 .svd
          </button>
        </div>
      </header>

      <section className="metrics-bar" aria-label="当前输入统计">
        <span>来源：{sourceName}</span>
        <span>{stats.lines} lines</span>
        <span>{stats.chars} chars</span>
      </section>

      <section className="layout-grid">
        <section className="panel template-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Authoring template</p>
              <h2>默认 YAML 模板</h2>
            </div>
            <label className="upload-button">
              上传 YAML
              <input type="file" accept=".yaml,.yml,text/yaml,text/x-yaml" onChange={handleUpload} />
            </label>
          </div>
          <textarea
            ref={inputRef}
            value={yamlInput}
            onChange={(event) => handleYamlChange(event.target.value)}
            spellCheck={false}
            aria-label="YAML editor"
            className="yaml-editor"
          />
        </section>

        <aside className="side-column">
          <section className="panel guide-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Field guide</p>
                <h2>填写说明</h2>
              </div>
            </div>
            <FieldGuide />
          </section>
          <StatusPanel
            tone={state.tone}
            headline={state.headline}
            detail={state.detail}
            issues={state.issues}
          />
        </aside>
      </section>

      <XmlPreview xml={state.xml} />
    </main>
  )
}

export default App
