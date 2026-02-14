import { Storage } from "@plasmohq/storage"
import { useEffect, useState } from "react"
import { Save, Check, ExternalLink } from "lucide-react"

import "~style.css"

const storage = new Storage()

function OptionsPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000")
  const [autoTrack, setAutoTrack] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const url = await storage.get("api_url")
    const auto = await storage.get("auto_track")
    if (url) setApiUrl(url)
    if (auto !== undefined) setAutoTrack(auto)
    setLoading(false)
  }

  const saveSettings = async () => {
    await storage.set("api_url", apiUrl)
    await storage.set("auto_track", autoTrack)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const openDashboard = () => {
    window.open(`${apiUrl}/dashboard`, '_blank')
  }

  const openAuth = () => {
    window.open(`${apiUrl}/sign-in`, '_blank')
  }

  if (loading) {
    return (
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-min-h-screen plasmo-bg-gray-50">
        <div className="plasmo-text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="plasmo-min-h-screen plasmo-bg-gradient-to-br plasmo-from-blue-50 plasmo-to-indigo-50 plasmo-py-12 plasmo-px-4">
      <div className="plasmo-max-w-3xl plasmo-mx-auto">
        <div className="plasmo-bg-white plasmo-rounded-xl plasmo-shadow-lg plasmo-overflow-hidden">
          <div className="plasmo-bg-gradient-to-r plasmo-from-blue-600 plasmo-to-indigo-600 plasmo-px-8 plasmo-py-6">
            <h1 className="plasmo-text-3xl plasmo-font-bold plasmo-text-white plasmo-mb-2">MailTrackr Settings</h1>
            <p className="plasmo-text-blue-100">Configure your email tracking preferences</p>
          </div>

          <div className="plasmo-p-8 plasmo-space-y-8">
            {/* Authentication Section */}
            <div className="plasmo-border-b plasmo-pb-6">
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-900 plasmo-mb-4">Authentication</h2>
              <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-mb-4">
                Sign in to sync your tracked emails across devices and access advanced features.
              </p>
              <div className="plasmo-flex plasmo-gap-3">
                <button
                  onClick={openAuth}
                  className="plasmo-px-4 plasmo-py-2 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded-lg hover:plasmo-bg-blue-700 plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-gap-2"
                >
                  <ExternalLink className="plasmo-w-4 plasmo-h-4" />
                  Sign In / Sign Up
                </button>
                <button
                  onClick={openDashboard}
                  className="plasmo-px-4 plasmo-py-2 plasmo-bg-gray-100 plasmo-text-gray-700 plasmo-rounded-lg hover:plasmo-bg-gray-200 plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-gap-2"
                >
                  <ExternalLink className="plasmo-w-4 plasmo-h-4" />
                  Open Dashboard
                </button>
              </div>
            </div>

            {/* API Configuration */}
            <div className="plasmo-border-b plasmo-pb-6">
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-900 plasmo-mb-4">API Configuration</h2>
              <div>
                <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-border-transparent plasmo-transition-all"
                  placeholder="http://localhost:3000"
                />
                <p className="plasmo-text-xs plasmo-text-gray-500 plasmo-mt-2">
                  The URL of your MailTrackr server. Use localhost for development.
                </p>
              </div>
            </div>

            {/* Tracking Preferences */}
            <div className="plasmo-border-b plasmo-pb-6">
              <h2 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-900 plasmo-mb-4">Tracking Preferences</h2>
              <div className="plasmo-flex plasmo-items-start plasmo-gap-3">
                <input
                  type="checkbox"
                  checked={autoTrack}
                  onChange={(e) => setAutoTrack(e.target.checked)}
                  id="auto-track"
                  className="plasmo-mt-1 plasmo-w-4 plasmo-h-4 plasmo-text-blue-600 plasmo-rounded focus:plasmo-ring-2 focus:plasmo-ring-blue-500"
                />
                <div>
                  <label htmlFor="auto-track" className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-900 plasmo-cursor-pointer">
                    Enable tracking by default for all emails
                  </label>
                  <p className="plasmo-text-xs plasmo-text-gray-500 plasmo-mt-1">
                    When enabled, the tracking button will be automatically turned on for new compose windows.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="plasmo-flex plasmo-justify-end">
              <button
                onClick={saveSettings}
                disabled={saved}
                className={`plasmo-px-6 plasmo-py-2.5 plasmo-rounded-lg plasmo-font-medium plasmo-transition-all plasmo-flex plasmo-items-center plasmo-gap-2 ${
                  saved
                    ? 'plasmo-bg-green-600 plasmo-text-white'
                    : 'plasmo-bg-blue-600 plasmo-text-white hover:plasmo-bg-blue-700'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="plasmo-w-4 plasmo-h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="plasmo-w-4 plasmo-h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="plasmo-mt-6 plasmo-bg-blue-50 plasmo-border plasmo-border-blue-200 plasmo-rounded-lg plasmo-p-4">
          <h3 className="plasmo-text-sm plasmo-font-semibold plasmo-text-blue-900 plasmo-mb-2">How to use MailTrackr</h3>
          <ol className="plasmo-text-sm plasmo-text-blue-800 plasmo-space-y-1 plasmo-list-decimal plasmo-list-inside">
            <li>Sign in using the button above</li>
            <li>Open Gmail and compose a new email</li>
            <li>Click the "Track Email" button in the compose window</li>
            <li>Send your email - a tracking pixel will be automatically inserted</li>
            <li>View opens and analytics in the extension popup or dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
