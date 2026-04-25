# Slack Message Embedder for Backlog

Backlog の課題やコメントに貼られた Slack メッセージリンクを自動検出し、メッセージ内容をカード形式で埋め込み表示する Chrome 拡張機能です。Backlog と Slack を行き来することなく、課題上で直接メッセージの内容を確認できます。

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-公開中-blue?logo=googlechrome)](https://chromewebstore.google.com/detail/slack-link-embedder-for-b/egloaplennajagjbpdoajkjhhdokgnla)

## インストール

Chrome Web Store から直接インストールできます。

**[Slack Link Embedder for Backlog - Chrome Web Store](https://chromewebstore.google.com/detail/slack-link-embedder-for-b/egloaplennajagjbpdoajkjhhdokgnla)**

> インストール後の設定手順については、下記の「[セットアップ](#3-slack-ユーザートークンの発行)」セクションを参照してください。

## 特徴

- Slack メッセージリンク（`https://xxx.slack.com/archives/...`）を自動検出して内容を展開
- 投稿者のアイコン・表示名とともにメッセージ本文を表示
- Markdown 記法、コードブロック、インラインコードの表示に対応
- MutationObserver による動的検出 — ページ遷移やコメント追加にもリアルタイムで対応
- DOMPurify による HTML サニタイズで XSS を防止

## デモ

Backlog の課題コメントに Slack リンクを貼ると、以下のようにメッセージがカード表示されます。

```
https://yourworkspace.slack.com/archives/C01234567/p1612345678901234
┌──────────────────────────────────────┐
│  [icon] User Name                    │
│  メッセージの内容がここに表示されます  │
└──────────────────────────────────────┘
```

## 動作環境

- Google Chrome（Manifest V3 対応）
- Backlog（`backlog.jp` または `backlog.com`）を使用していること

## プロジェクト構成

```
slack-embed-for-backlog-chrome-extention/
├── manifest.json          # Chrome 拡張機能マニフェスト (Manifest V3)
├── js/
│   ├── contentScript.js   # Backlog ページに注入されるコンテンツスクリプト
│   ├── background.js      # Slack API 呼び出しを行う Service Worker
│   └── options.js         # 設定画面のロジック
├── lib/
│   ├── marked.min.js      # Markdown パーサー
│   └── purify.min.js      # HTML サニタイザー (DOMPurify)
├── style/
│   └── contentScript.css  # 埋め込みカードのスタイル
├── template/
│   └── options.html       # 設定画面の UI
├── icon/                  # 拡張機能アイコン (16/48/128px)
├── LICENSE                # MIT License
├── LICENSE-APACHE         # Apache License 2.0 (DOMPurify)
└── LICENSE-MPL            # Mozilla Public License 2.0 (DOMPurify)
```

## アーキテクチャ

拡張機能は3つのコンポーネントで構成されています。

**Content Script（contentScript.js）** — Backlog ページ上で動作し、MutationObserver で DOM の変更を監視します。新しく追加された要素内の Slack リンクを正規表現で検出し、`chrome.runtime.sendMessage` で Background Script にメッセージ取得をリクエストします。レスポンスを受け取ると、marked.js で Markdown を HTML に変換し、DOMPurify でサニタイズした上でカードを DOM に挿入します。

**Background Script（background.js）** — Service Worker として動作し、Content Script からのリクエストに応じて Slack Web API（`conversations.history` と `users.info`）を呼び出します。取得したメッセージ本文・ユーザー名・アイコン URL を Content Script に返します。

**Options（options.js / options.html）** — Slack ユーザートークンと Backlog の Organization ID を `chrome.storage.sync` に保存する設定画面です。

```
Backlog ページ                  Chrome Extension                Slack API
─────────────                  ───────────────                ─────────
     │                              │                            │
     │ [MutationObserver が         │                            │
     │  Slack リンクを検出]          │                            │
     │──── sendMessage ────────────>│                            │
     │                              │──── conversations.history ─>│
     │                              │<─── メッセージデータ ───────│
     │                              │──── users.info ────────────>│
     │                              │<─── ユーザー情報 ──────────│
     │<─── response ───────────────│                            │
     │                              │                            │
     │ [marked.js + DOMPurify で    │                            │
     │  カードを生成・挿入]          │                            │
```

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/zetton110/slack-embed-for-backlog-chrome-extention.git
```

または、GitHub ページから「Code」→「Download ZIP」でダウンロードしてください。

### 2. Chrome に拡張機能を読み込む

1. Chrome のアドレスバーに `chrome://extensions/` と入力してアクセスします。
2. 右上の「デベロッパーモード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」をクリックし、クローンしたフォルダを選択します。
4. 「Slack Link Embedder for Backlog」が一覧に表示されれば成功です。

### 3. Slack ユーザートークンの発行

拡張機能が Slack API にアクセスするためにユーザートークンが必要です。

> **注意**: ユーザートークンは強力な権限を持つため、取り扱いには十分ご注意ください。

1. [Slack API](https://api.slack.com/) にアクセスし、右上の「Your Apps」を開きます。
2. 「Create New App」→「From scratch」を選択します。
3. アプリ名（例: `Backlog Message Embedder`）とワークスペースを入力して作成します。
4. 左メニューの「OAuth & Permissions」を開き、**User Token Scopes** に以下を追加します。

| スコープ | 説明 | 必須 |
|---|---|---|
| `channels:history` | パブリックチャンネルのメッセージ履歴を取得 | 必須 |
| `users:read` | ユーザー情報（名前・アイコン）を取得 | 必須 |
| `groups:history` | プライベートチャンネルのメッセージ履歴を取得 | 任意 |
| `im:history` | DM のメッセージ履歴を取得 | 任意 |
| `mpim:history` | 複数人 DM のメッセージ履歴を取得 | 任意 |

5. ページ上部の「Install App to Workspace」をクリックし、権限を許可します。
6. 「User OAuth Token」（`xoxp-` で始まる文字列）をコピーします。

### 4. 拡張機能の設定

1. Chrome の拡張機能アイコンから「Slack Link Embedder for Backlog」を右クリック →「オプション」を選択します。
2. 以下を入力して「保存」をクリックします。
   - **Slack OAuth トークン**: 手順 3 で取得したトークン
   - **Organization ID**: Backlog URL のサブドメイン部分（例: `https://yourcompany.backlog.jp/` なら `yourcompany`）

## 使い方

1. Chrome で Backlog のサイト（例: `https://yourcompany.backlog.jp/`）を開きます。
2. 課題のコメントや説明欄に Slack メッセージリンクを貼り付けます。
3. ページを表示すると、リンクが自動的に検出され、メッセージ内容がカード形式で埋め込み表示されます。
4. ページ遷移やコメントの追加で新たにリンクが現れた場合も、自動的に埋め込みが行われます。

## 技術的な詳細

- **ビルド不要**: バニラ JavaScript のみで構成されており、ビルドツールやトランスパイラは不要です。
- **Manifest V3**: 最新の Chrome 拡張機能仕様に対応しています。
- **セキュリティ**: DOMPurify で全ての HTML 出力をサニタイズし、外部 CDN への依存もありません。ライブラリはすべてローカルにバンドルされています。
- **Slack リンクの検出パターン**: `https://{workspace}.slack.com/archives/{channelId}/p{timestamp}`

## 既知の制限事項

- API キャッシュ機構がないため、同じリンクでもページ表示のたびに Slack API を呼び出します。
- OAuth フローではなく手動トークン設定方式のため、トークンの有効期限管理は手動で行う必要があります。
- 設定した Organization ID と一致する Backlog サイトでのみ動作します。
- 埋め込みカードの最大幅は 600px、最大高さは 500px（スクロール対応）です。

## 注意事項

- **トークンの管理**: ユーザートークンは `chrome.storage.sync` に保存されます。第三者に漏洩しないよう十分注意してください。
- **権限の最小化**: 必要なスコープのみを付与し、過剰な権限を与えないようにしてください。
- **サポート**: 不具合やご要望がありましたら、[Issues](https://github.com/zetton110/slack-embed-for-backlog-chrome-extention/issues) からお知らせください。

## ライセンス

このプロジェクトは MIT ライセンスのもとで公開されています。

使用ライブラリの **DOMPurify** は Apache License 2.0 および Mozilla Public License 2.0 のデュアルライセンスです。

- [MIT License](LICENSE)
- [Apache License 2.0](LICENSE-APACHE)
- [Mozilla Public License 2.0](LICENSE-MPL)

