import { mockPartners } from '../data/mockPartners'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { Partner } from '../types/partner'

export async function getPartners(): Promise<Partner[]> {
  if (getDataSourceMode('crm') === 'live') return unconfiguredLiveSource('crm')
  return mockPartners
}