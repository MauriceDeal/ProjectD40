import type { PartnerDocument } from '../types/partnerDocument'

export const mockPartnerDocuments: PartnerDocument[] = [
  { id: 'd-001', partnerId: 'partner-001', name: 'Samenwerkingsplan Q4.pdf', kind: 'Samenwerkingsplan', updatedAt: '2026-10-13', summary: 'Fictieve planning en doelen voor de samenwerking in het vierde kwartaal.' },
  { id: 'd-002', partnerId: 'partner-001', name: 'Gebiedsverkenning - werknotitie.docx', kind: 'Werknotitie', updatedAt: '2026-10-21', summary: 'Fictieve aandachtspunten voor de volgende projectbespreking.' },
  { id: 'd-003', partnerId: 'partner-002', name: 'Campagnevoorstel - concept.pdf', kind: 'Voorstel', updatedAt: '2026-10-19', summary: 'Fictieve eerste opzet voor de gezamenlijke regionale campagne.' },
  { id: 'd-004', partnerId: 'partner-003', name: 'Buurtprogramma - voortgang.pdf', kind: 'Projectupdate', updatedAt: '2026-09-18', summary: 'Fictieve voortgang en open punten van het buurtprogramma.' },
  { id: 'd-005', partnerId: 'partner-004', name: 'Leertraject - evaluatieopzet.docx', kind: 'Evaluatie', updatedAt: '2026-10-16', summary: 'Fictieve evaluatievragen voor het lopende leertraject.' },
  { id: 'd-006', partnerId: 'partner-005', name: 'Verkenning emissievrij vervoer.docx', kind: 'Verkenning', updatedAt: '2026-10-14', summary: 'Fictieve kansen voor een eerste pilot rond emissievrij vervoer.' },
  { id: 'd-007', partnerId: 'partner-006', name: 'Conceptpresentatie - eerste ideeën.pdf', kind: 'Presentatie', updatedAt: '2026-10-22', summary: 'Fictieve eerste ideeën voor de gezamenlijke presentatie.' },
]