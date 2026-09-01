# Scriptorium 主题

一款温暖、简洁的 Obsidian 主题，面向长文阅读与写作。

[English](./README.md) | [Japanese](./README.ja.md)

<a href="https://community.obsidian.md/themes/scriptorium"><img src="img/open-in-obsidian-button.svg" alt="在 Obsidian 中打开 Scriptorium" width="150"></a>

![Scriptorium screenshot](./screenshot.png)

Scriptorium 让正文保持主位：柔和纸色、克制对比、安静的工作区界面、更平的标签与 callout，以及针对中英文混排调过的字体层级。

> [!NOTE]
> Scriptorium 是偏个人审美的主题，不以支持 `Style Settings` 插件为目标。

## 安装

1. 在 Obsidian 社区主题中搜索 `Scriptorium`。
2. 点击“安装并启用”。

手动安装：将 `theme.css` 和 `manifest.json` 放入 `.obsidian/themes/Scriptorium/`，再在“外观 -> 主题”中选择 `Scriptorium`。

## 设计

- 推荐字体：IBM Plex Sans SC（适合中英混排笔记）、IBM Plex Serif、IBM Plex Mono。
- Scriptorium 使用内置字体栈（IBM Plex 家族 + 中文字体回退），外观设置里的字体选项不会生效。
- 阅读面保持轻：纹理、阴影和强调色都刻意压低。
- 导航、搜索、菜单、标签、callout 和 embed 尽量安静，让正文居中。
- 主题以单一 `theme.css` 发布，无外部依赖。

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

由 [@ouatis](https://github.com/ouatis/) 制作。受 [Sanctum](https://github.com/jdanielmourao/obsidian-sanctum) 与 [Baseline](https://github.com/aaaaalexis/obsidian-baseline) 启发。
