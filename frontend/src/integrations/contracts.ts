import type { Partner } from '../types/partner'
import type { PartnerContact } from '../types/contact'
import type { ContactActivity } from '../types/contactActivity'
import type { PartnerAction } from '../types/partnerAction'
import type { PartnerDocument } from '../types/partnerDocument'
import type { PartnerNote } from '../types/partnerNote'
import type { Microsoft365Information } from '../types/microsoft365Information'
import type { PartnerKnowledge } from '../types/partnerKnowledge'

export interface CrmPartnerSource {
  getPartners(): Promise<Partner[]>
}

export interface CrmContactSource {
  getContacts(partnerId?: string): Promise<PartnerContact[]>
}

export interface CrmActivitySource {
  getActivities(partnerId?: string): Promise<ContactActivity[]>
}

export interface CrmActionSource {
  getActions(partnerId?: string): Promise<PartnerAction[]>
}

export interface CrmNoteSource {
  getNotes(partnerId?: string): Promise<PartnerNote[]>
}

export interface SharePointDocumentSource {
  getDocuments(partnerId?: string): Promise<PartnerDocument[]>
}

export interface Microsoft365InformationSource {
  getInformation(partnerId: string): Promise<Microsoft365Information[]>
}

export interface OutlookMessageSource {
  getPartnerMessages(partnerId: string): Promise<Microsoft365Information[]>
}

export interface OutlookEventSource {
  getPartnerEvents(partnerId: string): Promise<Microsoft365Information[]>
}

export interface TeamsMessageSource {
  getPartnerMessages(partnerId: string): Promise<Microsoft365Information[]>
}

export interface MicrosoftGraphSearchSource {
  searchPartnerInformation(partnerId: string, searchText: string): Promise<Microsoft365Information[]>
}

export interface DealCollegaAiRequest {
  partnerId: string
  question: string
  context: PartnerKnowledge
}

export interface DealCollegaAiResponse {
  text: string
  sources: string[]
}

export interface DealCollegaAiSource {
  answer(request: DealCollegaAiRequest): Promise<DealCollegaAiResponse>
}