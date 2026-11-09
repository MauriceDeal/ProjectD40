import type { Partner } from './partner'
import type { PartnerContact } from './contact'
import type { ContactActivity } from './contactActivity'
import type { PartnerAction } from './partnerAction'
import type { PartnerDocument } from './partnerDocument'
import type { PartnerNote } from './partnerNote'
import type { Microsoft365Information } from './microsoft365Information'
import type { dealCollegaInstructions, knowledgeSourceRegistry } from '../config/dealCollegaKnowledge'

export interface PartnerKnowledge {
  partner: Partner
  contacts: PartnerContact[]
  activities: ContactActivity[]
  openActions: PartnerAction[]
  documents: PartnerDocument[]
  internalNotes: PartnerNote[]
  microsoft365Information: Microsoft365Information[]
  lastContact: string
  nextAction: string
  informationGaps: string[]
  instructions: typeof dealCollegaInstructions
  knowledgeSources: typeof knowledgeSourceRegistry
}