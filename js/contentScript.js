const hostName = window.location.hostname; // e.g. "yourorg.backlog.jp" or "yourorg.backlog.com"

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) =>{
      if (node.nodeType === Node.ELEMENT_NODE) {
        chrome.storage.sync.get("organizationId", (result) =>{
          const organizationId = result.organizationId;
          if (!organizationId) {
            return;
          }
          if (hostName === `${organizationId}.backlog.jp` || hostName === `${organizationId}.backlog.com`) {
            processLinks(node);
          } 
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

processLinks = (rootElement) =>{

  const elements = rootElement.querySelectorAll('a[href^="https://"]:not(.slack-embedded)');

  elements.forEach((el) => {

    // skip when the link is embedded
    if (el.classList.contains("slack-embedded")) {
      return;
    }

    const slackLinkRegex = /https:\/\/([\w\-]+)\.slack\.com\/archives\/(\w+)\/p(\d+)/;
    const url = el.href;
    const match = slackLinkRegex.exec(url);

    if (match) {
      const channelId = match[2];
      const messageTs = match[3];
      const ts = messageTs.slice(0, 10) + "." + messageTs.slice(10);

      // Add processed flag to the element
      el.classList.add("slack-embedded");

      chrome.runtime.sendMessage(
        { action: "fetchSlackMessage", channelId, ts },
        (response) =>{
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
          } else if (response && response.message) {
            embedSlackCard(el, response);
          } else {
            console.error("failed to receive message.");
          }
        }
      );
    }
  });
}

embedSlackCard = (el, data) => {

  const embedContainer = document.createElement("div");
  embedContainer.classList.add("slack-embed-container");

  // Add icon to the top right of the embed container
  const embedIcon = document.createElement("img");
  embedIcon.src = chrome.runtime.getURL("icon/icon-128.png");
  embedIcon.alt = "Embed Icon";
  embedIcon.classList.add("slack-embed-top-right-icon");
  embedContainer.appendChild(embedIcon);

  // Create header
  const header = document.createElement("div");
  header.classList.add("slack-embed-header");

  // Create user icon and name to the header
  const userIcon = document.createElement("img");
  userIcon.src = data.userIcon;
  userIcon.alt = data.userName;
  userIcon.classList.add("slack-embed-user-icon");
  const userName = document.createElement("span");
  userName.textContent = data.userName;
  userName.classList.add("slack-embed-user-name");
  header.appendChild(userIcon);
  header.appendChild(userName);

  // Create message content
  const msgHtml = convertToHtml(data.message);
  const messageContent = document.createElement("div");
  messageContent.classList.add("slack-embed-message-content");
  messageContent.innerHTML = msgHtml;

  // Add header and message content to the embed container
  embedContainer.appendChild(header);
  embedContainer.appendChild(messageContent);

  // embed slack card after the link
  el.parentNode.insertBefore(embedContainer, el.nextSibling);
}


escapeHtml = (text) => {
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


convertToHtml = (text) => {
  const markdownText = text;
  let html = marked.parse(markdownText);
  html = DOMPurify.sanitize(html);
  return html;
}
