import { mockPartnerNotes } from '../data/mockPartnerNotes'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { PartnerNote } from '../types/partnerNote'

export async function getPartnerNotes(partnerId?: string): Promise<PartnerNote[]> {
  if (getDataSourceMode('crm') === 'live') return unconfiguredLiveSource('crm')
  return partnerId ? mockPartnerNotes.filter((note) => note.partnerId === partnerId) : mockPartnerNotes
}