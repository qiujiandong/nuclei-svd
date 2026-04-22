# Nuclei SVD

> 为基于 Nuclei CPU 的 SoC 平台快速生成 CMSIS-SVD 文件。

Nuclei SVD 提供交互式寄存器配置界面，用于维护设备基础信息、IREGION 基地址、自定义寄存器组、寄存器模板和位域，并生成可下载的 `.svd` 文件。

## 如何使用

| 步骤 | 操作 |
| --- | --- |
| 1 | 展开左侧 **设备基础信息**, 设置设备名称、默认寄存器属性和 `IREGION` 基地址。 |
| 2 | 在 **寄存器组模板** 中创建可复用的寄存器组模板。 |
| 3 | 在模板或普通寄存器组中创建 **寄存器模板**, 并设置位域。 |
| 4 | 点击 **生成实例**, 从寄存器组模板或寄存器模板创建 `derivedFrom` 实例。 |
| 5 | 如不需要模板，可直接点击 **新增寄存器组** 或 **新增寄存器** 创建普通结构。 |
| 6 | 点击 **校验并转换** 生成 SVD 预览。 |
| 7 | 转换成功后点击 **下载 .svd** 保存文件。 |

## 开发命令

```bash
# install dependencies
npm install
# start dev server
npm run dev
```

```bash
# run tests
npm run test
# run linter
npm run lint
# build
npm run build
```
