import type { ContactActivity } from './contactActivity'
import type { PartnerAction } from './partnerAction'
import type { PartnerContact } from './contact'
import type { PartnerDocument } from './partnerDocument'
import type { PartnerNote } from './partnerNote'
import type { Microsoft365Information } from './microsoft365Information'

export type PartnerStatus = 'Actief' | 'In gesprek' | 'Aandacht nodig' | 'Onbekend'

export interface Partner {
  id: string
  name: string
  category: string
  region: string
  status: PartnerStatus
  owner: string
  annualValue: string
  contractEndDate?: string
  lastUpdated?: string
  summary: string
}

export interface Partner360Profile extends Partner {
  contacts: PartnerContact[]
  activities: ContactActivity[]
  openActions: PartnerAction[]
  documents: PartnerDocument[]
  internalNotes: PartnerNote[]
  microsoft365Information: Microsoft365Information[]
  lastContact: string
  nextAction: string
}
