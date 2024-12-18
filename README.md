# Slack Message Embedder for Backlog

このChrome拡張機能は、Backlog上に貼られたSlackメッセージのリンクを検出し、その内容を埋め込み表示します。これにより、Backlog上でSlackメッセージの詳細を直接確認することができます。

## 特徴

- Slackのメッセージリンクを自動的に検出し、内容を表示
- ユーザー名、アイコン、メッセージ内容を表示
- コードブロックやインラインコードの表示に対応
- Backlog内でのシームレスな情報共有を実現

## 動作環境

- Google Chrome ブラウザ
- Backlogを使用している環境

## 目次

- [Slack Message Embedder for Backlog](#slack-message-embedder-for-backlog)
  - [特徴](#特徴)
  - [動作環境](#動作環境)
  - [目次](#目次)
  - [インストール手順](#インストール手順)
    - [1. リポジトリのクローンまたはダウンロード](#1-リポジトリのクローンまたはダウンロード)
    - [2. Slackユーザートークンの発行](#2-slackユーザートークンの発行)
      - [手順](#手順)
    - [3. 拡張機能の設定](#3-拡張機能の設定)
    - [4. Chromeへの拡張機能の読み込み](#4-chromeへの拡張機能の読み込み)
  - [使い方](#使い方)
  - [注意事項](#注意事項)
  - [ライセンス](#ライセンス)

---

## インストール手順

### 1. リポジトリのクローンまたはダウンロード

まず、このリポジトリをローカル環境にクローンまたはZIPファイルとしてダウンロードしてください。

```bash
git clone https://github.com/zetton110/slack-embed-for-backlog-chrome-extention.git

```
または、GitHubページから「Code」ボタンをクリックし、「Download ZIP」でダウンロードしてください。

### 2. Slackユーザートークンの発行
拡張機能がSlack APIにアクセスするためには、ユーザートークンが必要です。以下の手順でトークンを取得してください。

注意：ユーザートークンは強力な権限を持つため、取り扱いには十分ご注意ください。

#### 手順

1. Slack APIページにアクセス  
  https://api.slack.com/ にアクセスします。
  
2. Your Appsを開く  
  右上の「Your Apps」をクリックします。

3. 新しいアプリを作成  
  「Create New App」をクリックします。

4. アプリの作成方法を選択  
  「From scratch」を選択します。

5. アプリ情報の入力
  - App Name：任意のアプリ名を入力します（例：Backlog Message Embedder）。  
  - Development Slack Workspace：アプリをインストールするワークスペースを選択します。
  - 「Create App」をクリックします。  

6. ユーザートークンスコープの設定  
   左側のメニューから「OAuth & Permissions」を選択します。
  - User Token Scopesまでスクロールします。
  - 「Add an OAuth Scope」をクリックし、以下のスコープを追加します。
    - channels:history：パブリックチャンネルのメッセージ履歴を取得
    - groups:history：プライベートチャンネルのメッセージ履歴を取得（必要な場合）
    - im:history：DMのメッセージ履歴を取得（必要な場合）
    - mpim:history：複数人DMのメッセージ履歴を取得（必要な場合）
    - users:read：ユーザー情報を取得

7. アプリをワークスペースにインストール  
   ページ上部の「Install App to Workspace」をクリックします。
   - 確認画面で「許可する」をクリックします。

8. ユーザートークンの取得
   - インストール後、「OAuth & Permissions」ページに戻り、「User OAuth Token」が表示されます
   - このトークンをコピーします。
     例：``` xoxp- ``` で始まる文字列

###  3. 拡張機能の設定
1. 拡張機能の設定画面を開く
   1. Chromeブラウザの右上にある拡張機能のアイコン（パズルピースの形）をクリックします。
   2. 表示された拡張機能の一覧から「Slack Message Embedder」を探します。
   3. 「Slack Message Embedder」を**右クリック**し、表示されたコンテキストメニューから「**オプション**」を選択します。
2. SlackトークンとOrganization IDの設定
   - Slack OAuthトークン：先ほど取得したユーザートークンを入力します。
   - Organization ID：Backlogの組織IDを入力します（例：yourcompany）。  
     **注意**：Organization IDは、BacklogのURLのサブドメイン部分です。``` https://yourcompany.backlog.jp/ ```
3. 設定の保存  
   「保存」ボタンをクリックして設定を保存します。

###  4. Chromeへの拡張機能の読み込み
1. Chromeで拡張機能管理ページを開く  
   ブラウザのアドレスバーに chrome://extensions/ と入力してアクセスします。
2. デベロッパーモードを有効にする  
   右上の「デベロッパーモード」をオンにします。
3. 拡張機能を読み込む
   - 左上の「パッケージ化されていない拡張機能を読み込む」をクリックします。
   - 拡張機能のフォルダを選択します。
4. 拡張機能の確認
   - 「Slack Link Embedder for Backlog」が拡張機能リストに表示されれば成功です。

## 使い方
1. Backlogを開く  
   ChromeでBacklogのサイト（例：https://yourcompany.backlog.jp/ ）を開きます。
2. Slackメッセージリンクを貼り付ける
   - 課題のコメントや説明欄に、Slackのメッセージリンクを貼り付けます。  
     例：``` https://yourworkspace.slack.com/archives/C01234567/p1612345678901234 ```  
3. メッセージの埋め込み表示
   - ページを表示すると、貼り付けたSlackメッセージリンクが自動的に検出され、その内容が埋め込み表示されます。
4. メッセージの内容
   - ユーザー名、アイコン、メッセージ内容、コードブロック、インラインコードなどが表示されます。
5. 動的な更新
   - ページングや新しいコメントの追加でリンクが表示された場合でも、自動的に埋め込みが行われます。

## 注意事項
- セキュリティ
  - ユーザートークンは強力な権限を持つため、第三者に漏洩しないように十分注意してください。
  - トークンはローカル環境のChromeストレージに保存されます。
- 権限設定
  - 必要なスコープのみを付与し、過剰な権限を与えないようにしてください。
- 制限事項
  - この拡張機能は、Backlogの特定の組織サイトでのみ動作します。設定したOrganization IDと一致するサイトでのみ機能します。
- サポート
  - ご不明な点や不具合がありましたら、Issuesからお知らせください。
  
## ライセンス

このプロジェクトは MIT ライセンスのもとで公開されています。

- 使用しているライブラリ：

  - **Purify ライブラリ**：Apache License 2.0 および Mozilla Public License 2.0 のもとでライセンスされています。

**ライセンスファイル：**

- [MIT ライセンス](LICENSE)
- [Apache License 2.0](LICENSE-APACHE)
- [Mozilla Public License 2.0](LICENSE-MPL)

