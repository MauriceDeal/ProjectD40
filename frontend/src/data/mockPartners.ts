import type { Partner } from '../types/partner'
import partnerRecords from './partnerRecords.json'

export const mockPartners: Partner[] = partnerRecords.map((record, index) => ({
  id: `csv-partner-${String(index + 1).padStart(3, '0')}`,
  name: record.name,
  category: record.partnerType,
  region: 'Niet aangeleverd',
  status: 'Onbekend',
  owner: 'Niet toegewezen',
  annualValue: 'Niet aangeleverd',
  contractEndDate: record.contractEndDate ?? undefined,
  summary: '',
}))