import { useEffect, useRef, useState } from 'react'
import { Bot, FileText, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react'
import { askDealCollega } from '../../services/assistantService'
import type { AssistantReply } from '../../services/mockAssistantService'
import type { Partner360Profile } from '../../types/partner'

interface ChatMessage extends AssistantReply {
  id: string
  role: 'assistant' | 'user'
}

const suggestions = [
  'Wat is de huidige stand van zaken?',
  'Wat is er recent besproken?',
  'Welke acties staan nog open?',
  'Wat is een logische volgende stap?',
  'Hoe kan ik mij voorbereiden op het volgende gesprek?',
  'Welke informatie ontbreekt nog over deze partner?',
]

interface PartnerAssistantProps {
  partner: Partner360Profile
  isOpen: boolean
  onClose: () => void
}

export function PartnerAssistant({ partner, isOpen, onClose }: PartnerAssistantProps) {
  const knowledge = {
    openActions: partner.openActions.filter((action) => action.status !== 'Afgerond'),
    documents: partner.documents,
    internalNotes: partner.internalNotes,
  }
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage(partner)])
  const [question, setQuestion] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const requestId = useRef(0)
  const feedEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isThinking])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function sendQuestion(questionText = question) {
    const text = questionText.trim()
    if (!text || isThinking) return

    const currentRequestId = ++requestId.current
    setQuestion('')
    setMessages((current) => [...current, { id: `${currentRequestId}-user`, role: 'user', text, sources: [], responseKind: 'context-answer', provenance: 'Gebruikersinvoer' }])
    setIsThinking(true)

    try {
      const reply = await askDealCollega({ partnerId: partner.id, question: text })
      if (requestId.current === currentRequestId) {
        setMessages((current) => [...current, { id: `${currentRequestId}-assistant`, role: 'assistant', ...reply }])
      }
    } catch {
      if (requestId.current === currentRequestId) {
        setMessages((current) => [...current, {
          id: `${currentRequestId}-error`,
          role: 'assistant',
          text: 'Ik kan op dit moment geen antwoord samenstellen. Probeer het zo nog eens.',
          sources: [],
          responseKind: 'instruction-only',
          provenance: 'Antwoord niet beschikbaar',
        }])
      }
    } finally {
      if (requestId.current === currentRequestId) setIsThinking(false)
    }
  }

  function chooseSuggestion(suggestion: string) {
    void sendQuestion(suggestion)
  }

  return <aside className="assistant-drawer" hidden={!isOpen} role="dialog" aria-modal="false" aria-labelledby="assistant-title">
    <header className="assistant-header">
      <div className="assistant-brand"><span className="assistant-brand-icon"><Sparkles size={17} /></span><div><h2 id="assistant-title">Deal Collega</h2><p>AI-sparringspartner <span className="assistant-demo-dot" /> Mockdata</p></div></div>
      <button className="assistant-close" type="button" aria-label="Deal Collega sluiten" onClick={onClose}><X size={18} /></button>
    </header>
    <div className="assistant-context"><span>PARTNER 360-CONTEXT</span><strong>{partner.name}</strong><small>{partner.category} · {partner.status}</small><details className="assistant-source-details"><summary><FileText size={12} />{knowledge.openActions.length} {knowledge.openActions.length === 1 ? 'actie' : 'acties'} · {knowledge.documents.length} {knowledge.documents.length === 1 ? 'document' : 'documenten'} · {knowledge.internalNotes.length} {knowledge.internalNotes.length === 1 ? 'notitie' : 'notities'}</summary><div className="assistant-source-list"><strong>Open acties</strong>{knowledge.openActions.map((action) => <p key={action.id}>{action.title}</p>)}<strong>Documenten</strong>{knowledge.documents.length ? knowledge.documents.map((document) => <p key={document.id}>{document.name}</p>) : <p>Geen documenten vastgelegd</p>}<strong>Interne notities</strong>{knowledge.internalNotes.length ? knowledge.internalNotes.map((note) => <p key={note.id}>{note.text}</p>) : <p>Geen interne notities vastgelegd</p>}</div></details></div>
    <div className="assistant-feed" aria-live="polite" aria-label="Gesprek met Deal Collega">
      {messages.map((message) => <article className={`chat-message message-${message.role}`} key={message.id}>
        <span className={`chat-avatar chat-avatar-${message.role}`}>{message.role === 'assistant' ? <Sparkles size={14} /> : <UserRound size={14} />}</span>
        <div className="chat-message-content"><div className="chat-speaker">{message.role === 'assistant' ? 'Deal Collega' : 'Jij'}</div><p>{message.text}</p>{message.sources.length > 0 && <span className="chat-source"><Bot size={11} /> Bronnen: {message.sources.join(' · ')}</span>}{message.role === 'assistant' && <span className="chat-provenance">{message.provenance}</span>}</div>
      </article>)}
      {messages.length === 1 && <div className="suggestion-area"><div className="suggestion-heading"><MessageCircle size={13} /> Vragen over {partner.name}</div><div className="suggestion-list">{suggestions.map((suggestion) => <button type="button" className="suggestion-chip" key={suggestion} onClick={() => chooseSuggestion(suggestion)} disabled={isThinking}>{suggestion}</button>)}</div></div>}
      {isThinking && <div className="chat-message message-assistant"><span className="chat-avatar chat-avatar-assistant"><Sparkles size={14} /></span><div className="chat-message-content"><div className="chat-speaker">Deal Collega</div><p className="thinking-indicator">Denkt mee <i /><i /><i /></p></div></div>}
      <div ref={feedEnd} />
    </div>
    <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void sendQuestion() }}>
      <input ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Stel een vraag over deze partner…" aria-label="Stel een vraag aan Deal Collega" disabled={isThinking} />
      <button type="submit" aria-label="Vraag versturen" title="Vraag versturen" disabled={!question.trim() || isThinking}><Send size={16} /></button>
    </form>
    <footer className="assistant-disclaimer">Alleen fictieve gegevens uit dit partnerprofiel. Geen externe koppelingen.</footer>
  </aside>
}

function welcomeMessage(partner: Partner360Profile): ChatMessage {
  return {
    id: `welcome-${partner.id}`,
    role: 'assistant',
    text: `Hoi, ik ben Deal Collega. Ik denk met je mee over ${partner.name}, op basis van de fictieve informatie in Partner 360. Waar wil je op inzoomen?`,
    sources: ['Geselecteerd partnerprofiel'],
    responseKind: 'context-answer',
    provenance: 'Geselecteerd Partner 360 mock/demo-profiel',
  }
}