import { useState } from "react"
import { Send, X, Loader2 } from "lucide-react"
import { Storage } from "@plasmohq/storage"

import "~style.css"

const storage = new Storage()

function ComposePage() {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [autoTrack, setAutoTrack] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const sendEmail = async () => {
    if (!to || !body) {
      setError("Recipient and message body are required")
      return
    }

    setSending(true)
    setError("")

    try {
      const apiUrl = await storage.get("api_url") || process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"
      
      const response = await fetch(`${apiUrl}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to,
          subject: subject || "(No Subject)",
          body,
          track: autoTrack
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send email")
      }

      setSuccess(true)
      setTimeout(() => {
        setTo("")
        setSubject("")
        setBody("")
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="plasmo-min-h-screen plasmo-bg-gradient-to-br plasmo-from-blue-50 plasmo-to-indigo-50 plasmo-p-6">
      <div className="plasmo-max-w-3xl plasmo-mx-auto">
        <div className="plasmo-bg-white plasmo-rounded-xl plasmo-shadow-lg plasmo-overflow-hidden">
          <div className="plasmo-bg-gradient-to-r plasmo-from-blue-600 plasmo-to-indigo-600 plasmo-px-6 plasmo-py-4 plasmo-flex plasmo-justify-between plasmo-items-center">
            <h1 className="plasmo-text-xl plasmo-font-bold plasmo-text-white">Compose Email</h1>
            <span className="plasmo-text-xs plasmo-bg-yellow-400 plasmo-text-yellow-900 plasmo-px-2 plasmo-py-1 plasmo-rounded-full plasmo-font-semibold">
              PREMIUM
            </span>
          </div>

          <div className="plasmo-p-6 plasmo-space-y-4">
            {error && (
              <div className="plasmo-bg-red-50 plasmo-border plasmo-border-red-200 plasmo-text-red-700 plasmo-px-4 plasmo-py-3 plasmo-rounded-lg plasmo-text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="plasmo-bg-green-50 plasmo-border plasmo-border-green-200 plasmo-text-green-700 plasmo-px-4 plasmo-py-3 plasmo-rounded-lg plasmo-text-sm">
                ✓ Email sent successfully!
              </div>
            )}

            <div>
              <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                To
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-border-transparent"
              />
            </div>

            <div>
              <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-border-transparent"
              />
            </div>

            <div>
              <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={10}
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-border-transparent plasmo-resize-none"
              />
            </div>

            <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-bg-blue-50 plasmo-p-3 plasmo-rounded-lg">
              <input
                type="checkbox"
                checked={autoTrack}
                onChange={(e) => setAutoTrack(e.target.checked)}
                id="track-email"
                className="plasmo-w-4 plasmo-h-4 plasmo-text-blue-600 plasmo-rounded"
              />
              <label htmlFor="track-email" className="plasmo-text-sm plasmo-text-gray-700">
                Track this email (add tracking pixel)
              </label>
            </div>

            <div className="plasmo-flex plasmo-gap-3 plasmo-pt-2">
              <button
                onClick={sendEmail}
                disabled={sending}
                className="plasmo-flex-1 plasmo-bg-blue-600 hover:plasmo-bg-blue-700 plasmo-text-white plasmo-font-medium plasmo-py-3 plasmo-px-6 plasmo-rounded-lg plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 disabled:plasmo-opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="plasmo-w-4 plasmo-h-4 plasmo-animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="plasmo-w-4 plasmo-h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="plasmo-mt-4 plasmo-text-center plasmo-text-sm plasmo-text-gray-600">
          <p>This feature requires a premium subscription</p>
        </div>
      </div>
    </div>
  )
}

export default ComposePage
