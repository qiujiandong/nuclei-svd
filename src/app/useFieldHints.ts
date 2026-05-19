import { useLayoutEffect } from 'react'
import tippy, { type Instance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { labelHintFor } from './fieldHints'

export function useFieldHints() {
  useLayoutEffect(() => {
    const instances: Instance[] = []
    const bindInputHints = () => {
      const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('.app-shell label'))

      labels.forEach((label) => {
        if (label.dataset.inputHint === 'true') return
        if (!label.querySelector('input, select')) return

        const content = labelHintFor(label)
        if (!content) return

        label.classList.add('has-input-hint')
        label.setAttribute('data-input-hint', 'true')
        instances.push(
          tippy(label, {
            content,
            delay: [650, 0],
            duration: [150, 100],
            placement: 'top',
            theme: 'nuclei-field',
            appendTo: () => document.body,
          }),
        )
      })
    }
    const observer = new MutationObserver(bindInputHints)
    const appShell = document.querySelector('.app-shell')

    bindInputHints()
    observer.observe(appShell ?? document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      instances.forEach((instance) => instance.destroy())
    }
  }, [])
}
