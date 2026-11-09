import { mockPartnerDocuments } from '../data/mockPartnerDocuments'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { PartnerDocument } from '../types/partnerDocument'

export async function getPartnerDocuments(partnerId?: string): Promise<PartnerDocument[]> {
  if (getDataSourceMode('sharepoint') === 'live') return unconfiguredLiveSource('sharepoint')
  return partnerId ? mockPartnerDocuments.filter((document) => document.partnerId === partnerId) : mockPartnerDocuments
}