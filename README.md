# YAML to SVD

纯前端 YAML → CMSIS-SVD 转换工具，面向 SoC 软件调试人员，帮助减少手写 XML 的时间成本与寄存器地址类错误。

## 在线能力

- 默认 YAML 模板展示
- 页面内字段填写说明
- 浏览器内 YAML 语法 / schema / 语义校验
- 合法 YAML 转换为 CMSIS-SVD XML
- 长 XML 滚动预览
- 下载 `.svd` 文件
- GitHub Pages 自动部署

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址通常为 `http://localhost:5173/`。

## 测试与构建

```bash
npm run test
npm run build
npm run lint
```

## YAML 模型说明（v1）

当前版本支持高价值、常用的 CMSIS-SVD 子集：

- `device`
  - `name`
  - `version`
  - `description`
  - `addressUnitBits`
  - `width`
  - optional defaults: `size`, `access`, `resetValue`, `resetMask`
- `peripherals[]`
  - `name`
  - `description`
  - `baseAddress`
  - optional `groupName`
  - `registers[]`
- `registers[]`
  - `name`
  - `description`
  - `addressOffset`
  - optional `size`, `access`, `resetValue`, `resetMask`
  - `fields[]`
- `fields[]`
  - `name`
  - `description`
  - `bitOffset`
  - `bitWidth`
  - optional `access`

### 地址与继承规则

- `register.addressOffset` 必须相对 `peripheral.baseAddress` 填写。
- 绝对寄存器地址 = `peripheral.baseAddress + register.addressOffset`。
- `device` 层默认值会在 v1 中继承到寄存器：
  - `size`
  - `access`
  - `resetValue`
  - `resetMask`
- `field.access` 也会继承访问属性，优先级为 `field > register > device`。
- 更广义的 CMSIS-SVD 继承特性（如 `derivedFrom`）暂不支持。

### 标量格式

以下字段支持两种写法：

- YAML 数字字面量
- `0x` 前缀十六进制字符串 / 十进制字符串

适用字段：

- `baseAddress`
- `addressOffset`
- `resetValue`
- `resetMask`

## 示例模板

页面加载后会自动展示默认模板；你也可以直接参考 `src/domain/template.ts` 中的样例。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`，使用以下 GitHub Pages 官方 action：

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

部署作业要求：

- `pages: write`
- `id-token: write`
- `deploy` job 依赖 `build` job，并部署 `build` 上传的 artifact

首次启用时，请在仓库设置中将 **Pages source** 配置为 **GitHub Actions**。

## 当前非目标

- SVD → YAML 反向转换
- 可视化寄存器编辑器
- 多文件合并 / 工程管理
- 完整覆盖全部 CMSIS-SVD 边缘特性
