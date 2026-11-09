import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUpRight, CalendarDays, Check, CheckCircle2, FileText, Mail, MessageSquareText, Pencil, Phone, Plus, Sparkles, Trash2, UserRound, Upload, X } from 'lucide-react'
import { createPartner360Profile, type Partner360Parts } from '../../services/partner360Service'
import { deleteLocalFile, getLocalFile, saveLocalFile } from '../../services/localFileStorage'
import type { ContactActivity, ContactActivityKind } from '../../types/contactActivity'
import type { Partner, Partner360Profile, PartnerStatus } from '../../types/partner'
import type { PartnerAction } from '../../types/partnerAction'
import type { PartnerNote } from '../../types/partnerNote'
import type { PartnerDocument } from '../../types/partnerDocument'
import './Partner360Workspace.css'

interface Props {
  profile: Partner360Profile
  onChange: (profile: Partner360Profile) => boolean
  onOpenAssistant: () => void
}

type ActionDraft = Omit<PartnerAction, 'id' | 'partnerId'> & { id?: string }
type ActivityDraft = Pick<ContactActivity, 'kind' | 'title' | 'date' | 'contactId' | 'description'>
type NoteDraft = Pick<PartnerNote, 'author' | 'text'>
type PartnerDraft = Pick<Partner, 'name' | 'category' | 'region' | 'status' | 'owner' | 'annualValue' | 'contractEndDate' | 'summary'>

const activityKinds: ContactActivityKind[] = ['E-mail', 'Telefoongesprek', 'Afspraak', 'Event', 'Notitie']
const partnerStatuses: PartnerStatus[] = ['Actief', 'In gesprek', 'Aandacht nodig', 'Onbekend']
const categories = [
  { kinds: ['Document'], label: 'Documenten', icon: FileText },
  { kinds: ['Communicatie', 'E-mail'], label: 'Relevante communicatie', icon: Mail },
  { kinds: ['Afspraak', 'Agenda'], label: 'Afspraken en contactmomenten', icon: CalendarDays },
  { kinds: ['Overig'], label: 'Overige beschikbare context', icon: MessageSquareText },
]

function displayDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function parts(profile: Partner360Profile): Partner360Parts {
  return {
    contacts: profile.contacts,
    activities: profile.activities,
    openActions: profile.openActions,
    documents: profile.documents,
    internalNotes: profile.internalNotes,
    microsoft365Information: profile.microsoft365Information,
  }
}

function Partner360Workspace({ profile, onChange, onOpenAssistant }: Props) {
  const [actionDraft, setActionDraft] = useState<ActionDraft | null>(null)
  const [activityDraft, setActivityDraft] = useState<ActivityDraft | null>(null)
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null)
  const [partnerDraft, setPartnerDraft] = useState<PartnerDraft | null>(null)
  const [isDocumentOpen, setIsDocumentOpen] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentSummary, setDocumentSummary] = useState('')
  const [documentError, setDocumentError] = useState('')
  const uploadInput = useRef<HTMLInputElement>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const activeActions = profile.openActions.filter((action) => action.status !== 'Afgerond')
  const completedActions = profile.openActions.filter((action) => action.status === 'Afgerond')
  const activities = [...profile.activities].sort((a, b) => b.date.localeCompare(a.date))

  function update(patch: Partial<Partner360Parts>): boolean {
    return onChange(createPartner360Profile(profile, { ...parts(profile), ...patch }))
  }

  function savePartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!partnerDraft) return
    const updated = createPartner360Profile({ ...profile, ...partnerDraft }, parts(profile))
    if (onChange(updated)) setPartnerDraft(null)
  }

  function saveAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!actionDraft) return
    const saved: PartnerAction = {
      ...actionDraft,
      id: actionDraft.id ?? `demo-action-${Date.now()}`,
      partnerId: profile.id,
      title: actionDraft.title.trim(),
      owner: actionDraft.owner.trim(),
    }
    const savedSuccessfully = update({ openActions: actionDraft.id
      ? profile.openActions.map((action) => action.id === saved.id ? saved : action)
      : [...profile.openActions, saved] })
    if (savedSuccessfully) setActionDraft(null)
  }

  function saveActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activityDraft) return
    const saved: ContactActivity = {
      ...activityDraft,
      id: `demo-activity-${Date.now()}`,
      partnerId: profile.id,
      title: activityDraft.title.trim(),
      description: activityDraft.description.trim(),
    }
    if (update({ activities: [saved, ...profile.activities] })) setActivityDraft(null)
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!noteDraft) return
    const note: PartnerNote = {
      id: `local-note-${crypto.randomUUID()}`,
      partnerId: profile.id,
      date: new Date().toISOString().slice(0, 10),
      author: noteDraft.author.trim() || 'Onbekend',
      text: noteDraft.text.trim(),
    }
    if (update({ internalNotes: [note, ...profile.internalNotes] })) setNoteDraft(null)
  }

  function selectDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setDocumentFile(file)
    setDocumentError('')
    event.target.value = ''
    setIsDocumentOpen(true)
  }

  async function saveDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!documentFile) return
    const id = `local-file-${crypto.randomUUID()}`
    const document: PartnerDocument = {
      id,
      partnerId: profile.id,
      name: documentFile.name,
      kind: documentFile.type || 'Bestand',
      updatedAt: new Date().toISOString().slice(0, 10),
      summary: documentSummary.trim() || 'Bestand lokaal opgeslagen; de inhoud is niet automatisch uitgelezen.',
      storageId: id,
      mimeType: documentFile.type,
      sizeBytes: documentFile.size,
    }
    setDocumentError('')
    try {
      await saveLocalFile(id, documentFile)
      if (!update({ documents: [document, ...profile.documents] })) {
        await deleteLocalFile(id)
        setDocumentError('De bestandsverwijzing kon niet worden opgeslagen. Probeer het opnieuw.')
        return
      }
      setDocumentFile(null)
      setDocumentSummary('')
      setIsDocumentOpen(false)
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Het bestand kon niet lokaal worden opgeslagen.')
    }
  }

  async function downloadDocument(document: PartnerDocument) {
    if (!document.storageId) return
    setDocumentError('')
    try {
      const file = await getLocalFile(document.storageId)
      if (!file) throw new Error('Dit bestand is niet meer beschikbaar in de lokale browseropslag.')
      const link = window.document.createElement('a')
      const url = URL.createObjectURL(file)
      link.href = url
      link.download = document.name
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Het bestand kon niet worden geopend.')
    }
  }

  function formatFileSize(bytes?: number): string {
    if (bytes === undefined) return ''
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function toggleComplete(action: PartnerAction) {
    update({ openActions: profile.openActions.map((item) => item.id === action.id
      ? { ...item, status: item.status === 'Afgerond' ? 'Open' : 'Afgerond' }
      : item) })
  }

  return <article className="partner-detail partner-workspace">
    <section className="workspace-section profile-section" aria-labelledby="partner-profile-heading">
      <div className="detail-topline"><span>PARTNERPROFIEL</span><button className="text-action" type="button" onClick={() => setPartnerDraft({ name: profile.name, category: profile.category, region: profile.region, status: profile.status, owner: profile.owner, annualValue: profile.annualValue, contractEndDate: profile.contractEndDate ?? '', summary: profile.summary })}><Pencil size={13} />Gegevens bewerken</button></div>
      <div className="detail-identity"><div className="detail-avatar">{profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><div className="identity-copy"><h3 id="partner-profile-heading">{profile.name}</h3><span>{profile.category} · {profile.region}</span></div><span className={`status-pill ${profile.status === 'Actief' ? 'pill-active' : profile.status === 'In gesprek' ? 'pill-conversation' : profile.status === 'Aandacht nodig' ? 'pill-attention' : 'pill-unknown'}`}>{profile.status}</span></div>
      <dl className="profile-facts"><div><dt>Partnertype</dt><dd>{profile.category}</dd></div><div><dt>Contract eindigt</dt><dd>{profile.contractEndDate ? displayDate(profile.contractEndDate) : 'Niet opgegeven'}</dd></div><div><dt>Relatiebeheerder</dt><dd>{profile.owner}</dd></div><div><dt>Jaarwaarde</dt><dd>{profile.annualValue}</dd></div></dl>
      <p className="data-boundary-note">{profile.summary}</p>
    </section>

    <section className="workspace-section" id="partner-contacts" aria-labelledby="contacts-heading">
      <SectionHeading kicker="RELATIES" title="Contactpersonen" count={profile.contacts.length} />
      {profile.contacts.length ? <div className="contact-list">{profile.contacts.map((contact) => <div className="contact-card" key={contact.id}><span className="contact-avatar">{contact.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div className="contact-card-main"><strong>{contact.name}{contact.isPrimary && <span className="primary-label">Primair</span>}</strong><small>{contact.role}</small><div className="contact-links">{contact.email && <a href={`mailto:${contact.email}`}><Mail size={12} />{contact.email}</a>}{contact.phone && <span><Phone size={12} />{contact.phone}</span>}</div></div></div>)}</div> : <EmptyState>Geen contactpersonen aangeleverd.</EmptyState>}
    </section>

    <section className="workspace-section" aria-labelledby="activities-heading">
      <div className="workspace-section-heading"><div><span className="section-kicker">TIJDLIJN</span><h4 id="activities-heading">Recente contactmomenten</h4></div><button className="icon-command" type="button" title="Contactmoment toevoegen" aria-label="Contactmoment toevoegen" onClick={() => setActivityDraft({ kind: 'E-mail', title: '', date: new Date().toISOString().slice(0, 10), contactId: profile.contacts[0]?.id ?? '', description: '' })}><Plus size={16} /></button></div>
      {activities.length ? <ol className="timeline-list">{activities.map((activity) => <li className="timeline-item" key={activity.id}><span className="timeline-icon">{activity.kind === 'E-mail' ? <Mail size={14} /> : activity.kind === 'Telefoongesprek' ? <Phone size={14} /> : activity.kind === 'Afspraak' || activity.kind === 'Event' ? <CalendarDays size={14} /> : <MessageSquareText size={14} />}</span><div><div className="timeline-meta"><span>{activity.kind ?? 'Contactmoment'}</span><time>{displayDate(activity.date)}</time></div><strong>{activity.title}</strong><p>{activity.description}</p></div></li>)}</ol> : <EmptyState>Nog geen contactmomenten vastgelegd.</EmptyState>}
    </section>

    <section className="workspace-section" aria-labelledby="actions-heading">
      <div className="workspace-section-heading"><div><span className="section-kicker">OPVOLGING</span><h4 id="actions-heading">Openstaande acties <span className="section-count">{activeActions.length}</span></h4></div><button className="button button-secondary compact-button" type="button" onClick={() => setActionDraft({ title: '', owner: '', dueDate: new Date().toISOString().slice(0, 10), priority: 'Normaal', status: 'Open' })}><Plus size={14} />Actie toevoegen</button></div>
      {activeActions.length ? <div className="action-list">{[...activeActions].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((action) => <ActionRow key={action.id} action={action} onToggle={toggleComplete} onEdit={() => setActionDraft({ ...action })} onDelete={() => update({ openActions: profile.openActions.filter((item) => item.id !== action.id) })} />)}</div> : <EmptyState>Geen openstaande acties.</EmptyState>}
      {completedActions.length > 0 && <div className="completed-actions"><button className="text-action" type="button" onClick={() => setShowCompleted((shown) => !shown)}><CheckCircle2 size={14} />{showCompleted ? 'Afgeronde acties verbergen' : `${completedActions.length} afgeronde actie(s) tonen`}</button>{showCompleted && <div className="action-list">{completedActions.map((action) => <ActionRow key={action.id} action={action} onToggle={toggleComplete} onEdit={() => setActionDraft({ ...action })} onDelete={() => update({ openActions: profile.openActions.filter((item) => item.id !== action.id) })} />)}</div>}</div>}
    </section>

    <section className="next-step workspace-next-step" aria-label="Volgende stap"><div className="next-step-icon"><ArrowUpRight size={17} /></div><div><span>VOLGENDE STAP</span><strong>{profile.nextAction}</strong></div></section>

    <section className="workspace-section" aria-labelledby="documents-heading"><div className="workspace-section-heading"><div><span className="section-kicker">BESTANDEN</span><h4 id="documents-heading">Documenten <span className="section-count">{profile.documents.length}</span></h4></div><button className="button button-secondary compact-button" type="button" onClick={() => uploadInput.current?.click()}><Upload size={14} />Bestand toevoegen</button><input ref={uploadInput} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={selectDocument} aria-label="Document kiezen" /></div>{documentError && <p className="local-storage-alert" role="alert">{documentError}</p>}{profile.documents.length ? <div className="resource-list">{profile.documents.map((document) => <article className="resource-row" key={document.id}><span className="resource-icon"><FileText size={16} /></span><div><button className="document-download" type="button" disabled={!document.storageId} onClick={() => downloadDocument(document)}>{document.name}</button><span>{document.kind} · {displayDate(document.updatedAt)}{document.sizeBytes !== undefined && ` · ${formatFileSize(document.sizeBytes)}`}</span><p>{document.summary}</p></div>{document.storageId ? <span className="local-chip">LOKAAL</span> : <span className="demo-chip">DEMO</span>}</article>)}</div> : <EmptyState>Voeg een bestand toe om deze partnerinformatie lokaal te bewaren.</EmptyState>}</section>

    <section className="workspace-section" aria-labelledby="notes-heading"><div className="workspace-section-heading"><div><span className="section-kicker">INTERN</span><h4 id="notes-heading">Interne notities <span className="section-count">{profile.internalNotes.length}</span></h4></div><button className="icon-command" type="button" title="Notitie toevoegen" aria-label="Notitie toevoegen" onClick={() => setNoteDraft({ author: 'Maurice van Alten', text: '' })}><Plus size={16} /></button></div>{profile.internalNotes.length ? <div className="notes-list">{profile.internalNotes.map((note) => <article className="note-row" key={note.id}><p>{note.text}</p><span>{note.author} · {displayDate(note.date)}</span></article>)}</div> : <EmptyState>Leg hier een interne notitie vast.</EmptyState>}</section>

    <section className="workspace-section microsoft-section" aria-labelledby="microsoft-heading"><div className="workspace-section-heading"><div><span className="section-kicker">TOEKOMSTIGE CONTEXT</span><h4 id="microsoft-heading">Microsoft 365: Demo</h4></div><span className="demo-chip">GEEN VERBINDING</span></div><p className="microsoft-intro">Hier kan later alleen toegestane broninformatie verschijnen. Dit overzicht maakt geen Microsoft 365-verbinding.</p><div className="microsoft-category-list">{categories.map((category) => { const Icon = category.icon; const items = profile.microsoft365Information.filter((item) => category.kinds.includes(item.kind)); return <div className="microsoft-category" key={category.label}><span className="resource-icon"><Icon size={15} /></span><div><strong>{category.label}</strong>{items.length ? items.map((item) => <p key={item.id}>{item.title} · {item.summary}</p>) : <p>Nog geen demo-informatie beschikbaar</p>}</div><span className="demo-chip">DEMO</span></div> })}</div></section>

    <section className="workspace-section assistant-prompt-section" aria-labelledby="assistant-section-heading"><span className="assistant-prompt-icon"><Sparkles size={18} /></span><div className="assistant-prompt-copy"><span className="section-kicker">MOCKCONTEXT</span><h4 id="assistant-section-heading">Deal Collega AI-sparringspartner</h4><p>Gebruikt dit profiel, contactpersonen, contactmomenten, acties, documenten, notities en Microsoft 365-demo-informatie.</p><small>Antwoorden zijn gebaseerd op fictieve/mockinformatie.</small></div><button className="button button-primary compact-button" type="button" onClick={onOpenAssistant}><Sparkles size={14} />Open sparringpartner</button></section>

    {actionDraft && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActionDraft(null) }}><form className="partner-modal workspace-modal" onSubmit={saveAction} aria-labelledby="action-modal-title"><ModalHeading id="action-modal-title" title={actionDraft.id ? 'Actie wijzigen' : 'Actie toevoegen'} onClose={() => setActionDraft(null)} /><p className="modal-subtitle">Acties worden lokaal bewaard.</p><label className="form-field">Titel<input required autoFocus value={actionDraft.title} onChange={(event) => setActionDraft({ ...actionDraft, title: event.target.value })} /></label><label className="form-field">Verantwoordelijke<input required value={actionDraft.owner} onChange={(event) => setActionDraft({ ...actionDraft, owner: event.target.value })} /></label><label className="form-field">Deadline<input required type="date" value={actionDraft.dueDate} onChange={(event) => setActionDraft({ ...actionDraft, dueDate: event.target.value })} /></label><div className="form-columns"><label className="form-field">Prioriteit<select value={actionDraft.priority} onChange={(event) => setActionDraft({ ...actionDraft, priority: event.target.value as PartnerAction['priority'] })}><option>Laag</option><option>Normaal</option><option>Hoog</option></select></label><label className="form-field">Status<select value={actionDraft.status} onChange={(event) => setActionDraft({ ...actionDraft, status: event.target.value as PartnerAction['status'] })}><option>Open</option><option>In afwachting</option><option>Afgerond</option></select></label></div><ModalActions onCancel={() => setActionDraft(null)} label={actionDraft.id ? 'Opslaan' : 'Toevoegen'} /></form></div>}

    {activityDraft && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivityDraft(null) }}><form className="partner-modal workspace-modal" onSubmit={saveActivity} aria-labelledby="activity-modal-title"><ModalHeading id="activity-modal-title" title="Contactmoment toevoegen" onClose={() => setActivityDraft(null)} /><p className="modal-subtitle">Contactmomenten worden lokaal bewaard.</p><label className="form-field">Type<select value={activityDraft.kind} onChange={(event) => setActivityDraft({ ...activityDraft, kind: event.target.value as ContactActivityKind })}>{activityKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label><label className="form-field">Titel<input required autoFocus value={activityDraft.title} onChange={(event) => setActivityDraft({ ...activityDraft, title: event.target.value })} /></label><div className="form-columns"><label className="form-field">Datum<input required type="date" value={activityDraft.date} onChange={(event) => setActivityDraft({ ...activityDraft, date: event.target.value })} /></label><label className="form-field">Contactpersoon<select value={activityDraft.contactId} onChange={(event) => setActivityDraft({ ...activityDraft, contactId: event.target.value })}><option value="">Geen koppeling</option>{profile.contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></label></div><label className="form-field">Samenvatting<textarea required rows={3} value={activityDraft.description} onChange={(event) => setActivityDraft({ ...activityDraft, description: event.target.value })} /></label><ModalActions onCancel={() => setActivityDraft(null)} label="Toevoegen" /></form></div>}

    {noteDraft && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoteDraft(null) }}><form className="partner-modal workspace-modal" onSubmit={saveNote} aria-labelledby="note-modal-title"><ModalHeading id="note-modal-title" title="Interne notitie toevoegen" onClose={() => setNoteDraft(null)} /><label className="form-field">Auteur<input required value={noteDraft.author} onChange={(event) => setNoteDraft({ ...noteDraft, author: event.target.value })} /></label><label className="form-field">Notitie<textarea required autoFocus rows={5} value={noteDraft.text} onChange={(event) => setNoteDraft({ ...noteDraft, text: event.target.value })} /></label><ModalActions onCancel={() => setNoteDraft(null)} label="Notitie opslaan" /></form></div>}

    {partnerDraft && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPartnerDraft(null) }}><form className="partner-modal workspace-modal" onSubmit={savePartner} aria-labelledby="partner-modal-title"><ModalHeading id="partner-modal-title" title="Partnergegevens bewerken" onClose={() => setPartnerDraft(null)} /><div className="form-columns"><label className="form-field">Partnernaam<input required autoFocus value={partnerDraft.name} onChange={(event) => setPartnerDraft({ ...partnerDraft, name: event.target.value })} /></label><label className="form-field">Sector<input required value={partnerDraft.category} onChange={(event) => setPartnerDraft({ ...partnerDraft, category: event.target.value })} /></label></div><div className="form-columns"><label className="form-field">Regio<input value={partnerDraft.region} onChange={(event) => setPartnerDraft({ ...partnerDraft, region: event.target.value })} /></label><label className="form-field">Status<select value={partnerDraft.status} onChange={(event) => setPartnerDraft({ ...partnerDraft, status: event.target.value as PartnerStatus })}>{partnerStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><div className="form-columns"><label className="form-field">Relatiebeheerder<input value={partnerDraft.owner} onChange={(event) => setPartnerDraft({ ...partnerDraft, owner: event.target.value })} /></label><label className="form-field">Jaarwaarde<input value={partnerDraft.annualValue} onChange={(event) => setPartnerDraft({ ...partnerDraft, annualValue: event.target.value })} /></label></div><label className="form-field">Contract einddatum<input type="date" value={partnerDraft.contractEndDate ?? ''} onChange={(event) => setPartnerDraft({ ...partnerDraft, contractEndDate: event.target.value })} /></label><label className="form-field">Samenvatting<textarea rows={4} value={partnerDraft.summary} onChange={(event) => setPartnerDraft({ ...partnerDraft, summary: event.target.value })} /></label><ModalActions onCancel={() => setPartnerDraft(null)} label="Gegevens opslaan" /></form></div>}

    {isDocumentOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsDocumentOpen(false) }}><form className="partner-modal workspace-modal" onSubmit={saveDocument} aria-labelledby="document-modal-title"><ModalHeading id="document-modal-title" title="Document toevoegen" onClose={() => setIsDocumentOpen(false)} /><p className="modal-subtitle">Bestanden blijven op deze computer/browser. De inhoud wordt niet automatisch uitgelezen.</p>{documentFile && <p className="selected-file-name">{documentFile.name} · {formatFileSize(documentFile.size)}</p>}<label className="form-field">Toelichting (optioneel)<textarea rows={3} value={documentSummary} onChange={(event) => setDocumentSummary(event.target.value)} placeholder="Waar gaat dit document over?" /></label>{documentError && <p className="local-storage-alert" role="alert">{documentError}</p>}<ModalActions onCancel={() => setIsDocumentOpen(false)} label="Bestand opslaan" /></form></div>}
  </article>
}

function SectionHeading({ kicker, title, count }: { kicker: string; title: string; count: number }) {
  return <div className="workspace-section-heading"><div><span className="section-kicker">{kicker}</span><h4>{title}</h4></div><span className="section-count">{count}</span></div>
}

function EmptyState({ children }: { children: string }) {
  return <p className="section-empty">{children}</p>
}

function ActionRow({ action, onToggle, onEdit, onDelete }: { action: PartnerAction; onToggle: (action: PartnerAction) => void; onEdit: () => void; onDelete: () => void }) {
  const complete = action.status === 'Afgerond'
  return <div className={`action-row${complete ? ' action-row-completed' : ''}`}><button className={`action-complete${complete ? ' is-complete' : ''}`} type="button" title={complete ? 'Heropen actie' : 'Markeer als afgerond'} aria-label={`${complete ? 'Heropen' : 'Markeer als afgerond'}: ${action.title}`} onClick={() => onToggle(action)}><Check size={14} /></button><div className="action-main"><strong>{action.title}</strong><div><span><UserRound size={11} />{action.owner}</span><span>{displayDate(action.dueDate)}</span></div></div><span className={`priority-label priority-${action.priority.toLocaleLowerCase('nl-NL')}`}>{action.priority}</span><span className={`action-status ${complete ? 'status-completed' : action.status === 'Open' ? 'status-open' : 'status-waiting'}`}>{action.status}</span><button className="icon-command subtle-command" type="button" title="Actie wijzigen" aria-label={`Wijzig ${action.title}`} onClick={onEdit}><Pencil size={14} /></button><button className="icon-command subtle-command danger-command" type="button" title="Actie verwijderen" aria-label={`Verwijder ${action.title}`} onClick={onDelete}><Trash2 size={14} /></button></div>
}

function ModalHeading({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  return <div className="modal-heading"><div><span className="modal-icon"><CheckCircle2 size={19} /></span><div><h2 id={id}>{title}</h2></div></div><button className="icon-button" type="button" aria-label="Sluiten" onClick={onClose}><X size={18} /></button></div>
}

function ModalActions({ onCancel, label }: { onCancel: () => void; label: string }) {
  return <div className="modal-actions"><button className="button button-secondary" type="button" onClick={onCancel}>Annuleren</button><button className="button button-primary" type="submit"><Check size={15} />{label}</button></div>
}

export { Partner360Workspace }