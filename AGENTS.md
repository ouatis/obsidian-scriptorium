# AGENTS.md

给在这台机器上干活的 AI Agent(以及偶尔失忆的人类)。

## 这是什么

Scriptorium——暖纸色的 Obsidian 阅读与写作主题,已进入官方社区主题库
(community.obsidian.md/themes/scriptorium)。个人审美之作。

**定制面哲学:** 三层定制,都不改变默认渲染:
(1) Style Settings 面板只暴露 4 个阅读控件(阅读行宽、正文行高、段落间距、
标题字体栈),需安装同名社区插件;src 顶部的 `/*! @settings` 声明必须保留,
esbuild 把它当 legal comment 带进产物,丢了面板就是空的;
(2) 按文件 cssClasses 的 helper classes(cards/row-lines/col-lines/
table-lines/row-alt/table-tabular/table-nowrap/table-fixed/
table-compact)——能力藏在笔记里;(3) 其余可调项走 token 契约,
改 token 即改主题。`src/theme.css` 除那段声明外不带注释,
`snippet-example.css` 是带注释的 token 导览。新增可调项进 token,不扩面板。

**注释纪律:** 所有代码尽量不写注释;设计取舍与出处写进 commit 信息
(如 160 KiB 预算的理由在 4754a6c),不留在代码里。

## 构建与验证

```bash
npm run lint    # stylelint 检查 src/theme.css
npm run build   # esbuild 压缩 src/theme.css → theme.css(保留 /*! @settings)
npm run check:css  # 校验声明留在产物里、其余零注释、语法可解析
npm run audit:contrast  # 解析亮/暗令牌链，校验 WCAG 对比度矩阵（失败即 exit 1）
```

CI(lint.yml)跑 lint + build + check:css + audit:contrast,并用 `git diff --exit-code theme.css`
守住**源与产物的同步**:改了 src 忘了 build,CI 直接红。

## 地图

- `src/theme.css` —— **唯一事实来源**,顶部一段 `/*! @settings` 声明(4 个控件),
  其余纯 CSS 无注释。token 契约的带注释导览见 `snippet-example.css`。
- `theme.css` —— 构建产物,随商店分发。**不要手改**。
- `manifest.json` —— name/version/minAppVersion;version 与发布标签保持
  一致(package.json 的 version 字段是它的镜像)。
- 发版流程:bump manifest/package → tag → `gh release create`(写说明);
  release-assets 工作流自动挂 theme.css + manifest.json 为 release assets
  (Obsidian 审核要求),并校验 manifest 版本 = tag。
- `img/` —— README 引用的截图与徽章资产。

## 约定

- README 三语(en / README.zh-CN.md / README.ja.md)——改动同步三份。
- 发布 = 打标签;商店更新经由 obsidianmd/obsidian-releases。
- `screenshot.png` 保持精简(压缩后再提交,~600KB 内)。

## 设计原则

主题按以下原则维护，留作后续修改时的约束：

- 保持暖色纸张配色的克制。
- 表面保持干净：纹理服务于页面，而不是与正文争夺注意力。
- 优先使用排版层级，而非厚重的界面装饰。
- 自动隐藏行为保持有限、可预测，阅读时容易忽略。
- 强调色在正文尺寸的文本中承载语义时，谨慎使用。
- callout、嵌入和浮动 UI 保持同一材质语言，但不让日常操作界面看起来像层叠卡片。
- 标签保持安静：标注正文，而不与标题、链接竞争。
- 阅读舒适优先于装饰新奇。
