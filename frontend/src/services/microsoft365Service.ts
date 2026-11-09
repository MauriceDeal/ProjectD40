import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'
import { mockMicrosoft365Information } from '../data/mockMicrosoft365Information'
import type { Microsoft365Information } from '../types/microsoft365Information'

export async function getMicrosoft365Information(partnerId?: string): Promise<Microsoft365Information[]> {
  if (getDataSourceMode('microsoft365') === 'live') return unconfiguredLiveSource('microsoft365')
  return partnerId
    ? mockMicrosoft365Information.filter((item) => item.partnerId === partnerId)
    : mockMicrosoft365Information
}