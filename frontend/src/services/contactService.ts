import { mockContacts } from '../data/mockContacts'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { PartnerContact } from '../types/contact'

export async function getPartnerContacts(partnerId?: string): Promise<PartnerContact[]> {
  if (getDataSourceMode('crm') === 'live') return unconfiguredLiveSource('crm')
  return partnerId ? mockContacts.filter((contact) => contact.partnerId === partnerId) : mockContacts
}