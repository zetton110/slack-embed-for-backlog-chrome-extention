chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "fetchSlackMessage") {
    (async () => {
      try {
        const result = await chrome.storage.sync.get("slackToken");
        const slackToken = result.slackToken;
        if (!slackToken) {
          console.error("Slack token is not set.");
          sendResponse(null);
          return;
        }

        const { channelId, ts } = request;

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
            sendResponse({
              message: message.text,
              userName: userData.user.profile.real_name || userData.user.name,
              userIcon: userData.user.profile.image_48,
            });
          } else {
            console.error("failed to get user information.", userData.error);
            sendResponse(null);
          }
        } else {
          console.error("failed to receive message.", messageData.error);
          sendResponse(null);
        }
      } catch (error) {
        console.error("An error has occurred.", error);
        sendResponse(null);
      }
    })();
    return true;
  }
});
