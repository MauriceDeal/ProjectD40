import type { PartnerContact } from '../types/contact'

export const mockContacts: PartnerContact[] = [
  { id: 'contact-001', partnerId: 'partner-001', name: 'Sanne de Wit', role: 'Directeur partnerships', email: 'sanne.dewit@stadshaven.example', phone: '078 555 01 40', isPrimary: true },
  { id: 'contact-002', partnerId: 'partner-002', name: 'Joris Bakker', role: 'Strategisch adviseur', email: 'joris.bakker@bureaurivier.example', phone: '078 555 02 40', isPrimary: true },
  { id: 'contact-003', partnerId: 'partner-003', name: 'Nina van Dijk', role: 'Programmamanager', email: 'nina.vandijk@dewaard.example', phone: '078 555 03 40', isPrimary: true },
  { id: 'contact-004', partnerId: 'partner-004', name: 'Farid El Amrani', role: 'Bestuursadviseur', email: 'farid.elamrani@kompas.example', phone: '078 555 04 40', isPrimary: true },
  { id: 'contact-005', partnerId: 'partner-005', name: 'Pieter van Leeuwen', role: 'Manager innovatie', email: 'pieter.vanleeuwen@noordkade.example', phone: '078 555 05 40', isPrimary: true },
  { id: 'contact-006', partnerId: 'partner-006', name: 'Eva Smit', role: 'Medeoprichter', email: 'eva.smit@ateliermerwede.example', phone: '078 555 06 40', isPrimary: true },
]