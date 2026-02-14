import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Copy, Crown } from "lucide-react"
import { Storage } from "@plasmohq/storage"

import "~style.css"

const storage = new Storage()

interface Template {
  id: string
  name: string
  subject: string
  body: string
  createdAt: string
}

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    const saved = await storage.get("email_templates") || []
    setTemplates(saved)
  }

  const saveTemplate = async () => {
    if (!name || !body) return

    const template: Template = {
      id: editing || Date.now().toString(),
      name,
      subject,
      body,
      createdAt: new Date().toISOString()
    }

    let updated
    if (editing) {
      updated = templates.map(t => t.id === editing ? template : t)
    } else {
      updated = [template, ...templates]
    }

    await storage.set("email_templates", updated)
    setTemplates(updated)
    resetForm()
  }

  const deleteTemplate = async (id: string) => {
    const updated = templates.filter(t => t.id !== id)
    await storage.set("email_templates", updated)
    setTemplates(updated)
  }

  const editTemplate = (template: Template) => {
    setEditing(template.id)
    setName(template.name)
    setSubject(template.subject)
    setBody(template.body)
  }

  const useTemplate = (template: Template) => {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`compose.html?template=${template.id}`)
    })
  }

  const resetForm = () => {
    setEditing(null)
    setName("")
    setSubject("")
    setBody("")
  }

  return (
    <div className="plasmo-min-h-screen plasmo-bg-gradient-to-br plasmo-from-purple-50 plasmo-to-pink-50 plasmo-p-6">
      <div className="plasmo-max-w-6xl plasmo-mx-auto">
        <div className="plasmo-bg-white plasmo-rounded-xl plasmo-shadow-lg plasmo-overflow-hidden plasmo-mb-6">
          <div className="plasmo-bg-gradient-to-r plasmo-from-purple-600 plasmo-to-pink-600 plasmo-px-6 plasmo-py-4 plasmo-flex plasmo-justify-between plasmo-items-center">
            <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
              <h1 className="plasmo-text-xl plasmo-font-bold plasmo-text-white">Email Templates</h1>
              <Crown className="plasmo-w-5 plasmo-h-5 plasmo-text-yellow-300" />
            </div>
            <span className="plasmo-text-xs plasmo-bg-yellow-400 plasmo-text-yellow-900 plasmo-px-2 plasmo-py-1 plasmo-rounded-full plasmo-font-semibold">
              PREMIUM
            </span>
          </div>

          <div className="plasmo-p-6 plasmo-space-y-4">
            <div>
              <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Follow-up Email"
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-purple-500 focus:plasmo-border-transparent"
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
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-purple-500 focus:plasmo-border-transparent"
              />
            </div>

            <div>
              <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your template..."
                rows={6}
                className="plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-border plasmo-border-gray-300 plasmo-rounded-lg focus:plasmo-ring-2 focus:plasmo-ring-purple-500 focus:plasmo-border-transparent plasmo-resize-none"
              />
            </div>

            <div className="plasmo-flex plasmo-gap-3">
              <button
                onClick={saveTemplate}
                className="plasmo-flex-1 plasmo-bg-purple-600 hover:plasmo-bg-purple-700 plasmo-text-white plasmo-font-medium plasmo-py-2 plasmo-px-4 plasmo-rounded-lg plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2"
              >
                <Plus className="plasmo-w-4 plasmo-h-4" />
                {editing ? "Update Template" : "Save Template"}
              </button>
              {editing && (
                <button
                  onClick={resetForm}
                  className="plasmo-px-4 plasmo-py-2 plasmo-bg-gray-200 plasmo-text-gray-700 plasmo-rounded-lg hover:plasmo-bg-gray-300 plasmo-transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="plasmo-grid plasmo-grid-cols-1 md:plasmo-grid-cols-2 plasmo-gap-4">
          {templates.length === 0 ? (
            <div className="plasmo-col-span-2 plasmo-bg-white plasmo-rounded-lg plasmo-p-12 plasmo-text-center plasmo-shadow-sm">
              <p className="plasmo-text-gray-600 plasmo-mb-2">No templates yet</p>
              <p className="plasmo-text-sm plasmo-text-gray-500">Create your first email template above</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="plasmo-bg-white plasmo-rounded-lg plasmo-p-4 plasmo-shadow-sm hover:plasmo-shadow-md plasmo-transition-shadow plasmo-border plasmo-border-gray-100"
              >
                <div className="plasmo-flex plasmo-justify-between plasmo-items-start plasmo-mb-3">
                  <div>
                    <h3 className="plasmo-font-semibold plasmo-text-gray-900 plasmo-mb-1">{template.name}</h3>
                    <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-mb-2">{template.subject}</p>
                  </div>
                </div>
                <p className="plasmo-text-sm plasmo-text-gray-700 plasmo-mb-4 plasmo-line-clamp-3">
                  {template.body}
                </p>
                <div className="plasmo-flex plasmo-gap-2">
                  <button
                    onClick={() => useTemplate(template)}
                    className="plasmo-flex-1 plasmo-bg-purple-600 hover:plasmo-bg-purple-700 plasmo-text-white plasmo-text-sm plasmo-font-medium plasmo-py-2 plasmo-px-3 plasmo-rounded-lg plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1"
                  >
                    <Copy className="plasmo-w-3.5 plasmo-h-3.5" />
                    Use
                  </button>
                  <button
                    onClick={() => editTemplate(template)}
                    className="plasmo-p-2 plasmo-bg-gray-100 hover:plasmo-bg-gray-200 plasmo-text-gray-700 plasmo-rounded-lg plasmo-transition-colors"
                  >
                    <Edit2 className="plasmo-w-4 plasmo-h-4" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="plasmo-p-2 plasmo-bg-red-50 hover:plasmo-bg-red-100 plasmo-text-red-600 plasmo-rounded-lg plasmo-transition-colors"
                  >
                    <Trash2 className="plasmo-w-4 plasmo-h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage
