import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function openPage(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

function convertFromPreview() {
  openPage('预览')
  fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the new editor shell with sidebar navigation', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Nuclei SVD' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '寄存器模板配置' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SoC配置' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'IREGION模板' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '外设模板' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '设备基础信息' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '外设配置' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'IREGION模板' })).toBeInTheDocument()
  })

  it('switches pages from the sidebar', () => {
    render(<App />)

    for (const pageName of ['IREGION模板', '外设模板', '设备基础信息', '外设配置', '预览']) {
      openPage(pageName)
      expect(screen.getByRole('button', { name: pageName })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('heading', { level: 2, name: pageName })).toBeInTheDocument()
    }
  })

  it('edits device profile fields from the device page', () => {
    render(<App />)

    openPage('设备基础信息')
    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'CustomDevice' } })
    fireEvent.change(screen.getByLabelText('IREGION 基地址'), { target: { value: '0x19000000' } })

    expect(screen.getByLabelText('设备名称')).toHaveValue('CustomDevice')
    expect(screen.getByLabelText('IREGION 基地址')).toHaveValue('0x19000000')
    expect(screen.getByLabelText('默认寄存器位宽')).toHaveValue('32')
  })

  it('creates and edits a peripheral template', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'GPIO_TEMPLATE' } })
    fireEvent.click(screen.getByText('+'))

    expect(screen.getByDisplayValue('GPIO_TEMPLATE')).toBeInTheDocument()
    expect(screen.getByDisplayValue('REG0')).toBeInTheDocument()
  })

  it('shows resolved register size placeholders for template and standalone peripherals', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    expect(screen.getByDisplayValue('32')).toBeInTheDocument()

    fireEvent.change(screen.getAllByLabelText('寄存器位宽')[0], { target: { value: '16' } })
    fireEvent.click(screen.getByText('+'))
    expect(screen.getByPlaceholderText('16')).toBeInTheDocument()

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    expect(screen.getAllByPlaceholderText('32').length).toBeGreaterThan(0)

    fireEvent.change(screen.getAllByLabelText('寄存器位宽')[0], { target: { value: '64' } })
    fireEvent.click(screen.getAllByText('+')[0])
    expect(screen.getByPlaceholderText('64')).toBeInTheDocument()
  })

  it('creates a standalone peripheral instance from the peripheral config page', () => {
    render(<App />)

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'UART0' } })
    fireEvent.change(screen.getByLabelText('外设基地址'), { target: { value: '0x40000000' } })
    fireEvent.click(screen.getAllByText('+')[0])
    fireEvent.click(screen.getAllByText('+')[0])

    expect(screen.getByDisplayValue('UART0')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0x40000000')).toBeInTheDocument()
    expect(screen.getAllByDisplayValue('0x0').length).toBeGreaterThan(0)
    expect(screen.getAllByDisplayValue('0x4').length).toBeGreaterThan(0)
  })

  it('creates a template instance from the peripheral config page', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'GPIO_TEMPLATE' } })

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建关联实例' }))

    expect(screen.getByRole('button', { name: /外设实例 GPIO_TEMPLATE0/ })).toBeInTheDocument()
    expect(screen.getByLabelText('外设描述')).toBeDisabled()
    expect(screen.getByLabelText('寄存器位宽')).toBeDisabled()
  })

  it('removes linked instances when deleting a template', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'GPIO_TEMPLATE' } })

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建关联实例' }))
    expect(screen.getByRole('button', { name: /外设实例 GPIO_TEMPLATE0/ })).toBeInTheDocument()

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '删除模板' }))

    openPage('外设配置')
    expect(screen.queryByRole('button', { name: /外设实例 GPIO_TEMPLATE0/ })).not.toBeInTheDocument()
  })

  it('updates standalone peripheral groupName when renaming the peripheral', () => {
    render(<App />)

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'UART0' } })
    fireEvent.click(screen.getByRole('button', { name: '保存为模板' }))

    openPage('外设模板')
    expect(screen.getByRole('button', { name: /外设模板 UART0/ })).toBeInTheDocument()
  })

  it('saves standalone peripheral as template without appending an index to the template name', () => {
    render(<App />)

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'SPI' } })
    fireEvent.click(screen.getByRole('button', { name: '保存为模板' }))

    openPage('外设模板')
    expect(screen.getByRole('button', { name: /外设模板 SPI/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /外设模板 SPI\d+/ })).not.toBeInTheDocument()
  })

  it('fails to save a template when the target template name already exists', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'SPI' } })

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'SPI' } })
    fireEvent.click(screen.getByRole('button', { name: '保存为模板' }))

    expect(screen.getByText('保存模板失败')).toBeInTheDocument()
    expect(screen.getByText('模板名称 "SPI" 已存在。')).toBeInTheDocument()

    openPage('外设模板')
    expect(screen.getAllByRole('button', { name: /外设模板 SPI/ }).length).toBe(1)
  })

  it('converts the current configuration and enables download', async () => {
    render(<App />)

    convertFromPreview()

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<name>NucleiDemo</name>')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeEnabled()
  })

  it('does not emit access for user-created peripherals in generated xml', async () => {
    render(<App />)

    openPage('外设配置')
    fireEvent.click(screen.getByRole('button', { name: '创建独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'UART0' } })

    convertFromPreview()

    const xmlPreview = await screen.findByTestId('xml-preview')
    const xmlText = xmlPreview.textContent ?? ''
    expect(xmlText).toContain('<name>UART0</name>')
    const uartBlock = xmlText.split('<name>UART0</name>')[1]?.split('</peripheral>')[0] ?? ''
    expect(uartBlock).not.toContain('<access>')
  })

  it('invalidates successful output after configuration changes', async () => {
    render(<App />)

    convertFromPreview()
    expect(await screen.findByText('转换成功')).toBeInTheDocument()

    openPage('设备基础信息')
    fireEvent.change(screen.getByLabelText('设备名称'), { target: { value: 'UpdatedDevice' } })
    openPage('预览')

    expect(screen.getByText('等待转换')).toBeInTheDocument()
    expect(screen.getByText('配置已变更，请重新执行校验与转换。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeDisabled()
  })

  it('only allows enabling CIDU after both ECLIC and SMP are enabled', () => {
    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeEnabled()

    fireEvent.click(screen.getByText('ECLIC'))
    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeDisabled()
    expect(screen.getByText('需先启用 ECLIC 和 SMP')).toBeInTheDocument()

    fireEvent.click(screen.getByText('ECLIC'))
    fireEvent.click(screen.getByText('SMP'))
    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeDisabled()

    fireEvent.click(screen.getByText('SMP'))
    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeEnabled()
  })

  it('automatically clears CIDU when ECLIC or SMP is turned off', async () => {
    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeChecked()

    fireEvent.click(screen.getByText('ECLIC'))
    expect(screen.getByRole('checkbox', { name: 'CIDU' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'CIDU' })).toBeDisabled()

    convertFromPreview()
    const xmlPreview = await screen.findByTestId('xml-preview')
    expect(xmlPreview.textContent ?? '').not.toContain('<name>CIDU</name>')
  })

  it('downloads generated xml when clicking the button', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:demo')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<App />)

    convertFromPreview()
    fireEvent.click(await screen.findByRole('button', { name: '下载 .svd' }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    clickSpy.mockRestore()
  })
})
