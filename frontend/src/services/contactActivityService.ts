import { mockContactActivities } from '../data/mockContactActivities'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import type { ContactActivity } from '../types/contactActivity'

export async function getContactActivities(partnerId?: string): Promise<ContactActivity[]> {
  if (getDataSourceMode('crm') === 'live') return unconfiguredLiveSource('crm')
  return partnerId ? mockContactActivities.filter((activity) => activity.partnerId === partnerId) : mockContactActivities
}