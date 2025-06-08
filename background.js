let latestSessionCookie = null;

chrome.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;
  if (cookie.name === "overleaf_session2") {
    latestSessionCookie = `overleaf_session2=${cookie.value}`;
    console.log(`[Cookie Interceptor] Updated cookie: ${latestSessionCookie}`);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "copy_cookie" || !latestSessionCookie) {
    if (command === "copy_cookie") console.warn("No overleaf_session2 cookie value available to copy.");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) {
      console.error("No active tab found to copy cookie.");
      return;
    }
  
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId },
      func: (cookieValue) => {
        navigator.clipboard.writeText(cookieValue)
          .then(() => {
            console.log('Cookie copied to clipboard!');
            const toast = document.createElement('div');
            toast.textContent = `✔ ${cookieValue} copied!`;
            Object.assign(toast.style, {
              position: 'fixed',
              top: '20px',
              left: '40px',
              padding: '10px 15px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '5px',
              zIndex: '2147483647',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            });
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          })
          .catch(err => console.error('Clipboard API write failed:', err));
      },
      args: [latestSessionCookie]
    });
  });
});
