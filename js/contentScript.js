// 現在のページのホスト名を取得
const hostName = window.location.hostname; // 例: "yourorg.backlog.jp"

// ストレージからorganizationIdを取得
chrome.storage.sync.get("organizationId", function (result) {
  const organizationId = result.organizationId;

  if (!organizationId) {
    console.error("Organization ID is not set.");
    return;
  }

  // ホスト名がorganizationIdと一致するか確認
  if (hostName === `${organizationId}.backlog.jp`) {
    // 一致する場合、メイン関数を実行
    main();
  } else {
    // 一致しない場合、スクリプトを実行しない
    console.log("Organization IDs do not match.");
  }
});

function main() {
  // 既に存在するリンクを処理
  processLinks(document);

  // MutationObserverを設定
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 追加されたノード内のリンクを処理
          processLinks(node);
        }
      });
    });
  });

  // 監視の開始
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// リンクを処理する関数
function processLinks(rootElement) {
  const links = rootElement.querySelectorAll(
    'a[href^="https://"]:not(.slack-embedded)'
  );

  links.forEach((link) => {
    // 既に処理済みのリンクはスキップ
    if (link.classList.contains("slack-embedded")) {
      return;
    }

    const url = link.href;

    // Slackメッセージリンクの正規表現パターン
    const slackLinkRegex =
      /https:\/\/([\w\-]+)\.slack\.com\/archives\/(\w+)\/p(\d+)/;
    const match = slackLinkRegex.exec(url);

    if (match) {
      const channelId = match[2];
      const messageTs = match[3];
      const ts = messageTs.slice(0, 10) + "." + messageTs.slice(10);

      // リンクを処理済みにする
      link.classList.add("slack-embedded");

      // background.jsにメッセージを送信し、レスポンスを受け取る
      chrome.runtime.sendMessage(
        { action: "fetchSlackMessage", channelId, ts },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
          } else if (response && response.message) {
            // メッセージを表示する処理
            displayMessage(link, response);
          } else {
            console.error("failed to receive message.");
          }
        }
      );
    }
  });
}

// メッセージを表示する関数
function displayMessage(link, data) {
  // メッセージテキストをフォーマット
  const formattedMessage = formatSlackMessage(data.message);

  // 埋め込みコンテナの作成
  const embedContainer = document.createElement("div");
  embedContainer.classList.add("slack-embed-container");

  // **アイコン画像の追加**
  const embedIcon = document.createElement("img");
  embedIcon.src = chrome.runtime.getURL("icon/icon-128.png");
  embedIcon.alt = "Embed Icon";
  embedIcon.classList.add("slack-embed-top-right-icon");

  // **埋め込みコンテナにアイコンを追加**
  embedContainer.appendChild(embedIcon);

  // ヘッダー部分の作成
  const header = document.createElement("div");
  header.classList.add("slack-embed-header");

  const userIcon = document.createElement("img");
  userIcon.src = data.userIcon;
  userIcon.alt = data.userName;
  userIcon.classList.add("slack-embed-user-icon");

  const userName = document.createElement("span");
  userName.textContent = data.userName;
  userName.classList.add("slack-embed-user-name");

  header.appendChild(userIcon);
  header.appendChild(userName);

  // メッセージ内容の作成
  const messageContent = document.createElement("div");
  messageContent.classList.add("slack-embed-message-content");
  messageContent.innerHTML = formattedMessage; // innerHTMLを使用してフォーマット済みのメッセージを挿入

  // 埋め込みコンテナにヘッダーとメッセージを追加
  embedContainer.appendChild(header);
  embedContainer.appendChild(messageContent);

  // 埋め込みコンテナをリンクの直後に挿入
  link.parentNode.insertBefore(embedContainer, link.nextSibling);
}

// HTML特殊文字をエスケープする関数
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Slackメッセージテキストをフォーマットする関数
function formatSlackMessage(text) {
  // メッセージテキストをMarkdownからHTMLに変換
  const markdownText = text;

  // markedを使用してMarkdownをHTMLに変換
  let html = marked.parse(markdownText);

  // DOMPurifyでHTMLをサニタイズ
  html = DOMPurify.sanitize(html);

  return html;
}
