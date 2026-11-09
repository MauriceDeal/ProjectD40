import { mockPartnerActions } from '../data/mockPartnerActions'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { PartnerAction } from '../types/partnerAction'

export async function getPartnerActions(partnerId?: string): Promise<PartnerAction[]> {
  if (getDataSourceMode('crm') === 'live') return unconfiguredLiveSource('crm')
  return partnerId ? mockPartnerActions.filter((action) => action.partnerId === partnerId) : mockPartnerActions
}