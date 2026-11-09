import { getPartners } from './partnerService'
import { getPartnerContacts } from './contactService'
import { getContactActivities } from './contactActivityService'
import { getPartnerActions } from './partnerActionService'
import { getPartnerDocuments } from './partnerDocumentService'
import { getPartnerNotes } from './partnerNoteService'
import { getMicrosoft365Information } from './microsoft365Service'
import type { Partner, Partner360Profile } from '../types/partner'
import type { PartnerContact } from '../types/contact'
import type { ContactActivity } from '../types/contactActivity'
import type { PartnerAction } from '../types/partnerAction'
import type { PartnerDocument } from '../types/partnerDocument'
import type { PartnerNote } from '../types/partnerNote'
import type { Microsoft365Information } from '../types/microsoft365Information'
import { getSavedProfiles } from './localProfileStorage'

export interface Partner360Parts {
  contacts: PartnerContact[]
  activities: ContactActivity[]
  openActions: PartnerAction[]
  documents: PartnerDocument[]
  internalNotes: PartnerNote[]
  microsoft365Information: Microsoft365Information[]
}

const emptyParts: Partner360Parts = { contacts: [], activities: [], openActions: [], documents: [], internalNotes: [], microsoft365Information: [] }
const profileCache = new Map<string, Partner360Profile>()

export function createPartner360Profile(partner: Partner, parts: Partner360Parts = emptyParts): Partner360Profile {
  const firstAction = parts.openActions
    .filter((action) => action.status !== 'Afgerond')
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))[0]
  const actionDate = firstAction?.dueDate
    ? new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(`${firstAction.dueDate}T12:00:00`))
    : ''

  return {
    ...partner,
    ...parts,
    lastContact: parts.activities[0]?.date ?? '',
    nextAction: firstAction ? `${firstAction.title}${actionDate ? ` · ${actionDate}` : ''}` : 'Nog geen volgende stap gepland',
  }
}

export function registerPartner360Profile(profile: Partner360Profile): void {
  profileCache.set(profile.id, profile)
}

export async function getPartner360Profiles(): Promise<Partner360Profile[]> {
  const [partners, contacts, activities, openActions, documents, internalNotes, microsoft365Information] = await Promise.all([
    getPartners(),
    getPartnerContacts(),
    getContactActivities(),
    getPartnerActions(),
    getPartnerDocuments(),
    getPartnerNotes(),
    getMicrosoft365Information(),
  ])

  const savedProfiles = getSavedProfiles()
  const savedById = new Map(savedProfiles.map((profile) => [profile.id, profile]))
  const defaultProfiles = partners.map((partner) => createPartner360Profile(partner, {
    contacts: contacts.filter((contact) => contact.partnerId === partner.id),
    activities: activities.filter((activity) => activity.partnerId === partner.id).sort((a, b) => b.date.localeCompare(a.date)),
    openActions: openActions.filter((action) => action.partnerId === partner.id),
    documents: documents.filter((document) => document.partnerId === partner.id),
    internalNotes: internalNotes.filter((note) => note.partnerId === partner.id),
    microsoft365Information: microsoft365Information.filter((item) => item.partnerId === partner.id),
  }))
  const defaultIds = new Set(defaultProfiles.map((profile) => profile.id))
  const profiles = [
    ...defaultProfiles.map((profile) => savedById.get(profile.id) ?? profile),
    ...savedProfiles.filter((profile) => !defaultIds.has(profile.id)),
  ]

  profiles.forEach(registerPartner360Profile)
  return profiles
}

export async function getPartner360Profile(partnerId: string): Promise<Partner360Profile | undefined> {
  const cachedProfile = profileCache.get(partnerId)
  if (cachedProfile) return cachedProfile

  const profiles = await getPartner360Profiles()
  return profiles.find((profile) => profile.id === partnerId)
}