import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const config: PlasmoCSConfig = {
  matches: ["https://mail.google.com/*"]
}

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16
  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })
  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText
  return styleElement
}

const GmailOverlay = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const composeWindows = document.querySelectorAll('div[role="dialog"]')
      composeWindows.forEach((compose) => {
        if (!compose.getAttribute('data-mailtrackr-injected')) {
          injectControls(compose as HTMLElement)
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  const injectControls = (compose: HTMLElement) => {
    // Mark as injected
    compose.setAttribute('data-mailtrackr-injected', 'true')

    // Find the toolbar. 
    // Common selector for the toolbar row at the bottom: tr.btC or equivalent structure
    // We look for the "Send" button and go up/sibling
    // The Send button usually has role="button" and text "Send" or data-tooltip like "Send (Ctrl-Enter)"

    // Strategy: Find the toolbar container by looking for the formatting toolbar or send button row
    // method: search for 'tr.btC' (formatting row) or similar
    const toolbar = compose.querySelector('tr.btC') || compose.querySelector('.btC')

    if (toolbar) {
      // Create a container for our button
      const btnContainer = document.createElement('td')
      btnContainer.className = "mailtrackr-container"
      // Insert before the send button or at the end of the toolbar
      toolbar.appendChild(btnContainer)

      const root = createRoot(btnContainer)
      root.render(<TrackButton composeWindow={compose} />)
    }
  }

  return null
}

const TrackButton = ({ composeWindow }: { composeWindow: HTMLElement }) => {
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Check if auto-track is enabled
    storage.get("auto_track").then((autoTrack) => {
      if (autoTrack) setEnabled(true)
    })
  }, [])

  useEffect(() => {
    if (!enabled) return

    const sendBtn = composeWindow.querySelector('div[role="button"][aria-label*="Send"]') as HTMLElement
    if (!sendBtn) return

    const handleSend = async (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setStatus('loading')

      try {
        const recipient = extractRecipient(composeWindow)
        const subject = extractSubject(composeWindow)

        if (!recipient || recipient === "Unknown") {
          throw new Error("Please add a recipient")
        }

        const response = await chrome.runtime.sendMessage({
          type: "CREATE_TRACKER",
          data: { recipient, subject }
        })

        if (response.error) throw new Error(response.error)

        const messageBody = composeWindow.querySelector('div[aria-label="Message Body"]') as HTMLElement
        if (messageBody) {
          const pixel = document.createElement('img')
          pixel.src = response.tracking_url
          pixel.width = 1
          pixel.height = 1
          pixel.style.display = 'none'
          pixel.alt = ''
          messageBody.appendChild(pixel)
        }

        setStatus('success')
        setTimeout(() => {
          sendBtn.removeEventListener('click', handleSend, true)
          sendBtn.click()
        }, 200)
      } catch (err) {
        console.error("Tracking failed", err)
        setStatus('error')
        setTimeout(() => {
          sendBtn.removeEventListener('click', handleSend, true)
          sendBtn.click()
        }, 1000)
      }
    }

    sendBtn.addEventListener('click', handleSend, true)
    return () => sendBtn.removeEventListener('click', handleSend, true)
  }, [enabled, composeWindow])

  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`plasmo-mr-2 plasmo-cursor-pointer plasmo-px-3 plasmo-py-1.5 plasmo-rounded-md plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-font-medium plasmo-text-sm plasmo-transition-all plasmo-select-none
                ${enabled 
                  ? 'plasmo-bg-blue-600 plasmo-text-white plasmo-shadow-sm' 
                  : 'plasmo-bg-gray-100 plasmo-text-gray-700 hover:plasmo-bg-gray-200'
                }
                ${status === 'loading' ? 'plasmo-opacity-75' : ''}
                ${status === 'success' ? 'plasmo-bg-green-600' : ''}
                ${status === 'error' ? 'plasmo-bg-red-600' : ''}`}
      title={enabled ? "Tracking enabled - will track when sent" : "Click to enable email tracking"}
    >
      <div className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full plasmo-transition-colors
        ${enabled ? 'plasmo-bg-white' : 'plasmo-bg-gray-400'}
        ${status === 'loading' ? 'plasmo-animate-pulse' : ''}`} 
      />
      {status === 'loading' ? 'Tracking...' : 
       status === 'success' ? '✓ Tracked!' : 
       status === 'error' ? 'Error (sending anyway)' :
       enabled ? 'Tracking ON' : 'Track Email'}
    </div>
  )
}

function extractRecipient(compose: HTMLElement): string {
  const toField = compose.querySelector('div[name="to"]')
  if (!toField) return "Unknown"
  
  const emailSpan = toField.querySelector('span[email]')
  if (emailSpan) return emailSpan.getAttribute('email') || "Unknown"
  
  const input = toField.querySelector('input')
  return input?.value || "Unknown"
}

function extractSubject(compose: HTMLElement): string {
  const subjectInput = compose.querySelector('input[name="subjectbox"]') as HTMLInputElement
  return subjectInput?.value || "(No Subject)"
}

export default GmailOverlay
