export type DataSourceMode = 'mock' | 'live'
export type DataSourceId = 'crm' | 'sharepoint' | 'microsoft365' | 'dealCollegaAi'

export interface DataSourceSetting {
  mode: DataSourceMode
  label: string
}

export const dataSources: Record<DataSourceId, DataSourceSetting> = {
  crm: { mode: 'mock', label: 'CRM' },
  sharepoint: { mode: 'mock', label: 'SharePoint' },
  microsoft365: { mode: 'mock', label: 'Microsoft 365' },
  dealCollegaAi: { mode: 'mock', label: 'Deal Collega AI' },
}

export function getDataSourceMode(source: DataSourceId): DataSourceMode {
  return dataSources[source].mode
}

export function getDataSourceLabel(source: DataSourceId): string {
  return dataSources[source].label
}

export function getApplicationDataLabel(): string {
  return getDataSourceMode('crm') === 'mock' ? 'CRM: Demo' : 'CRM: Live niet aangesloten'
}

export function getApplicationDataDescription(): string {
  return Object.entries(dataSources)
    .map(([, setting]) => `${setting.label}: ${setting.mode === 'mock' ? 'Mock/Demo' : 'Live geselecteerd, adapter ontbreekt'}`)
    .join(' · ')
}