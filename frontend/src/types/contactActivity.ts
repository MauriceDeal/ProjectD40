export type ContactActivityKind = 'E-mail' | 'Telefoongesprek' | 'Afspraak' | 'Event' | 'Notitie'

export interface ContactActivity {
  id: string
  partnerId: string
  contactId: string
  date: string
  title: string
  description: string
  kind?: ContactActivityKind
}