// 現在のページのホスト名を取得
const hostName = window.location.hostname; // 例: "yourorg.backlog.jp"

// ストレージからorganizationIdを取得
chrome.storage.sync.get("organizationId", function (result) {
  const organizationId = result.organizationId;

  if (!organizationId) {
    console.error("Organization IDが設定されていません。");
    return;
  }

  // ホスト名がorganizationIdと一致するか確認
  if (hostName === `${organizationId}.backlog.jp`) {
    // 一致する場合、メイン関数を実行
    window.addEventListener("load", main, false);
  } else {
    // 一致しない場合、スクリプトを実行しない
    console.log("Organization IDが一致しないため、スクリプトを実行しません。");
  }
});

function main(e) {
  const jsInitCheckTimer = setInterval(jsLoaded, 1000);

  function jsLoaded() {
    if (document.querySelector('a[href^="https://"]') != null) {
      clearInterval(jsInitCheckTimer);
      // 要素を取得する処理

      const links = document.querySelectorAll('a[href^="https://"]');
      links.forEach((link) => {
        const url = link.href;

        // Slackメッセージリンクの正規表現パターン
        const slackLinkRegex =
          /https:\/\/([\w\-]+)\.slack\.com\/archives\/(\w+)\/p(\d+)/;
        const match = slackLinkRegex.exec(url);

        if (match) {
          const channelId = match[2];
          const messageTs = match[3];
          const ts = messageTs.slice(0, 10) + "." + messageTs.slice(10);

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
                console.error("メッセージの取得に失敗しました。");
              }
            }
          );
        }
      });
    }
  }
}

// メッセージを表示する関数
function displayMessage(link, data) {
  console.log(data);
  const messageDiv = document.createElement("div");
  messageDiv.innerHTML = `
    <div style="border:1px solid #ccc; padding:10px; margin-top:5px;">
        <img src="${data.userIcon}" alt="User Icon" style="width:24px; height:24px; vertical-align: middle;">
        <strong>${data.userName}</strong>
        <p>${data.message}</p>
    </div>
    `;
  // リンクの直後にメッセージを挿入
  link.parentNode.insertBefore(messageDiv, link.nextSibling);
}
