export interface PartnerAction {
  id: string
  partnerId: string
  title: string
  owner: string
  dueDate: string
  priority: 'Laag' | 'Normaal' | 'Hoog'
  status: 'Open' | 'In afwachting' | 'Afgerond'
}