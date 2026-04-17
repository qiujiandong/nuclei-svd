import { useMemo, useState } from 'react'
import './App.css'
import { FieldGuide } from './components/FieldGuide'
import { StatusPanel, type StatusIssue, type StatusTone } from './components/StatusPanel'
import { XmlPreview } from './components/XmlPreview'
import { ConversionError } from './lib/errors'
import {
  buildSvdInputFromEditor,
  createDefaultCustomPeripheral,
  createDefaultEditorDevice,
  createEmptyField,
  createEmptyRegister,
  resolveIRegionPeripherals,
  type EditorAccess,
  type EditorDevice,
  type EditorField,
  type EditorPeripheral,
  type EditorRegister,
} from './lib/editorModel'
import { transformToSvd } from './lib/transformToSvd'
import { validateSvdInput } from './lib/validate'
import { ACCESS_VALUES } from './types/svd'

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
  detail: '设置设备、寄存器组、寄存器和位域后，点击“校验并转换”。',
  issues: [],
  xml: '',
  downloadName: 'nuclei-device.svd',
}

function createCollapsedDefaultDevice() {
  const nextDevice = createDefaultEditorDevice()
  return {
    ...nextDevice,
    iregionExpanded: false,
    iregionPeripherals: nextDevice.iregionPeripherals.map((peripheral) => ({
      ...peripheral,
      expanded: false,
    })),
    peripherals: nextDevice.peripherals.map((peripheral) => ({
      ...peripheral,
      expanded: false,
    })),
  }
}

function summarizeName(value: string, fallback: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function formatResolvedAddress(baseAddress: string, offset: string) {
  const parsedBase = Number(baseAddress)
  const parsedOffset = Number(offset)

  if (!Number.isInteger(parsedBase) || !Number.isInteger(parsedOffset)) {
    return '--'
  }

  return `0x${(parsedBase + parsedOffset).toString(16).toUpperCase()}`
}

function AccessSelect({
  value,
  onChange,
  label,
  className,
}: {
  value: EditorAccess
  onChange: (nextValue: EditorAccess) => void
  label: string
  className?: string
}) {
  return (
    <label className={className}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as EditorAccess)}>
        <option value="">继承默认</option>
        {ACCESS_VALUES.map((access) => (
          <option key={access} value={access}>
            {access}
          </option>
        ))}
      </select>
    </label>
  )
}

function App() {
  const [device, setDevice] = useState<EditorDevice>(() => createDefaultEditorDevice())
  const [state, setState] = useState<ConversionState>(initialState)

  const resolvedIRegionPeripherals = useMemo(
    () => resolveIRegionPeripherals(device.iregionBaseAddress, device.iregionPeripherals),
    [device.iregionBaseAddress, device.iregionPeripherals],
  )

  const canDownload = state.tone === 'success' && state.xml.length > 0
  const stats = useMemo(() => {
    const iregionGroupCount = device.iregionPeripherals.length
    const customGroupCount = device.peripherals.length
    const registerCount = [...device.iregionPeripherals, ...device.peripherals].reduce(
      (total, peripheral) => total + peripheral.registers.length,
      0,
    )
    const fieldCount = [...device.iregionPeripherals, ...device.peripherals].reduce(
      (total, peripheral) =>
        total +
        peripheral.registers.reduce((registerTotal, register) => registerTotal + register.fields.length, 0),
      0,
    )
    return { iregionGroupCount, customGroupCount, registerCount, fieldCount }
  }, [device])

  const invalidateResult = (detail = '配置已变更，请重新执行校验与转换。') => {
    setState((current) => {
      if (current.tone === 'idle' && current.xml.length === 0 && current.detail === detail) {
        return current
      }

      return {
        ...initialState,
        detail,
      }
    })
  }

  const updateDevice = (updater: (current: EditorDevice) => EditorDevice) => {
    setDevice((current) => updater(current))
    invalidateResult()
  }

  const updatePeripheral = (
    peripheralId: string,
    updater: (current: EditorPeripheral) => EditorPeripheral,
  ) => {
    updateDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId ? updater(peripheral) : peripheral,
      ),
    }))
  }

  const toggleIRegionPeripheral = (peripheralId: string) => {
    setDevice((current) => ({
      ...current,
      iregionPeripherals: current.iregionPeripherals.map((peripheral) =>
        peripheral.id === peripheralId ? { ...peripheral, expanded: !peripheral.expanded } : peripheral,
      ),
    }))
  }

  const toggleIRegionCard = () => {
    setDevice((current) => ({
      ...current,
      iregionExpanded: !current.iregionExpanded,
    }))
  }

  const updateRegister = (
    peripheralId: string,
    registerId: string,
    updater: (current: EditorRegister) => EditorRegister,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      registers: peripheral.registers.map((register) =>
        register.id === registerId ? updater(register) : register,
      ),
    }))
  }

  const updateField = (
    peripheralId: string,
    registerId: string,
    fieldId: string,
    updater: (current: EditorField) => EditorField,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      fields: register.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }))
  }

  const togglePeripheral = (peripheralId: string) => {
    setDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId ? { ...peripheral, expanded: !peripheral.expanded } : peripheral,
      ),
    }))
  }

  const toggleRegister = (peripheralId: string, registerId: string) => {
    setDevice((current) => ({
      ...current,
      peripherals: current.peripherals.map((peripheral) =>
        peripheral.id === peripheralId
          ? {
              ...peripheral,
              registers: peripheral.registers.map((register) =>
                register.id === registerId ? { ...register, expanded: !register.expanded } : register,
              ),
            }
          : peripheral,
      ),
    }))
  }

  const handleDeviceChange = (field: keyof EditorDevice, value: string) => {
    updateDevice((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleIRegionBaseAddressChange = (value: string) => {
    updateDevice((current) => ({
      ...current,
      iregionBaseAddress: value,
    }))
  }

  const handlePeripheralChange = (
    peripheralId: string,
    field: keyof Omit<EditorPeripheral, 'id' | 'expanded' | 'registers'>,
    value: string,
  ) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      [field]: value,
    }))
  }

  const handleRegisterChange = (
    peripheralId: string,
    registerId: string,
    field: keyof Omit<EditorRegister, 'id' | 'expanded' | 'fields'>,
    value: string,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      [field]: value,
    }))
  }

  const handleFieldChange = (
    peripheralId: string,
    registerId: string,
    fieldId: string,
    field: keyof Omit<EditorField, 'id' | 'expanded'>,
    value: string,
  ) => {
    updateField(peripheralId, registerId, fieldId, (current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAddPeripheral = () => {
    updateDevice((current) => ({
      ...current,
      peripherals: [
        ...current.peripherals,
        createDefaultCustomPeripheral(current.peripherals.length),
      ],
    }))
  }

  const handleRemovePeripheral = (peripheralId: string) => {
    updateDevice((current) => ({
      ...current,
      peripherals: current.peripherals.filter((peripheral) => peripheral.id !== peripheralId),
    }))
  }

  const handleAddRegister = (peripheralId: string, registerCount: number) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      expanded: true,
      registers: [
        ...peripheral.registers,
        createEmptyRegister({
          name: `REG${registerCount}`,
          description: 'New register',
          addressOffset: `0x${(registerCount * 4).toString(16).toUpperCase()}`,
        }),
      ],
    }))
  }

  const handleRemoveRegister = (peripheralId: string, registerId: string) => {
    updatePeripheral(peripheralId, (peripheral) => ({
      ...peripheral,
      registers: peripheral.registers.filter((register) => register.id !== registerId),
    }))
  }

  const handleAddField = (
    peripheralId: string,
    registerId: string,
    fieldCount: number,
  ) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      expanded: true,
      fields: [
        ...register.fields,
        createEmptyField({
          name: `FIELD${fieldCount}`,
          description: 'New bit field',
          bitOffset: String(fieldCount),
        }),
      ],
    }))
  }

  const handleRemoveField = (peripheralId: string, registerId: string, fieldId: string) => {
    updateRegister(peripheralId, registerId, (register) => ({
      ...register,
      fields: register.fields.filter((field) => field.id !== fieldId),
    }))
  }

  const handleConvert = () => {
    try {
      const input = buildSvdInputFromEditor(device)
      const normalized = validateSvdInput(input)
      const xml = transformToSvd(normalized)
      setState({
        tone: 'success',
        headline: '转换成功',
        detail: '寄存器配置已通过 schema 与语义校验，可下载生成的 CMSIS-SVD 文件。',
        issues: [],
        xml,
        downloadName: normalized.metadata.downloadFileName,
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
        downloadName: 'nuclei-device.svd',
      })
    }
  }

  const handleReset = () => {
    setDevice(createCollapsedDefaultDevice())
    setState(initialState)
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
        <div className="hero-brand">
          <img src={`${import.meta.env.BASE_URL}nuclei.svg`} alt="Nuclei" className="hero-logo" />
          <div>
            <p className="eyebrow">A tool to generate CMSIS-SVD for SoC based on Nuclei CPU</p>
            <div className="hero-title">
              <h1>Nuclei SVD</h1>
            </div>
            <p className="hero-copy">
              为基于 Nuclei CPU 的 SoC 平台快速生成 CMSIS-SVD 文件，便于研发人员进行系统调试。
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={handleConvert}>
            校验并转换
          </button>
          <button type="button" className="secondary" onClick={handleDownload} disabled={!canDownload}>
            下载 .svd
          </button>
        </div>
      </header>

      <section className="metrics-bar" aria-label="当前寄存器配置统计">
        <span>设备：{summarizeName(device.name, '未命名设备')}</span>
        <span>{stats.iregionGroupCount} 个 IREGION 寄存器组</span>
        <span>{stats.customGroupCount} 个自定义寄存器组</span>
        <span>{stats.registerCount} 个寄存器</span>
        <span>{stats.fieldCount} 个位域</span>
      </section>

      <section className="layout-grid">
        <section className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Interactive register designer</p>
              <h2>寄存器设置界面</h2>
            </div>
            <div className="card-actions">
              <button type="button" className="secondary" onClick={handleAddPeripheral}>
                新增寄存器组
              </button>
              <button type="button" className="secondary" onClick={handleReset}>
                重置设置
              </button>
            </div>
          </div>

          <section className="editor-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Device profile</p>
                <h3>设备基础信息</h3>
              </div>
            </div>
            <div className="form-grid device-form-grid">
              <label>
                <span>设备名称</span>
                <input
                  value={device.name}
                  onChange={(event) => handleDeviceChange('name', event.target.value)}
                />
              </label>
              <label>
                <span>版本</span>
                <input
                  value={device.version}
                  onChange={(event) => handleDeviceChange('version', event.target.value)}
                />
              </label>
              <label>
                <span>addressUnitBits</span>
                <input
                  value={device.addressUnitBits}
                  onChange={(event) => handleDeviceChange('addressUnitBits', event.target.value)}
                  inputMode="numeric"
                />
              </label>
              <label>
                <span>width</span>
                <input
                  value={device.width}
                  onChange={(event) => handleDeviceChange('width', event.target.value)}
                  inputMode="numeric"
                />
              </label>
              <label>
                <span>默认 size</span>
                <input
                  value={device.size}
                  onChange={(event) => handleDeviceChange('size', event.target.value)}
                  inputMode="numeric"
                />
              </label>
              <AccessSelect
                value={device.access}
                onChange={(nextValue) => handleDeviceChange('access', nextValue)}
                label="默认 access"
              />
              <label>
                <span>默认 resetValue</span>
                <input
                  value={device.resetValue}
                  onChange={(event) => handleDeviceChange('resetValue', event.target.value)}
                  placeholder="0x00000000"
                />
              </label>
              <label>
                <span>默认 resetMask</span>
                <input
                  value={device.resetMask}
                  onChange={(event) => handleDeviceChange('resetMask', event.target.value)}
                  placeholder="0xFFFFFFFF"
                />
              </label>
              <label className="device-span-full">
                <span>设备描述</span>
                <input
                  value={device.description}
                  onChange={(event) => handleDeviceChange('description', event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="editor-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">IREGION map</p>
                <h3>IREGION</h3>
              </div>
            </div>

            <article className="editor-card readonly-card">
              <div className="card-header">
                <button
                  type="button"
                  className="collapse-toggle"
                  aria-expanded={device.iregionExpanded}
                  aria-label={device.iregionExpanded ? '折叠 IREGION' : '展开 IREGION'}
                  onClick={toggleIRegionCard}
                >
                  <span>{device.iregionExpanded ? '▾' : '▸'}</span>
                  <span>IREGION</span>
                </button>
                <div className="readonly-header-controls">
                  <label className="inline-field inline-medium">
                    <span>IREGION 基地址</span>
                    <input
                      aria-label="IREGION 基地址"
                      value={device.iregionBaseAddress}
                      onChange={(event) => handleIRegionBaseAddressChange(event.target.value)}
                      placeholder="0x18000000"
                    />
                  </label>
                  <div className="readonly-meta">
                    <span>寄存器组：{stats.iregionGroupCount}</span>
                  </div>
                </div>
              </div>

              {device.iregionExpanded ? (
                <div className="card-body">
                  <div className="readonly-toolbar">
                    <span className="readonly-note">
                      IREGION 中的寄存器组来自 `IREGION.pdf`，只读展示，实际地址 = 基地址 + 组偏移。
                    </span>
                  </div>

                  <div className="card-stack">
                    {resolvedIRegionPeripherals.map((peripheral, peripheralIndex) => (
                      <article className="editor-card group-card readonly-card" key={peripheral.id}>
                        <div className="card-header">
                          <button
                            type="button"
                            className="collapse-toggle"
                            aria-expanded={peripheral.expanded}
                            aria-label={`${peripheral.expanded ? '折叠' : '展开'}寄存器组 ${summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}`}
                            onClick={() => toggleIRegionPeripheral(peripheral.id)}
                          >
                            <span>{peripheral.expanded ? '▾' : '▸'}</span>
                            <span>{summarizeName(peripheral.name, `IREGION 组 ${peripheralIndex + 1}`)}</span>
                          </button>
                          <div className="readonly-meta">
                            <span>实际基地址：{peripheral.baseAddress}</span>
                            <span>寄存器数：{peripheral.registers.length}</span>
                          </div>
                        </div>

                        {peripheral.expanded ? (
                          <div className="card-body">
                            <div className="readonly-grid">
                              <div>
                                <span className="readonly-label">groupName</span>
                                <strong>{peripheral.groupName || '-'}</strong>
                              </div>
                              <div>
                                <span className="readonly-label">实际基地址</span>
                                <strong>{peripheral.baseAddress}</strong>
                              </div>
                              <div className="readonly-wide">
                                <span className="readonly-label">说明</span>
                                <strong>{peripheral.description}</strong>
                              </div>
                            </div>

                            <div className="field-table-wrap">
                              <table className="field-table readonly-table">
                                <thead>
                                  <tr>
                                    <th scope="col">寄存器名称</th>
                                    <th scope="col">addressOffset</th>
                                    <th scope="col">实际地址</th>
                                    <th scope="col">size</th>
                                    <th scope="col">access</th>
                                    <th scope="col">说明</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {peripheral.registers.map((register) => (
                                    <tr key={register.id}>
                                      <td>{register.name}</td>
                                      <td>{register.addressOffset}</td>
                                      <td>{formatResolvedAddress(peripheral.baseAddress, register.addressOffset)}</td>
                                      <td>{register.size || device.size}</td>
                                      <td>{register.access || device.access || 'inherit'}</td>
                                      <td>{register.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          </section>

          <section className="editor-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Custom register groups</p>
                <h3>自定义寄存器组</h3>
              </div>
            </div>

            <div className="card-stack">
              {device.peripherals.map((peripheral, peripheralIndex) => (
                <article className="editor-card group-card" key={peripheral.id}>
                  <div className="card-header">
                    <button
                      type="button"
                      className="collapse-toggle"
                      aria-expanded={peripheral.expanded}
                      aria-label={`${peripheral.expanded ? '折叠' : '展开'}寄存器组 ${summarizeName(peripheral.name, `寄存器组 ${peripheralIndex + 1}`)}`}
                      onClick={() => togglePeripheral(peripheral.id)}
                    >
                      <span>{peripheral.expanded ? '▾' : '▸'}</span>
                      <span>{summarizeName(peripheral.name, `寄存器组 ${peripheralIndex + 1}`)}</span>
                    </button>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleAddRegister(peripheral.id, peripheral.registers.length + 1)}
                      >
                        新增寄存器
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleRemovePeripheral(peripheral.id)}
                      >
                        删除组
                      </button>
                    </div>
                  </div>

                  {peripheral.expanded ? (
                    <div className="card-body">
                      <div className="inline-field-row" aria-label={`寄存器组 ${summarizeName(peripheral.name, `寄存器组 ${peripheralIndex + 1}`)} 设置`}>
                        <label className="inline-field inline-medium">
                          <span>组名称</span>
                          <input
                            value={peripheral.name}
                            onChange={(event) =>
                              handlePeripheralChange(peripheral.id, 'name', event.target.value)
                            }
                          />
                        </label>
                        <label className="inline-field inline-small">
                          <span>groupName</span>
                          <input
                            value={peripheral.groupName}
                            onChange={(event) =>
                              handlePeripheralChange(peripheral.id, 'groupName', event.target.value)
                            }
                          />
                        </label>
                        <label className="inline-field inline-small">
                          <span>baseAddress</span>
                          <input
                            value={peripheral.baseAddress}
                            onChange={(event) =>
                              handlePeripheralChange(peripheral.id, 'baseAddress', event.target.value)
                            }
                            placeholder="0x40000000"
                          />
                        </label>
                        <label className="inline-field inline-wide">
                          <span>组描述</span>
                          <input
                            value={peripheral.description}
                            onChange={(event) =>
                              handlePeripheralChange(peripheral.id, 'description', event.target.value)
                            }
                          />
                        </label>
                      </div>

                      <div className="nested-stack">
                        {peripheral.registers.map((register, registerIndex) => (
                          <article className="editor-card register-card" key={register.id}>
                            <div className="card-header">
                              <button
                                type="button"
                                className="collapse-toggle"
                                aria-expanded={register.expanded}
                                aria-label={`${register.expanded ? '折叠' : '展开'}寄存器 ${summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}`}
                                onClick={() => toggleRegister(peripheral.id, register.id)}
                              >
                                <span>{register.expanded ? '▾' : '▸'}</span>
                                <span>{summarizeName(register.name, `寄存器 ${registerIndex + 1}`)}</span>
                              </button>
                              <div className="card-actions">
                                <button
                                  type="button"
                                  className="secondary"
                                  onClick={() =>
                                    handleAddField(peripheral.id, register.id, register.fields.length + 1)
                                  }
                                >
                                  新增位域
                                </button>
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={() => handleRemoveRegister(peripheral.id, register.id)}
                                >
                                  删除寄存器
                                </button>
                              </div>
                            </div>

                            {register.expanded ? (
                              <div className="card-body">
                                <div className="inline-field-row" aria-label={`寄存器 ${summarizeName(register.name, `寄存器 ${registerIndex + 1}`)} 设置`}>
                                  <label className="inline-field inline-medium">
                                    <span>寄存器名称</span>
                                    <input
                                      value={register.name}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'name',
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                  <label className="inline-field inline-small">
                                    <span>addressOffset</span>
                                    <input
                                      value={register.addressOffset}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'addressOffset',
                                          event.target.value,
                                        )
                                      }
                                      placeholder="0x0"
                                    />
                                  </label>
                                  <label className="inline-field inline-small">
                                    <span>size</span>
                                    <input
                                      value={register.size}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'size',
                                          event.target.value,
                                        )
                                      }
                                      inputMode="numeric"
                                      placeholder={device.size || '继承默认 size'}
                                    />
                                  </label>
                                  <AccessSelect
                                    value={register.access}
                                    onChange={(nextValue) =>
                                      handleRegisterChange(peripheral.id, register.id, 'access', nextValue)
                                    }
                                    label="access"
                                    className="inline-field inline-small"
                                  />
                                  <label className="inline-field inline-small">
                                    <span>resetValue</span>
                                    <input
                                      value={register.resetValue}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'resetValue',
                                          event.target.value,
                                        )
                                      }
                                      placeholder="0x0"
                                    />
                                  </label>
                                  <label className="inline-field inline-small">
                                    <span>resetMask</span>
                                    <input
                                      value={register.resetMask}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'resetMask',
                                          event.target.value,
                                        )
                                      }
                                      placeholder="0xFFFFFFFF"
                                    />
                                  </label>
                                  <label className="inline-field inline-wide">
                                    <span>寄存器描述</span>
                                    <input
                                      value={register.description}
                                      onChange={(event) =>
                                        handleRegisterChange(
                                          peripheral.id,
                                          register.id,
                                          'description',
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                </div>

                                <div className="field-table-wrap">
                                  <table className="field-table">
                                    <thead>
                                      <tr>
                                        <th scope="col">位域名称</th>
                                        <th scope="col">bitOffset</th>
                                        <th scope="col">bitWidth</th>
                                        <th scope="col">access</th>
                                        <th scope="col">位域描述</th>
                                        <th scope="col">操作</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {register.fields.map((field, fieldIndex) => (
                                        <tr key={field.id}>
                                          <td>
                                            <input
                                              aria-label={`位域名称 ${fieldIndex + 1}`}
                                              value={field.name}
                                              onChange={(event) =>
                                                handleFieldChange(
                                                  peripheral.id,
                                                  register.id,
                                                  field.id,
                                                  'name',
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </td>
                                          <td>
                                            <input
                                              aria-label={`bitOffset ${fieldIndex + 1}`}
                                              value={field.bitOffset}
                                              onChange={(event) =>
                                                handleFieldChange(
                                                  peripheral.id,
                                                  register.id,
                                                  field.id,
                                                  'bitOffset',
                                                  event.target.value,
                                                )
                                              }
                                              inputMode="numeric"
                                            />
                                          </td>
                                          <td>
                                            <input
                                              aria-label={`bitWidth ${fieldIndex + 1}`}
                                              value={field.bitWidth}
                                              onChange={(event) =>
                                                handleFieldChange(
                                                  peripheral.id,
                                                  register.id,
                                                  field.id,
                                                  'bitWidth',
                                                  event.target.value,
                                                )
                                              }
                                              inputMode="numeric"
                                            />
                                          </td>
                                          <td>
                                            <select
                                              aria-label={`位域 access ${fieldIndex + 1}`}
                                              value={field.access}
                                              onChange={(event) =>
                                                handleFieldChange(
                                                  peripheral.id,
                                                  register.id,
                                                  field.id,
                                                  'access',
                                                  event.target.value,
                                                )
                                              }
                                            >
                                              <option value="">继承默认</option>
                                              {ACCESS_VALUES.map((access) => (
                                                <option key={access} value={access}>
                                                  {access}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td>
                                            <input
                                              aria-label={`位域描述 ${fieldIndex + 1}`}
                                              value={field.description}
                                              onChange={(event) =>
                                                handleFieldChange(
                                                  peripheral.id,
                                                  register.id,
                                                  field.id,
                                                  'description',
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </td>
                                          <td>
                                            <button
                                              type="button"
                                              className="ghost-button table-action"
                                              onClick={() =>
                                                handleRemoveField(peripheral.id, register.id, field.id)
                                              }
                                            >
                                              删除
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="side-column">
          <section className="panel guide-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Interactive guide</p>
                <h2>寄存器配置说明</h2>
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
