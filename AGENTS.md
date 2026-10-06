# AGENTS.md

给在这台机器上干活的 AI Agent(以及偶尔失忆的人类)。

## 这是什么

Scriptorium——暖纸色的 Obsidian 阅读与写作主题,已进入官方社区主题库
(community.obsidian.md/themes/scriptorium)。个人审美之作:**刻意不支持
Style Settings 插件**——新的可调项进 token 契约,不做设置面板。

## 构建与验证

```bash
npm run lint    # stylelint 检查 src/theme.css
npm run build   # esbuild 压缩 src/theme.css → theme.css
```

CI(lint.yml)跑 lint + build,并用 `git diff --exit-code theme.css`
守住**源与产物的同步**:改了 src 忘了 build,CI 直接红。

## 地图

- `src/theme.css` —— **唯一事实来源**。文件头部有模块地图([01] Design
  Tokens 起);[01] 即 token 契约本体,`snippet-example.css` 是带注释的
  token 导览。
- `theme.css` —— 构建产物,随商店分发。**不要手改**。
- `manifest.json` —— name/version/minAppVersion;version 与发布标签保持
  一致(package.json 的 version 字段是它的镜像)。
- `img/` —— 品牌资产与横幅/封面的 HTML 生成器。

## 约定

- README 三语(en / README.zh-CN.md / README.ja.md)——改动同步三份。
- 发布 = 打标签;商店更新经由 obsidianmd/obsidian-releases。
- `screenshot.png` 保持精简(压缩后再提交,~600KB 内)。
