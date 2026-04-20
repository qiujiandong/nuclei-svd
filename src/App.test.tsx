import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the interactive register editor on first render', () => {
    render(<App />)

    expect(screen.queryByLabelText('YAML editor')).not.toBeInTheDocument()
    expect(screen.getByText('寄存器设置界面')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NucleiDemo')).toBeInTheDocument()
    expect(screen.getByLabelText('默认 size')).toHaveValue('32')
    expect(screen.getByText('7 个 IREGION 寄存器组')).toBeInTheDocument()
    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组 GROUP0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组模板 GROUP_TEMPLATE0' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '展开寄存器组 GROUP0' }))
    expect(screen.getByText('derivedFrom：GROUP_TEMPLATE0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '折叠寄存器组 GROUP0' }))
    expect(screen.getByRole('button', { name: '新增寄存器组模板' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开 IREGION' })).toBeInTheDocument()
    expect(screen.getByText('寄存器配置说明')).toBeInTheDocument()
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

  it('resets the interactive configuration from the editor toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '生成实例' }))
    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'CustomDevice' } })
    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重置设置' }))

    expect(screen.getByDisplayValue('NucleiDemo')).toBeInTheDocument()
    expect(screen.getByText('7 个 IREGION 寄存器组')).toBeInTheDocument()
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
