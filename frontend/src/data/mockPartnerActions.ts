import type { PartnerAction } from '../types/partnerAction'

export const mockPartnerActions: PartnerAction[] = [
  { id: 'a-001', partnerId: 'partner-001', title: 'Planning gebiedsverkenning bevestigen', owner: 'Maurice van Alten', dueDate: '2026-11-04', priority: 'Hoog', status: 'Open' },
  { id: 'a-002', partnerId: 'partner-002', title: 'Voorstel voor campagne bespreken', owner: 'Lieke Vermeer', dueDate: '2026-10-30', priority: 'Hoog', status: 'Open' },
  { id: 'a-003', partnerId: 'partner-002', title: 'Doelgroepkeuze intern afstemmen', owner: 'Maurice van Alten', dueDate: '2026-11-02', priority: 'Normaal', status: 'In afwachting' },
  { id: 'a-004', partnerId: 'partner-003', title: 'Terugkoppeling op gedeelde planning ophalen', owner: 'Maurice van Alten', dueDate: '2026-10-29', priority: 'Hoog', status: 'Open' },
  { id: 'a-005', partnerId: 'partner-003', title: 'Afstemming over buurtprogramma inplannen', owner: 'Nina van Dijk', dueDate: '2026-10-30', priority: 'Normaal', status: 'Open' },
  { id: 'a-006', partnerId: 'partner-004', title: 'Evaluatie voorbereiden', owner: 'Lieke Vermeer', dueDate: '2026-11-12', priority: 'Laag', status: 'Open' },
  { id: 'a-007', partnerId: 'partner-005', title: 'Locatiebezoek voorbereiden', owner: 'Samira Jansen', dueDate: '2026-11-06', priority: 'Normaal', status: 'Open' },
  { id: 'a-008', partnerId: 'partner-006', title: 'Conceptpresentatie afronden', owner: 'Samira Jansen', dueDate: '2026-11-03', priority: 'Hoog', status: 'Open' },
]