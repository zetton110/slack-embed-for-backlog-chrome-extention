chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "fetchSlackMessage") {
    // 非同期処理を行うので、trueを返してメッセージチャンネルを開いたままにする
    (async () => {
      try {
        // Slackトークンを取得
        const result = await chrome.storage.sync.get("slackToken");
        const slackToken = result.slackToken;
        if (!slackToken) {
          console.error("Slackトークンが設定されていません。");
          sendResponse(null);
          return;
        }

        const { channelId, ts } = request;

        // メッセージを取得
        const messageResponse = await fetch(
          `https://slack.com/api/conversations.history?channel=${channelId}&latest=${ts}&inclusive=true&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${slackToken}`,
            },
          }
        );
        const messageData = await messageResponse.json();

        if (
          messageData.ok &&
          messageData.messages &&
          messageData.messages.length > 0
        ) {
          const message = messageData.messages[0];

          // ユーザー情報を取得
          const userResponse = await fetch(
            `https://slack.com/api/users.info?user=${message.user}`,
            {
              headers: {
                Authorization: `Bearer ${slackToken}`,
              },
            }
          );
          const userData = await userResponse.json();

          if (userData.ok) {
            // 成功したので、データをsendResponseで返す
            sendResponse({
              message: message.text,
              userName: userData.user.profile.real_name || userData.user.name,
              userIcon: userData.user.profile.image_48,
            });
          } else {
            console.error("ユーザー情報の取得に失敗しました。", userData.error);
            sendResponse(null);
          }
        } else {
          console.error("メッセージの取得に失敗しました。", messageData.error);
          sendResponse(null);
        }
      } catch (error) {
        console.error("エラーが発生しました。", error);
        sendResponse(null);
      }
    })();
    return true; // 非同期応答を示すためにtrueを返す
  }
});
