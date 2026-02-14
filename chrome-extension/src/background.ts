import { Storage } from "@plasmohq/storage"

const storage = new Storage()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CREATE_TRACKER") {
    handleCreateTracker(request.data)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }
  
  if (request.type === "GET_TRACKED_EMAILS") {
    getTrackedEmails()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }

  if (request.type === "SYNC_EMAILS") {
    syncEmailsFromServer()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }

  if (request.type === "CHECK_PREMIUM") {
    checkPremiumStatus()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }
})

async function handleCreateTracker(data: { recipient: string; subject: string }) {
  const apiUrl = await storage.get("api_url") || process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"
  
  const response = await fetch(`${apiUrl}/api/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create tracker")
  }
  
  const result = await response.json()
  
  // Store locally
  const tracked = await storage.get("tracked_emails") || []
  tracked.unshift({
    id: result.id,
    recipient: data.recipient,
    subject: data.subject,
    sentAt: new Date().toISOString(),
    opens: 0
  })
  await storage.set("tracked_emails", tracked.slice(0, 100))
  
  return result
}

async function getTrackedEmails() {
  return await storage.get("tracked_emails") || []
}

async function syncEmailsFromServer() {
  const apiUrl = await storage.get("api_url") || process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"
  
  const response = await fetch(`${apiUrl}/api/emails`, {
    method: "GET",
    credentials: "include"
  })
  
  if (!response.ok) throw new Error("Failed to sync emails")
  
  const emails = await response.json()
  
  // Transform server data to local format
  const tracked = emails.map((email: any) => ({
    id: email.id,
    recipient: email.recipient,
    subject: email.subject,
    sentAt: new Date(email.created_at).toISOString(),
    opens: email.open_count || 0,
    lastOpened: email.opened_at ? new Date(email.opened_at).toISOString() : null
  }))
  
  await storage.set("tracked_emails", tracked)
  return tracked
}

async function checkPremiumStatus() {
  const apiUrl = await storage.get("api_url") || process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"
  
  try {
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: "GET",
      credentials: "include"
    })
    
    if (!response.ok) return { isPremium: false }
    
    const settings = await response.json()
    return { isPremium: settings.is_premium || false }
  } catch (error) {
    return { isPremium: false }
  }
}
