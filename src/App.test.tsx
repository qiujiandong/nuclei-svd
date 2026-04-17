import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the interactive register editor on first render', () => {
    render(<App />)

    expect(screen.queryByLabelText('YAML editor')).not.toBeInTheDocument()
    expect(screen.getByText('交互式寄存器设置界面')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NucleiIREGION')).toBeInTheDocument()
    expect(screen.getByLabelText('默认 size')).toHaveValue('32')
    expect(screen.getByText('7 个 IREGION 寄存器组')).toBeInTheDocument()
    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GROUP0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开 IREGION' })).toBeInTheDocument()
    expect(screen.getByText('寄存器配置说明')).toBeInTheDocument()
  })

  it('converts the current register configuration and enables download', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<name>NucleiIREGION</name>')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeEnabled()
  })

  it('allows creating groups/registers/fields and collapsing registers', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '新增寄存器' }).at(-1) as HTMLElement)

    fireEvent.change(screen.getAllByLabelText('寄存器名称').at(-1) as HTMLElement, {
      target: { value: 'STATUS' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: '新增位域' })[1])
    expect(screen.getAllByLabelText(/位域名称 \d+/)).toHaveLength(4)

    fireEvent.click(screen.getByRole('button', { name: '折叠寄存器 STATUS' }))
    expect(screen.queryByDisplayValue('STATUS')).not.toBeInTheDocument()
  })

  it('resets the interactive configuration from the editor toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'CustomDevice' } })
    expect(screen.getByText('2 个自定义寄存器组')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重置设置' }))

    expect(screen.getByDisplayValue('NucleiIREGION')).toBeInTheDocument()
    expect(screen.getByText('7 个 IREGION 寄存器组')).toBeInTheDocument()
    expect(screen.getByText('1 个自定义寄存器组')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开 IREGION' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展开寄存器组 GROUP0' })).toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: '新增寄存器组' }))
    fireEvent.click(screen.getAllByRole('button', { name: '新增寄存器' }).at(-1) as HTMLElement)
    fireEvent.change(screen.getAllByLabelText('addressOffset').at(-1) as HTMLElement, {
      target: { value: '0x0' },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('校验失败')).toBeInTheDocument()
    expect(screen.getByText(/register absolute address/i)).toBeInTheDocument()
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
