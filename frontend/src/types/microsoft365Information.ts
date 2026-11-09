export interface Microsoft365Information {
  id: string
  partnerId: string
  kind: 'Document' | 'Communicatie' | 'Afspraak' | 'Overig' | 'Agenda' | 'E-mail'
  date: string
  title: string
  summary: string
}