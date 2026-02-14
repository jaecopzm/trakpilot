import { useEffect, useState } from "react"
import { Mail, RefreshCw, ExternalLink, Send, Zap, Crown } from "lucide-react"

import "~style.css"

function IndexPopup() {
  const [trackedEmails, setTrackedEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    loadTrackedEmails()
    checkPremiumStatus()
  }, [])

  const loadTrackedEmails = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_TRACKED_EMAILS" })
      setTrackedEmails(response || [])
    } catch (error) {
      console.error("Failed to load tracked emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkPremiumStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "CHECK_PREMIUM" })
      setIsPremium(response?.isPremium || false)
    } catch (error) {
      console.error("Failed to check premium status:", error)
    }
  }

  const syncEmails = async () => {
    setSyncing(true)
    try {
      const response = await chrome.runtime.sendMessage({ type: "SYNC_EMAILS" })
      setTrackedEmails(response || [])
    } catch (error) {
      console.error("Failed to sync emails:", error)
    } finally {
      setSyncing(false)
    }
  }

  const openDashboard = () => {
    const apiUrl = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"
    chrome.tabs.create({ url: `${apiUrl}/dashboard` })
  }

  const openCompose = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("compose.html") })
  }

  const openTemplates = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("templates.html") })
  }

  return (
    <div className="plasmo-w-[420px] plasmo-h-[550px] plasmo-flex plasmo-flex-col plasmo-bg-gradient-to-br plasmo-from-blue-50 plasmo-to-indigo-50">
      <header className="plasmo-bg-white plasmo-shadow-sm plasmo-p-4 plasmo-border-b plasmo-border-gray-200">
        <div className="plasmo-flex plasmo-justify-between plasmo-items-center">
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <Mail className="plasmo-w-6 plasmo-h-6 plasmo-text-blue-600" />
            <h1 className="plasmo-text-xl plasmo-font-bold plasmo-text-gray-800">MailTrackr</h1>
            {isPremium && (
              <Crown className="plasmo-w-4 plasmo-h-4 plasmo-text-yellow-500" />
            )}
          </div>
          <div className="plasmo-flex plasmo-gap-2">
            <button
              onClick={syncEmails}
              disabled={syncing}
              className="plasmo-p-2 plasmo-rounded-lg hover:plasmo-bg-gray-100 plasmo-transition-colors"
              title="Sync with server"
            >
              <RefreshCw className={`plasmo-w-4 plasmo-h-4 plasmo-text-gray-600 ${syncing ? 'plasmo-animate-spin' : ''}`} />
            </button>
            <button
              onClick={openDashboard}
              className="plasmo-p-2 plasmo-rounded-lg hover:plasmo-bg-gray-100 plasmo-transition-colors"
              title="Open dashboard"
            >
              <ExternalLink className="plasmo-w-4 plasmo-h-4 plasmo-text-gray-600" />
            </button>
          </div>
        </div>

        {/* Premium Features Bar */}
        {isPremium && (
          <div className="plasmo-flex plasmo-gap-2 plasmo-mt-3">
            <button
              onClick={openCompose}
              className="plasmo-flex-1 plasmo-bg-gradient-to-r plasmo-from-blue-600 plasmo-to-indigo-600 plasmo-text-white plasmo-text-xs plasmo-font-medium plasmo-py-2 plasmo-px-3 plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1.5 hover:plasmo-opacity-90 plasmo-transition-opacity"
            >
              <Send className="plasmo-w-3.5 plasmo-h-3.5" />
              Compose
            </button>
            <button
              onClick={openTemplates}
              className="plasmo-flex-1 plasmo-bg-gradient-to-r plasmo-from-purple-600 plasmo-to-pink-600 plasmo-text-white plasmo-text-xs plasmo-font-medium plasmo-py-2 plasmo-px-3 plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1.5 hover:plasmo-opacity-90 plasmo-transition-opacity"
            >
              <Zap className="plasmo-w-3.5 plasmo-h-3.5" />
              Templates
            </button>
          </div>
        )}
      </header>

      <div className="plasmo-flex-1 plasmo-overflow-y-auto plasmo-p-4">
        <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-3">
          <h2 className="plasmo-text-sm plasmo-font-semibold plasmo-text-gray-700 plasmo-uppercase plasmo-tracking-wide">
            Tracked Emails
          </h2>
          <span className="plasmo-text-xs plasmo-text-gray-500 plasmo-bg-white plasmo-px-2 plasmo-py-1 plasmo-rounded-full">
            {trackedEmails.length} total
          </span>
        </div>

        {loading ? (
          <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-64">
            <div className="plasmo-text-center">
              <RefreshCw className="plasmo-w-8 plasmo-h-8 plasmo-text-blue-600 plasmo-animate-spin plasmo-mx-auto plasmo-mb-2" />
              <p className="plasmo-text-sm plasmo-text-gray-600">Loading...</p>
            </div>
          </div>
        ) : trackedEmails.length === 0 ? (
          <div className="plasmo-bg-white plasmo-rounded-lg plasmo-p-8 plasmo-text-center plasmo-shadow-sm">
            <Mail className="plasmo-w-12 plasmo-h-12 plasmo-text-gray-300 plasmo-mx-auto plasmo-mb-3" />
            <p className="plasmo-text-gray-600 plasmo-mb-2">No tracked emails yet</p>
            <p className="plasmo-text-xs plasmo-text-gray-500">
              Open Gmail and click the "Track" button when composing an email
            </p>
          </div>
        ) : (
          <div className="plasmo-space-y-2">
            {trackedEmails.map((email: any) => (
              <div
                key={email.id}
                className="plasmo-bg-white plasmo-rounded-lg plasmo-p-3 plasmo-shadow-sm hover:plasmo-shadow-md plasmo-transition-shadow plasmo-border plasmo-border-gray-100"
              >
                <div className="plasmo-flex plasmo-justify-between plasmo-items-start plasmo-mb-2">
                  <div className="plasmo-flex-1 plasmo-min-w-0">
                    <div className="plasmo-font-medium plasmo-text-sm plasmo-text-gray-900 plasmo-truncate plasmo-mb-1">
                      {email.subject}
                    </div>
                    <div className="plasmo-text-xs plasmo-text-gray-600 plasmo-truncate plasmo-flex plasmo-items-center plasmo-gap-1">
                      <span className="plasmo-text-gray-400">To:</span>
                      {email.recipient}
                    </div>
                  </div>
                  <div className={`plasmo-ml-2 plasmo-px-2 plasmo-py-1 plasmo-rounded-full plasmo-text-xs plasmo-font-medium plasmo-whitespace-nowrap ${
                    email.opens > 0 
                      ? 'plasmo-bg-green-100 plasmo-text-green-700' 
                      : 'plasmo-bg-gray-100 plasmo-text-gray-600'
                  }`}>
                    {email.opens} {email.opens === 1 ? 'open' : 'opens'}
                  </div>
                </div>
                <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-text-xs plasmo-text-gray-500">
                  <span>{new Date(email.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {email.lastOpened && (
                    <span className="plasmo-text-green-600">
                      Last opened {new Date(email.lastOpened).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="plasmo-bg-white plasmo-border-t plasmo-border-gray-200 plasmo-p-3">
        {!isPremium && (
          <div className="plasmo-bg-gradient-to-r plasmo-from-yellow-50 plasmo-to-orange-50 plasmo-border plasmo-border-yellow-200 plasmo-rounded-lg plasmo-p-3 plasmo-mb-2 plasmo-text-center">
            <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1 plasmo-mb-1">
              <Crown className="plasmo-w-4 plasmo-h-4 plasmo-text-yellow-600" />
              <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-yellow-900">Upgrade to Premium</span>
            </div>
            <p className="plasmo-text-xs plasmo-text-yellow-800 plasmo-mb-2">
              Send emails, use templates & more
            </p>
            <button
              onClick={openDashboard}
              className="plasmo-w-full plasmo-bg-gradient-to-r plasmo-from-yellow-400 plasmo-to-orange-400 plasmo-text-yellow-900 plasmo-font-medium plasmo-py-1.5 plasmo-px-3 plasmo-rounded-md plasmo-text-xs hover:plasmo-opacity-90 plasmo-transition-opacity"
            >
              View Plans
            </button>
          </div>
        )}
        <button
          onClick={openDashboard}
          className="plasmo-w-full plasmo-bg-blue-600 hover:plasmo-bg-blue-700 plasmo-text-white plasmo-font-medium plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-transition-colors plasmo-text-sm"
        >
          View Full Dashboard
        </button>
      </footer>
    </div>
  )
}

export default IndexPopup
