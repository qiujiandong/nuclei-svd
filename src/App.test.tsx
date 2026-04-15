import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

const loadFixture = (name: string) => readFileSync(join(process.cwd(), 'fixtures', name), 'utf8')

describe('App', () => {
  it('shows the template and field guide on first render', () => {
    render(<App />)

    expect((screen.getByLabelText('YAML editor') as HTMLTextAreaElement).value).toContain('device:')
    expect(screen.getByText('填写说明')).toBeInTheDocument()
    expect(screen.getByText('device')).toBeInTheDocument()
  })

  it('converts valid YAML and enables download', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('YAML editor'), { target: { value: loadFixture('valid-minimal.yaml') } })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('转换成功')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('<device')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeEnabled()
  })

  it('clears stale successful output when the YAML changes', async () => {
    render(<App />)

    const editor = screen.getByLabelText('YAML editor')
    fireEvent.change(editor, { target: { value: loadFixture('valid-minimal.yaml') } })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
    expect(await screen.findByText('转换成功')).toBeInTheDocument()

    fireEvent.change(editor, { target: { value: loadFixture('invalid-duplicate-address.yaml') } })

    expect(screen.getByText('等待转换')).toBeInTheDocument()
    expect(screen.getByText('输入已变更，请重新执行校验与转换。')).toBeInTheDocument()
    expect(screen.getByTestId('xml-preview')).toHaveTextContent('转换成功后将在这里显示 XML 内容。')
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeDisabled()
  })

  it('blocks conversion and shows readable validation errors for invalid YAML', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('YAML editor'), {
      target: { value: loadFixture('invalid-duplicate-address.yaml') },
    })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))

    expect(await screen.findByText('校验失败')).toBeInTheDocument()
    expect(screen.getByText(/register absolute address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下载 .svd' })).toBeDisabled()
  })

  it('loads a YAML file from upload input', async () => {
    render(<App />)

    const file = new File([loadFixture('valid-minimal.yaml')], 'sample.yaml', { type: 'text/yaml' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText(/已加载 sample.yaml/)).toBeInTheDocument()
    })
  })

  it('downloads generated xml when clicking the button', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:demo')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<App />)

    fireEvent.change(screen.getByLabelText('YAML editor'), { target: { value: loadFixture('valid-minimal.yaml') } })
    fireEvent.click(screen.getByRole('button', { name: '校验并转换' }))
    fireEvent.click(await screen.findByRole('button', { name: '下载 .svd' }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    clickSpy.mockRestore()
  })
})
