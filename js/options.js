// ページがロードされたときに既存の値を読み込む
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(["slackToken", "organizationId"], (items) => {
    if (items.slackToken) {
      document.getElementById("slackToken").value = items.slackToken;
    }
    if (items.organizationId) {
      document.getElementById("organizationId").value = items.organizationId;
    }
  });
});

// 保存ボタンのクリックイベント
document.getElementById("save").addEventListener("click", function () {
  const token = document.getElementById("slackToken").value.trim();
  const organizationId = document.getElementById("organizationId").value.trim();

  // エラーチェック（必要に応じて追加）
  if (!token) {
    alert("Slackトークンを入力してください。");
    return;
  }
  if (!organizationId) {
    alert("Organization IDを入力してください。");
    return;
  }

  // 値を保存
  chrome.storage.sync.set(
    {
      slackToken: token,
      organizationId: organizationId,
    },
    function () {
      alert("設定が保存されました。");
    }
  );
});
