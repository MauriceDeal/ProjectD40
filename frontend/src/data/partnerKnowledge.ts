import type { Partner360Profile } from '../types/partner'
import type { PartnerKnowledge } from '../types/partnerKnowledge'
import { dealCollegaInstructions, knowledgeSourceRegistry } from '../config/dealCollegaKnowledge'

export function collectPartnerKnowledge(profile: Partner360Profile): PartnerKnowledge {
  const informationGaps = ['Doelstellingen en meetbare resultaten zijn niet opgenomen in dit mockprofiel.', 'Besluiten en afspraken zijn niet als aparte gegevens vastgelegd.']
  if (profile.documents.length === 0) informationGaps.push('Er zijn geen documenten opgenomen in dit mockprofiel.')
  if (profile.internalNotes.length === 0) informationGaps.push('Er zijn nog geen interne notities vastgelegd.')
  if (profile.microsoft365Information.length === 0) informationGaps.push('Er is geen Microsoft 365-informatie beschikbaar in deze mockdemo.')
  if (profile.annualValue === 'Nog te bepalen') informationGaps.unshift('De financiële waarde van de samenwerking is nog niet bepaald.')

  return {
    partner: {
      id: profile.id, name: profile.name, category: profile.category, region: profile.region,
      status: profile.status, owner: profile.owner, annualValue: profile.annualValue,
      contractEndDate: profile.contractEndDate,
      lastUpdated: profile.lastUpdated, summary: profile.summary,
    },
    contacts: profile.contacts,
    activities: profile.activities,
    openActions: profile.openActions.filter((action) => action.status !== 'Afgerond'),
    documents: profile.documents,
    internalNotes: profile.internalNotes,
    microsoft365Information: profile.microsoft365Information,
    lastContact: profile.lastContact,
    nextAction: profile.nextAction,
    informationGaps,
    instructions: dealCollegaInstructions,
    knowledgeSources: knowledgeSourceRegistry,
  }
}