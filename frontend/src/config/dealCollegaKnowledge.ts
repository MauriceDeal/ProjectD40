export type DealCollegaResponseKind = 'context-answer' | 'generated-proposal' | 'approved-template' | 'instruction-only'
export type KnowledgeSourceAvailability = 'available' | 'demo' | 'unconnected'

export interface ApprovedTemplate {
  id: string
  category: string
  name: string
  content: string
  approved: true
}

export interface KnowledgeSourceDefinition {
  id: string
  label: string
  availability: KnowledgeSourceAvailability
  description: string
}

export const dealCollegaInstructions = {
  workingRules: [
    'Corrigeer spelling, grammatica en interpunctie met behoud van betekenis en oorspronkelijke toon.',
    'Herschrijf niet volledig wanneer een beperkte correctie volstaat; maak tekst natuurlijk en niet langer dan nodig.',
    'Voeg geen feiten, afspraken, namen, data, bedragen of toezeggingen toe die niet zijn aangeleverd.',
    'Bij een expliciet herschrijfverzoek: verbeter structuur, formulering en leesbaarheid zonder de boodschap te wijzigen.',
    'Verzin ontbrekende bedrijfsinformatie niet; benoem ontbrekende informatie wanneer die nodig is voor een betrouwbaar antwoord.',
    'Gebruik alleen informatie uit daadwerkelijk beschikbare kennisbronnen en maak onderscheid tussen broninformatie en gegenereerde tekst.',
  ],
  toneOfVoice: [
    'Professioneel, persoonlijk, natuurlijk, duidelijk, bondig en toegankelijk.',
    'Niet overdreven formeel, stijf of commercieel.',
    'Zakelijke berichten zijn direct bruikbaar; vermijd lange introducties, AI-achtige formuleringen en herhaling.',
  ],
  templateRules: [
    'Controleer eerst of een goedgekeurde template inhoudelijk bij de vraag past.',
    'Gebruik een passende goedgekeurde template als uitgangspunt en behoud bedoeling en structuur.',
    'Pas alleen aangeleverde, relevante gegevens toe; verzin geen invulwaarden.',
    'Als geen passende template beschikbaar is, presenteer een nieuw voorstel nooit als officieel of goedgekeurd.',
  ],
} as const

export const templateCategories = [
  'Partnercommunicatie',
  'Kennismakingsmail',
  'Partnerintroductie',
  'Partner follow-up',
  'Contract / samenwerking verlengen',
  'Event uitnodiging',
  'Event bevestiging',
  'Praktische eventinformatie',
  'Interne communicatie',
  'Overige goedgekeurde templates',
] as const

export const approvedTemplates: ApprovedTemplate[] = []

export const knowledgeSourceRegistry: KnowledgeSourceDefinition[] = [
  { id: 'instructions', label: 'Deal Collega-instructies', availability: 'available', description: 'Centrale vaste werkwijze en tone of voice.' },
  { id: 'templates', label: 'Goedgekeurde templates', availability: 'available', description: 'Templatebibliotheek is klaar; er zijn nog geen templates aangeleverd.' },
  { id: 'partner360', label: 'Geselecteerd Partner 360-profiel', availability: 'demo', description: 'Alleen de context van de geselecteerde partner en de daadwerkelijk aanwezige profielvelden.' },
  { id: 'documents', label: 'Partner 360-documenten', availability: 'demo', description: 'Alleen documenten die expliciet in de geselecteerde mockcontext staan; geen SharePoint-inhoud.' },
  { id: 'microsoft365', label: 'Microsoft 365', availability: 'unconnected', description: 'Niet verbonden; geen Microsoft Graph-requests.' },
  { id: 'outlook', label: 'Outlook', availability: 'unconnected', description: 'Niet verbonden; geen mailbox- of agenda-informatie.' },
  { id: 'sharepoint', label: 'SharePoint', availability: 'unconnected', description: 'Niet verbonden; geen site-, bibliotheek- of documenttoegang.' },
  { id: 'teams', label: 'Teams', availability: 'unconnected', description: 'Niet verbonden; geen chat- of kanaalberichten.' },
  { id: 'tribecrm', label: 'TribeCRM', availability: 'unconnected', description: 'Niet verbonden; er worden geen CRM-gegevens gelezen.' },
  { id: 'other', label: 'Overige goedgekeurde bronnen', availability: 'unconnected', description: 'Nog niet geconfigureerd.' },
]

export function findApprovedTemplate(category: string): ApprovedTemplate | undefined {
  return approvedTemplates.find((template) => template.approved && template.category === category)
}