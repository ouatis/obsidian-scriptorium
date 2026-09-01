# Scriptorium

長文の読書と執筆のための、温かくミニマルな Obsidian テーマです。

[English](./README.md) | [Chinese](./README.zh-CN.md)

<a href="https://community.obsidian.md/themes/scriptorium"><img src="img/open-in-obsidian-button.svg" alt="Obsidian で Scriptorium を開く" width="150"></a>

![Scriptorium screenshot](./screenshot.png)

Scriptorium は本文を主役に保ちます。やわらかな紙の色、抑えたコントラスト、静かなワークスペースのクローム、よりフラットなタグと callout、そして CJK とラテン文字の混在ノートに合わせたタイポグラフィを備えています。

> [!NOTE]
> Scriptorium は個人的な美意識を前提にしたテーマであり、`Style Settings` プラグインの対応を目的としていません。

## インストール

1. Obsidian の Community Themes で `Scriptorium` を検索します。
2. **Install and use** をクリックします。

手動インストール: `theme.css` と `manifest.json` を `.obsidian/themes/Scriptorium/` にコピーし、Appearance -> Themes で `Scriptorium` を選択します。

## 設計

- 推奨フォント: IBM Plex Sans JP, IBM Plex Serif, IBM Plex Mono.
- Scriptorium は独自のフォントスタック（IBM Plex 系 + CJK フォールバック）を適用するため、外観設定のフォント選択は反映されません。
- ドキュメント面は軽く保つ: 画像的な質感、影、アクセント色は意図的に抑えています。
- ナビゲーション、検索、メニュー、タグ、callout、embed は静かに保ち、本文を中央に置きます。
- テーマは単一の `theme.css` として配布され、外部依存はありません。

## デザイン原則

テーマ編集時に守る指針として、以下を維持します:

- 温かい紙のパレットは抑制的に保つ。
- 面は清潔に保ち、質感はページを支え、本文と競合しない。
- 重いクロームよりもタイポグラフィの階層を優先する。
- 自動非表示の挙動は限定的で予測可能に保つ。
- 本文サイズのテキストで意味を持つアクセント色は慎重に使う。
- callout、embed、フローティング UI は同じマテリアル言語に揃えるが、日常の操作 UI を積み重なったカードのようにしない。
- タグは静かに保ち、見出しやリンクと競合させない。
- 読み心地を装飾的な新しさより優先する。

Created by [@ouatis](https://github.com/ouatis/). Inspired by [Sanctum](https://github.com/jdanielmourao/obsidian-sanctum) and [Baseline](https://github.com/aaaaalexis/obsidian-baseline).
