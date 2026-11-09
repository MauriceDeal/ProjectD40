import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUpRight, BarChart3, Building2, CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Download, FileUp, Plus, Search, Sparkles, Users, X } from 'lucide-react'
import { createPartner360Profile, getPartner360Profiles, registerPartner360Profile } from './services/partner360Service'
import { getSavedProfiles, saveProfile, saveProfiles } from './services/localProfileStorage'
import { readPartnerFile, type ImportedPartner } from './services/partnerImportService'
import { PartnerAssistant } from './features/partner-assistant/PartnerAssistant'
import { Partner360Workspace } from './features/partner360/Partner360Workspace'
import { getApplicationDataDescription, getApplicationDataLabel } from './config/dataSources'
import type { Partner, Partner360Profile, PartnerStatus } from './types/partner'
import type { PartnerContact } from './types/contact'
import './App.css'

const filters = ['Alle partners', 'Netwerk Partner', 'Premium Partner', 'Exclusive Partner', 'Groei Partner', 'Logo Partner'] as const
type PartnerFilter = (typeof filters)[number]

type Partner360Event = { action: 'open-assistant' }

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

function statusClass(status: PartnerStatus) {
  if (status === 'Actief') return 'active'
  if (status === 'Aandacht nodig') return 'attention'
  if (status === 'In gesprek') return 'conversation'
  return 'unknown'
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function App() {
  const [partners, setPartners] = useState<Partner360Profile[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<PartnerFilter>('Alle partners')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Zakelijke dienstverlening')
  const [newRegion, setNewRegion] = useState('Drechtsteden')
  const [newOwner, setNewOwner] = useState('Maurice van Alten')
  const [newSummary, setNewSummary] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContractEndDate, setNewContractEndDate] = useState('')
  const [newAnnualValue, setNewAnnualValue] = useState('')
  const [storageError, setStorageError] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const importInput = useRef<HTMLInputElement>(null)

  const visiblePartners = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('nl-NL')
    return partners.filter((partner) => {
      const contacts = partner.contacts.map((contact) => contact.name).join(' ')
      const matchesType = activeFilter === 'Alle partners' || partner.category === activeFilter
      const text = `${partner.name} ${partner.category} ${partner.contractEndDate ?? ''} ${contacts}`.toLocaleLowerCase('nl-NL')
      return matchesType && text.includes(term)
    })
  }, [activeFilter, partners, query])
  const selectedPartner = visiblePartners.find((partner) => partner.id === selectedId) ?? visiblePartners[0]
  const networkCount = partners.filter((partner) => partner.category === 'Netwerk Partner').length
  const premiumCount = partners.filter((partner) => partner.category === 'Premium Partner').length
  const missingContractCount = partners.filter((partner) => !partner.contractEndDate).length

  useEffect(() => {
    getPartner360Profiles()
      .then(setPartners)
      .catch((error: unknown) => {
        setLoadError(true)
        setStorageError(error instanceof Error ? error.message : 'Partnergegevens konden niet worden geladen.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    function handlePartner360Event(event: Event) {
      const detail = (event as CustomEvent<Partner360Event>).detail
      if (detail.action === 'open-assistant') setIsAssistantOpen(true)
    }

    window.addEventListener('deal-collega:partner360', handlePartner360Event)
    return () => window.removeEventListener('deal-collega:partner360', handlePartner360Event)
  }, [])

  function updateProfile(profile: Partner360Profile): boolean {
    try {
      saveProfile(profile)
      registerPartner360Profile(profile)
      setPartners((current) => current.map((item) => item.id === profile.id ? profile : item))
      setStorageError('')
      return true
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'De wijziging kon niet lokaal worden opgeslagen.')
      return false
    }
  }

  function exportPartners() {
    const rows = [['Partner', 'Partnertype', 'Contract einddatum'], ...visiblePartners.map((partner) => [partner.name, partner.category, partner.contractEndDate ? formatDate(partner.contractEndDate) : '',])]
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'deal-collega-partners.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function addPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!name || !newCategory.trim()) return
    const today = todayIsoDate()
    const id = `local-${crypto.randomUUID()}`
    const partner: Partner = {
      id, name, category: newCategory.trim(), region: newRegion.trim() || 'Niet opgegeven', status: 'In gesprek',
      owner: newOwner.trim() || 'Nog niet toegewezen', annualValue: newAnnualValue.trim() || 'Nog te bepalen',
      contractEndDate: newContractEndDate || undefined, lastUpdated: today,
      summary: newSummary.trim() || 'Geen samenvatting toegevoegd.',
    }
    const contacts: PartnerContact[] = newContactName.trim() ? [{
      id: `${id}-contact`, partnerId: id, name: newContactName.trim(), role: 'Contactpersoon',
      email: newContactEmail.trim(), phone: newContactPhone.trim(), isPrimary: true,
    }] : []
    const profile = createPartner360Profile(partner, {
      contacts,
      activities: [{ id: `${id}-activity`, partnerId: id, contactId: contacts[0]?.id ?? '', date: today, title: 'Partner toegevoegd', description: 'Toegevoegd via het partnerformulier.' }],
      openActions: [],
      documents: [],
      internalNotes: [],
      microsoft365Information: [],
    })
    if (!updateProfile(profile)) return
    setPartners((current) => [profile, ...current])
    setSelectedId(profile.id)
    setActiveFilter('Alle partners')
    setQuery('')
    setNewName('')
    setNewCategory('Zakelijke dienstverlening')
    setNewRegion('Drechtsteden')
    setNewOwner('Maurice van Alten')
    setNewSummary('')
    setNewContactName('')
    setNewContactEmail('')
    setNewContactPhone('')
    setNewContractEndDate('')
    setNewAnnualValue('')
    setIsAddOpen(false)
  }

  function createImportedProfile(item: ImportedPartner, today: string): Partner360Profile {
    const id = `import-${crypto.randomUUID()}`
    const contact = item.contactName ? {
      id: `${id}-contact`, partnerId: id, name: item.contactName, role: 'Contactpersoon',
      email: item.contactEmail, phone: item.contactPhone, isPrimary: true,
    } : undefined
    const partner: Partner = {
      id, name: item.name, category: item.category, region: item.region, status: item.status,
      owner: item.owner, annualValue: item.annualValue, contractEndDate: normalizeDate(item.contractEndDate),
      lastUpdated: today, summary: item.summary,
    }
    return createPartner360Profile(partner, {
      contacts: contact ? [contact] : [],
      activities: [],
      openActions: [],
      documents: [],
      internalNotes: [],
      microsoft365Information: [],
    })
  }

  async function importPartners(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportMessage('')
    try {
      const imported = await readPartnerFile(file)
      const today = todayIsoDate()
      const knownNames = new Set(partners.map((profile) => profile.name.trim().toLocaleLowerCase('nl-NL')))
      const additions = imported.flatMap((item) => {
        const key = item.name.trim().toLocaleLowerCase('nl-NL')
        if (knownNames.has(key)) return []
        knownNames.add(key)
        return [createImportedProfile(item, today)]
      })
      if (!additions.length) {
        setImportMessage('Geen nieuwe partners gevonden; bestaande namen zijn overgeslagen.')
        return
      }
      saveProfiles([...getSavedProfiles(), ...additions])
      additions.forEach(registerPartner360Profile)
      setPartners((current) => [...additions, ...current])
      setSelectedId(additions[0].id)
      setActiveFilter('Alle partners')
      setImportMessage(`${additions.length} partner(s) toegevoegd. Bestaande partnernamen zijn niet overschreven.`)
      setStorageError('')
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Het bestand kon niet worden geïmporteerd.')
    }
  }

  function normalizeDate(value: string): string | undefined {
    if (!value) return undefined
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const dayFirst = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
    if (dayFirst) return `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`
    return value
  }

  return <div className="app-shell">
    <aside className="side-rail" aria-label="Hoofdnavigatie">
      <a className="brand-mark" href="#partners" aria-label="Deal Collega 40"><span>DC</span><small>40</small></a><div className="rail-rule" />
      <button className="rail-button is-current" type="button" title="Partners" aria-label="Partners" onClick={() => document.getElementById('partner-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Building2 size={19} /></button><button className="rail-button" type="button" title="Relaties" aria-label="Relaties" onClick={() => document.getElementById('partner-contacts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Users size={19} /></button><button className="rail-button" type="button" title="Inzichten" aria-label="Inzichten" onClick={() => document.getElementById('partner-insights')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><BarChart3 size={19} /></button>
      <div className="rail-spacer" /><button className="rail-button" type="button" title="Hulp" aria-label="Hulp"><CircleHelp size={19} /></button><div className="user-mark" title="Maurice van Alten">MV</div>
    </aside>
    <main className="workspace" id="partners">
      <header className="topbar"><div className="breadcrumb"><span>Deal Collega #40</span><ChevronRight size={14} /><strong>Partners</strong></div><div className="topbar-actions"><span className="environment-tag" title={getApplicationDataDescription()}><i /> {getApplicationDataLabel()}</span><button className="topbar-avatar" type="button" title="Maurice van Alten">MV</button></div></header>
      <div className="page-content">
        <section className="page-heading"><div><p className="eyebrow">PARTNERRELATIES <span>•</span> DRECHTSTEDEN</p><h1>Partneroverzicht</h1><p className="heading-copy">Een helder beeld van de samenwerkingen die vooruitgaan.</p></div><div className="heading-actions"><button className="button button-secondary" type="button" onClick={exportPartners}><Download size={16} /><span>Exporteren</span></button><button className="button button-secondary" type="button" onClick={() => importInput.current?.click()}><FileUp size={16} /><span>Importeren</span></button><button className="button button-primary" type="button" onClick={() => setIsAddOpen(true)}><Plus size={17} /><span>Partner toevoegen</span></button><input ref={importInput} className="visually-hidden" type="file" accept=".csv,.xlsx" onChange={importPartners} aria-label="Partnerbestand importeren" /></div></section>
        <p className="local-storage-note">Je wijzigingen blijven lokaal in deze browser en zijn niet gedeeld met collega's. Als browsergegevens worden gewist, verdwijnen deze wijzigingen en bestanden.</p>
        <p className="import-help">Importeer CSV of Excel (.xlsx, eerste tabblad). Gebruik de kolomnaam Partner; Sector, Regio, Status, Contactpersoon, E-mail, Telefoon, Eigenaar, Jaarwaarde, Contract einddatum en Samenvatting zijn optioneel. Bestaande partnernamen worden overgeslagen.</p>
        {storageError && <p className="local-storage-alert" role="alert">{storageError}</p>}
        {importMessage && <p className="import-feedback" role="status">{importMessage}</p>}
        <section className="metrics" id="partner-insights" aria-label="Samenvatting">
          <article className="metric"><div className="metric-icon"><Building2 size={18} /></div><div><p>Totaal partners</p><strong>{partners.length}</strong></div><span className="metric-note">in overzicht</span></article><article className="metric"><div className="metric-icon metric-icon-green"><Check size={18} /></div><div><p>Netwerk Partners</p><strong>{networkCount}</strong></div><span className="metric-note">partnertype</span></article><article className="metric"><div className="metric-icon metric-icon-coral"><Clock3 size={18} /></div><div><p>Premium Partners</p><strong>{premiumCount}</strong></div><span className="metric-note">partnertype</span></article><article className="metric metric-insight"><div className="insight-spark"><CalendarDays size={17} /></div><div><p>Contractdatum ontbreekt</p><strong>{missingContractCount} partners</strong></div><span className="demo-label">BRONDATA</span></article>
        </section>
        <section className="directory-section" id="partner-overview" aria-label="Partner 360 overzicht">
          <div className="assistant-entry"><span className="assistant-entry-context"><Sparkles size={15} /> Meedenken over <strong>{selectedPartner?.name ?? 'geselecteerde partner'}</strong></span><button type="button" className="assistant-entry-button" onClick={() => setIsAssistantOpen(true)} aria-expanded={isAssistantOpen}><Sparkles size={15} /> Sparren met Deal Collega <ArrowUpRight size={14} /></button></div>
          <div className="directory-toolbar"><div className="toolbar-title"><div><h2>Partner 360</h2><p>Relaties, voortgang en contactmomenten op één plek.</p></div><span className="record-count">{visiblePartners.length} partners</span></div><div className="toolbar-controls"><label className="search-box"><Search size={16} /><input type="search" placeholder="Zoek partner of contact" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Zoek partner of contact" /><kbd>⌘ K</kbd></label><button className="filter-button" type="button" onClick={() => setActiveFilter('Alle partners')} title="Filters wissen"><ChevronDown size={15} /><span>Filter</span></button></div></div>
          <div className="filter-tabs" role="tablist" aria-label="Filter partners op type">{filters.map((filter) => <button className={activeFilter === filter ? 'filter-tab is-active' : 'filter-tab'} type="button" role="tab" aria-selected={activeFilter === filter} key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
          <div className="directory-grid"><div className="partner-list" aria-label="Partners">{isLoading ? <div className="empty-state">Partners laden…</div> : loadError ? <div className="empty-state"><strong>Partners niet beschikbaar</strong><span>Controleer de API of schakel fictieve gegevens in.</span></div> : visiblePartners.length ? visiblePartners.map((partner, index) => <button className={selectedPartner?.id === partner.id ? 'partner-row is-selected' : 'partner-row'} type="button" key={partner.id} onClick={() => setSelectedId(partner.id)} aria-pressed={selectedPartner?.id === partner.id} style={{ animationDelay: `${index * 35}ms` }}><span className={`partner-avatar avatar-${index % 6}`}>{initials(partner.name)}</span><span className="partner-row-copy"><strong>{partner.name}</strong><small>{partner.category} <i>·</i> {partner.contractEndDate ? `Eindigt ${formatDate(partner.contractEndDate)}` : 'Geen einddatum'}</small></span><span className={`status-dot status-${statusClass(partner.status)}`} title="Partnerstatus" /><ChevronRight className="row-chevron" size={15} /></button>) : <div className="empty-state"><Search size={20} /><strong>Geen partners gevonden</strong><span>Pas je zoekterm of filter aan.</span></div>}{!loadError && <button className="add-inline" type="button" onClick={() => setIsAddOpen(true)}><span><Plus size={15} /></span>Partner toevoegen</button>}</div>{selectedPartner ? <PartnerDetail partner={selectedPartner} onChange={updateProfile} /> : <div className="detail-empty">Selecteer een partner om de details te bekijken.</div>}</div>
        </section>
        <footer className="page-footer"><span><i />Bronlijst: demo · jouw invoer: lokaal opgeslagen</span><span>Deal Collega #40 <b>·</b> Partnerrelaties</span></footer>
      </div>
    </main>
    {selectedPartner && <PartnerAssistant key={selectedPartner.id} partner={selectedPartner} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />}
    {isAddOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddOpen(false) }}><form className="partner-modal partner-entry-modal" onSubmit={addPartner} aria-labelledby="modal-title"><div className="modal-heading"><div><span className="modal-icon"><Building2 size={19} /></span><div><h2 id="modal-title">Partner toevoegen</h2><p>Deze gegevens worden lokaal bewaard.</p></div></div><button className="icon-button" type="button" aria-label="Sluiten" onClick={() => setIsAddOpen(false)}><X size={18} /></button></div><div className="form-columns"><label className="form-field">Partnernaam<input autoFocus required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Bijvoorbeeld: Delta Adviesgroep" /></label><label className="form-field">Sector<input required value={newCategory} onChange={(event) => setNewCategory(event.target.value)} /></label></div><div className="form-columns"><label className="form-field">Regio<input value={newRegion} onChange={(event) => setNewRegion(event.target.value)} /></label><label className="form-field">Relatiebeheerder<input value={newOwner} onChange={(event) => setNewOwner(event.target.value)} /></label></div><div className="form-columns"><label className="form-field">Contract einddatum<input type="date" value={newContractEndDate} onChange={(event) => setNewContractEndDate(event.target.value)} /></label><label className="form-field">Jaarwaarde<input value={newAnnualValue} onChange={(event) => setNewAnnualValue(event.target.value)} placeholder="Bijvoorbeeld: € 10.000" /></label></div><label className="form-field">Contactpersoon (optioneel)<input value={newContactName} onChange={(event) => setNewContactName(event.target.value)} /></label>{newContactName && <div className="form-columns"><label className="form-field">E-mailadres<input type="email" value={newContactEmail} onChange={(event) => setNewContactEmail(event.target.value)} /></label><label className="form-field">Telefoonnummer<input value={newContactPhone} onChange={(event) => setNewContactPhone(event.target.value)} /></label></div>}<label className="form-field">Samenvatting<textarea rows={3} value={newSummary} onChange={(event) => setNewSummary(event.target.value)} placeholder="Wat is belangrijk om over deze samenwerking te weten?" /></label><div className="modal-note"><Sparkles size={15} />De partner wordt toegevoegd met de status ‘In gesprek’.</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setIsAddOpen(false)}>Annuleren</button><button className="button button-primary" type="submit"><Plus size={16} />Partner toevoegen</button></div></form></div>}
  </div>
}

function PartnerDetail({ partner, onChange }: { partner: Partner360Profile; onChange: (profile: Partner360Profile) => boolean }) {
  return <Partner360Workspace
    profile={partner}
    onChange={onChange}
    onOpenAssistant={() => window.dispatchEvent(new CustomEvent<Partner360Event>('deal-collega:partner360', { detail: { action: 'open-assistant' } }))}
  />
}

export default App
