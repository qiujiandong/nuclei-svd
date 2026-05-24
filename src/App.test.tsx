import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

function openPage(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

function convertFromPreview() {
  openPage('预览')
  fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
}

describe('App', () => {
  it('renders the new editor shell with sidebar navigation', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Nuclei SVD' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '寄存器模板配置' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SoC配置' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'IREGION模板' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '外设模板' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '设备基础信息' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '外设基础配置' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '预览' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'IREGION模板' })).toBeInTheDocument()
  })

  it('switches pages from the sidebar', () => {
    render(<App />)

    for (const pageName of ['IREGION模板', '外设模板', '设备基础信息', '外设基础配置', '预览']) {
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
    expect(screen.getByLabelText('默认 size')).toHaveValue('32')
  })

  it('creates and edits a peripheral template', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.click(screen.getByRole('button', { name: '展开外设模板 PERI0' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'GPIO_TEMPLATE' } })
    fireEvent.click(screen.getByRole('button', { name: '新增寄存器' }))

    expect(screen.getByDisplayValue('GPIO_TEMPLATE')).toBeInTheDocument()
    expect(screen.getByDisplayValue('REG1')).toBeInTheDocument()
  })

  it('creates a standalone peripheral instance from the peripheral config page', () => {
    render(<App />)

    openPage('外设基础配置')
    fireEvent.click(screen.getByRole('button', { name: '新增独立外设' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'UART0' } })
    fireEvent.change(screen.getByLabelText('baseAddress'), { target: { value: '0x40000000' } })

    expect(screen.getByDisplayValue('UART0')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0x40000000')).toBeInTheDocument()
  })

  it('creates a template instance from the peripheral config page', () => {
    render(<App />)

    openPage('外设模板')
    fireEvent.click(screen.getByRole('button', { name: '新增外设模板' }))
    fireEvent.click(screen.getByRole('button', { name: '展开外设模板 PERI0' }))
    fireEvent.change(screen.getByLabelText('外设名称'), { target: { value: 'GPIO_TEMPLATE' } })

    openPage('外设基础配置')
    fireEvent.click(screen.getByRole('button', { name: '关联实例' }))

    expect(screen.getByDisplayValue('GPIO_TEMPLATE_INST0')).toBeInTheDocument()
    expect(screen.getByText('描述、groupName、寄存器和位域均继承自模板。修改模板后，所有关联实例会同步更新。')).toBeInTheDocument()
  })

  it('converts the current configuration and enables download', async () => {
    render(<App />)

    convertFromPreview()

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<name>NucleiDemo</name>')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeEnabled()
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
