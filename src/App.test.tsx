import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

function closestCard(element: HTMLElement) {
  const card = element.closest('.editor-card')
  if (!(card instanceof HTMLElement)) {
    throw new Error('Expected element to be inside a card')
  }

  return card
}

describe('App', () => {
  it('shows the interactive register editor on first render', () => {
    render(<App />)

    expect(screen.queryByLabelText('YAML editor')).not.toBeInTheDocument()
    expect(screen.getByText('寄存器设置界面')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NucleiDemo')).toBeInTheDocument()
    expect(screen.getByLabelText('默认 size')).toHaveValue('32')
    expect(screen.getByText('设备名称').closest('label')).toHaveAttribute('data-input-hint', 'true')
    expect(screen.getByLabelText('IREGION 基地址').closest('.device-info-panel')).toBeInTheDocument()
    expect(screen.getByText('等待转换').closest('.hero-actions')).toBe(
      screen.getByRole('button', { name: '校验并转换' }).closest('.hero-actions'),
    )
    expect(screen.getByText('6 个 IREGION 寄存器组')).toBeInTheDocument()
    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组 GROUP0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' })).toBeInTheDocument()
    expect(closestCard(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' }))).toHaveClass('template-color-1')
    expect(closestCard(screen.getByRole('button', { name: '展开寄存器组 GROUP0' }))).toHaveClass('template-color-1')
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 GROUP0' }))
    expect(screen.getByText('derivedFrom：GROUP_TEMPLATE0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '折叠寄存器组 GROUP0' }))
    expect(screen.getByRole('button', { name: '新增寄存器组模板' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开 IREGION' })).toBeInTheDocument()
    expect(screen.queryByText('寄存器配置说明')).not.toBeInTheDocument()
  })

  it('collapses the device profile settings to the left side', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '向左折叠设备基础信息' }))

    expect(screen.queryByLabelText('设备名称')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开设备基础信息' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '展开设备基础信息' }))

    expect(screen.getByLabelText('设备名称')).toHaveValue('NucleiDemo')
  })

  it('converts the current register configuration and enables download', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<name>NucleiDemo</name>')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeEnabled()
  })

  it('creates peripheral templates and derives concrete peripheral instances', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组模板' }))
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE1' }))
    fireEvent.change(screen.getAllByLabelText('寄存器组模板名称').at(-1) as HTMLElement, {
      target: { value: 'GPIO_TEMPLATE' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: '生成实例' }).at(-1) as HTMLElement)

    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GPIO_TEMPLATE_INST1')).toBeInTheDocument()
    expect(screen.getByText('derivedFrom：GPIO_TEMPLATE')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<peripheral derivedFrom="GPIO_TEMPLATE">')
  })

  it('removes derived peripheral instances when deleting their group template', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组模板' }))
    fireEvent.click(screen.getAllByRole('button', { name: '生成实例' }).at(-1) as HTMLElement)

    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GROUP_TEMPLATE1_INST1')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '删除模板' }).at(-1) as HTMLElement)

    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('GROUP_TEMPLATE1_INST1')).not.toBeInTheDocument()
  })

  it('omits peripheral templates that have no derived instances from generated XML', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组模板' }))
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE1' }))
    fireEvent.change(screen.getAllByLabelText('寄存器组模板名称').at(-1) as HTMLElement, {
      target: { value: 'UNUSED_TEMPLATE' },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).not.toHaveTextContent('<name>UNUSED_TEMPLATE</name>')
  })

  it('keeps standalone custom groups available in the instance area', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))

    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GROUP1')).toBeInTheDocument()
    expect(screen.getByText('derivedFrom：-')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '折叠寄存器模板 REG_TEMPLATE0' })).toBeInTheDocument()
  })

  it('creates register templates and derives concrete register instances', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), { target: { value: 'STATUS_TEMPLATE' } })
    fireEvent.click(screen.getAllByRole('button', { name: '生成实例' }).at(-1) as HTMLElement)

    expect(screen.getByDisplayValue('STATUS_TEMPLATE_INST0')).toBeInTheDocument()
    expect(screen.getByText('derivedFrom：STATUS_TEMPLATE')).toBeInTheDocument()
    expect(closestCard(screen.getByRole('button', { name: '折叠寄存器模板 STATUS_TEMPLATE' }))).toHaveClass('register-color-1')
    expect(closestCard(screen.getByRole('button', { name: '折叠寄存器 STATUS_TEMPLATE_INST0' }))).toHaveClass('register-color-1')
    expect(closestCard(screen.getByRole('button', { name: '折叠寄存器模板 STATUS_TEMPLATE' }))).not.toHaveClass('template-color-1')

    fireEvent.change(screen.getByDisplayValue('STATUS_TEMPLATE_INST0'), { target: { value: 'STATUS0' } })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<register derivedFrom="STATUS_TEMPLATE">')
  })

  it('omits register templates that have no derived register instances from generated XML', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), {
      target: { value: 'UNUSED_REGISTER_TEMPLATE' },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).not.toHaveTextContent('<name>UNUSED_REGISTER_TEMPLATE</name>')
  })

  it('removes derived register instances when deleting their register template', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), { target: { value: 'STATUS_TEMPLATE' } })
    fireEvent.click(screen.getAllByRole('button', { name: '生成实例' }).at(-1) as HTMLElement)

    expect(screen.getByDisplayValue('STATUS_TEMPLATE_INST0')).toBeInTheDocument()

    const templateCard = closestCard(screen.getByRole('button', { name: '折叠寄存器模板 STATUS_TEMPLATE' }))
    fireEvent.click(within(templateCard).getByRole('button', { name: '删除模板' }))

    expect(screen.queryByDisplayValue('STATUS_TEMPLATE_INST0')).not.toBeInTheDocument()
    expect(screen.queryByText('derivedFrom：STATUS_TEMPLATE')).not.toBeInTheDocument()
  })

  it('creates register templates inside peripheral templates and derives register instances', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), {
      target: { value: 'GROUP_STATUS_TEMPLATE' },
    })
    fireEvent.click(screen.getByRole('button', { name: '生成寄存器实例' }))

    expect(screen.getByDisplayValue('GROUP_STATUS_TEMPLATE_INST0')).toBeInTheDocument()
    expect(screen.getByText('derivedFrom：GROUP_STATUS_TEMPLATE')).toBeInTheDocument()
    expect(closestCard(screen.getByRole('button', { name: '折叠寄存器模板 GROUP_STATUS_TEMPLATE' }))).toHaveClass('register-color-1')
    expect(closestCard(screen.getByRole('button', { name: '折叠寄存器 GROUP_STATUS_TEMPLATE_INST0' }))).toHaveClass('register-color-1')

    fireEvent.change(screen.getByDisplayValue('GROUP_STATUS_TEMPLATE_INST0'), {
      target: { value: 'GROUP_STATUS0' },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<register derivedFrom="GROUP_STATUS_TEMPLATE">')
  })

  it('omits unused register templates inside group templates from generated XML', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), {
      target: { value: 'UNUSED_GROUP_REGISTER_TEMPLATE' },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).not.toHaveTextContent('<name>UNUSED_GROUP_REGISTER_TEMPLATE</name>')
  })

  it('removes derived register instances inside group templates when deleting their register template', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' }))
    fireEvent.change(screen.getByLabelText('寄存器模板名称'), {
      target: { value: 'GROUP_STATUS_TEMPLATE' },
    })
    fireEvent.click(screen.getByRole('button', { name: '生成寄存器实例' }))

    expect(screen.getByDisplayValue('GROUP_STATUS_TEMPLATE_INST0')).toBeInTheDocument()

    const templateCard = closestCard(screen.getByRole('button', { name: '折叠寄存器模板 GROUP_STATUS_TEMPLATE' }))
    fireEvent.click(within(templateCard).getByRole('button', { name: '删除模板' }))

    expect(screen.queryByDisplayValue('GROUP_STATUS_TEMPLATE_INST0')).not.toBeInTheDocument()
    expect(screen.queryByText('derivedFrom：GROUP_STATUS_TEMPLATE')).not.toBeInTheDocument()
  })

  it('keeps standalone registers available inside custom groups', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.click(screen.getAllByRole('button', { name: '新增寄存器' }).at(-1) as HTMLElement)

    expect(screen.getByDisplayValue('REG1')).toBeInTheDocument()
    expect(screen.getAllByText('derivedFrom：-')).toHaveLength(2)
    expect(screen.getAllByLabelText('寄存器名称').at(-1)).toHaveValue('REG1')
  })

  it('resets the interactive configuration from the editor toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '生成实例' }))
    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'CustomDevice' } })
    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重置设置' }))

    expect(screen.getByDisplayValue('NucleiDemo')).toBeInTheDocument()
    expect(screen.getByText('6 个 IREGION 寄存器组')).toBeInTheDocument()
    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开 IREGION' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组 GROUP0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 GROUP0' }))
    expect(screen.getByText('derivedFrom：GROUP_TEMPLATE0')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('GROUP1')).not.toBeInTheDocument()
  })

  it('updates readonly IREGION groups from the IREGION base address', () => {
    render(<App />)

    expect(screen.getByLabelText('IREGION 基地址')).toHaveValue('0x18000000')
    fireEvent.change(screen.getByLabelText('IREGION 基地址'), { target: { value: '0x19000000' } })
    fireEvent.click(screen.getByRole('button', { name: '展开 IREGION' }))
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 IINFO' }))
    expect(screen.getByText('实际基地址：0x19000000')).toBeInTheDocument()
  })

  it('uses IREGION register metadata from the header files', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '展开 IREGION' }))

    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 TIMER' }))
    expect(screen.getByText('MTIMER')).toBeInTheDocument()
    expect(screen.getByText('MTIMERCMP')).toBeInTheDocument()
    expect(screen.queryByText('mtime_lo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 CIDU' }))
    expect(screen.getByText('INT_NUM')).toBeInTheDocument()
    expect(screen.queryByText('CIDU_SRW_CTRL')).not.toBeInTheDocument()
  })

  it('keeps the IREGION base address editable while the panel is collapsed', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('IREGION 基地址'), { target: { value: '0x1A000000' } })
    expect(screen.getByLabelText('IREGION 基地址')).toHaveValue('0x1A000000')

    fireEvent.click(screen.getByRole('button', { name: '展开 IREGION' }))
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 IINFO' }))
    expect(screen.getByText('实际基地址：0x1A000000')).toBeInTheDocument()
  })

  it('clears stale successful output when the configuration changes', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
    expect(await screen.findByText('转换成功')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'UpdatedDevice' } })

    expect(screen.getByText('等待转换')).toBeInTheDocument()
    expect(screen.getByText('配置已变更，请重新执行校验与转换。')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('转换成功后将在这里显示 XML 内容。')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeDisabled()
  })

  it('blocks conversion and shows readable validation errors for invalid register data', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '生成实例' }))
    fireEvent.change(screen.getByDisplayValue('GROUP_TEMPLATE0_INST1'), { target: { value: 'GROUP0' } })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('校验失败')).toBeInTheDocument()
    expect(screen.getByText('semantic.duplicate-peripheral-name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeDisabled()
  })

  it('downloads generated xml when clicking the button', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:demo')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
    fireEvent.click(await screen.findByRole('button', { name: '下载 .svd' }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    clickSpy.mockRestore()
  })
})
