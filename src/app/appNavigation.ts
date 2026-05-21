export type AppPageId =
  | 'iregion-template'
  | 'peripheral-template'
  | 'device-info'
  | 'peripheral-config'
  | 'preview'

export type AppNavPage = {
  id: AppPageId
  title: string
  eyebrow: string
}

export type AppNavGroup = {
  title: string
  pages: AppNavPage[]
}

export const DEFAULT_APP_PAGE: AppPageId = 'iregion-template'

export const APP_NAV_GROUPS: AppNavGroup[] = [
  {
    title: '寄存器模板配置',
    pages: [
      { id: 'iregion-template', title: 'IREGION模板', eyebrow: 'IREGION template' },
      { id: 'peripheral-template', title: '外设模板', eyebrow: 'Peripheral templates' },
    ],
  },
  {
    title: 'SoC配置',
    pages: [
      { id: 'device-info', title: '设备基础信息', eyebrow: 'Device profile' },
      { id: 'peripheral-config', title: '外设基础配置', eyebrow: 'Peripheral profile' },
      { id: 'preview', title: '预览', eyebrow: 'SVD preview' },
    ],
  },
]

export function appPageMeta(pageId: AppPageId): AppNavPage {
  return APP_NAV_GROUPS.flatMap((group) => group.pages).find((page) => page.id === pageId) ?? APP_NAV_GROUPS[0].pages[0]
}
