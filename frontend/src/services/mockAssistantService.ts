import type { PartnerKnowledge } from '../types/partnerKnowledge'
import { findApprovedTemplate, templateCategories } from '../config/dealCollegaKnowledge'

export interface AssistantReply {
  text: string
  sources: string[]
  responseKind: 'context-answer' | 'generated-proposal' | 'approved-template' | 'instruction-only'
  provenance: string
}

export async function answerFromMockProfile(knowledge: PartnerKnowledge, question: string): Promise<AssistantReply> {
  const normalizedQuestion = question.toLocaleLowerCase('nl-NL')
  const isTextRequest = /spelling|grammatica|corrigeer|controleer|herschrijf|herschrijven|schrijf|maak .*mail|stel .*op|uitnodiging|follow-up/.test(normalizedQuestion)
  const templateCategory = getTemplateCategory(normalizedQuestion)
    const approvedTemplate = templateCategory && knowledge.instructions.templateRules.length > 0
      ? findApprovedTemplate(templateCategory)
      : undefined
  const recentActivities = knowledge.activities.slice(0, 3)
  const activitySummary = recentActivities.length
    ? recentActivities.map((activity) => `${activity.title} (${activity.date}): ${activity.description}`).join('\n')
    : 'Er zijn nog geen contactmomenten vastgelegd.'
  const actionSummary = knowledge.openActions.length
    ? knowledge.openActions.map((action) => `${action.title} · ${action.status}${action.dueDate ? ` · deadline ${action.dueDate}` : ''} · eigenaar ${action.owner}`).join('\n')
    : 'Er zijn geen openstaande acties vastgelegd.'
  const documentSummary = knowledge.documents.length
    ? knowledge.documents.map((document) => `${document.name}: ${document.summary}`).join('\n')
    : 'Er zijn geen documenten opgenomen in dit mockprofiel.'
  const noteSummary = knowledge.internalNotes.length
    ? knowledge.internalNotes.map((note) => `${note.author} (${note.date}): ${note.text}`).join('\n')
    : 'Er zijn nog geen interne notities vastgelegd.'
  const microsoft365Summary = knowledge.microsoft365Information.length
    ? knowledge.microsoft365Information.map((item) => `${item.kind} (${item.date}): ${item.title} — ${item.summary}`).join('\n')
    : 'Er is geen Microsoft 365-informatie beschikbaar in deze mockdemo.'
  const statusSummary = knowledge.partner.status === 'Onbekend'
    ? 'De partnerstatus is niet aangeleverd.'
    : `${knowledge.partner.name} staat op ‘${knowledge.partner.status}’.`
  const profileSummary = knowledge.partner.summary || 'Er is geen partnerbeschrijving aangeleverd.'
  let text: string
  let sources = ['Partnerprofiel']
  let responseKind: AssistantReply['responseKind'] = 'context-answer'
  let provenance = 'Partner 360 mock/demo-context'

  if (isTextRequest && approvedTemplate) {
    text = approvedTemplate.content
    sources = [`Goedgekeurde template: ${approvedTemplate.name}`]
    responseKind = 'approved-template'
    provenance = 'Goedgekeurde template'
  } else if (isTextRequest) {
    const category = templateCategory ?? 'passende categorie'
    const missingInput = /spelling|grammatica|corrigeer|controleer|herschrijf/.test(normalizedQuestion)
      ? 'De aan te passen brontekst is nog niet meegestuurd.'
      : 'Situatie, ontvanger en eventuele gewenste gegevens zijn nog niet aangeleverd.'
    text = `Er is geen goedgekeurde template beschikbaar voor ${category}. Ik kan een nieuw voorstel maken volgens de Deal Collega-instructies, maar ${missingInput} Er wordt geen officiële template gebruikt. ${knowledge.instructions.workingRules[4]}`
    sources = ['Deal Collega-instructies', 'Templatebibliotheek: geen passende template']
    responseKind = 'instruction-only'
    provenance = 'Geen goedgekeurde template beschikbaar'
  } else if (/microsoft 365|outlook|agenda|mailbox|sharepoint|teams|tribecrm|crm/.test(normalizedQuestion)) {
    const sourceId = /tribecrm|crm/.test(normalizedQuestion)
      ? 'tribecrm'
      : /outlook|agenda|mailbox/.test(normalizedQuestion)
        ? 'outlook'
        : /sharepoint/.test(normalizedQuestion)
          ? 'sharepoint'
          : /teams/.test(normalizedQuestion)
            ? 'teams'
            : 'microsoft365'
    const source = knowledge.knowledgeSources.find((item) => item.id === sourceId)
    if (source?.availability === 'unconnected') {
      text = `${source.label} is niet verbonden. Ik heb geen gegevens uit deze bron en kan die hier dus niet raadplegen.`
      sources = [`Bronstatus: ${source.label} niet verbonden`]
      responseKind = 'instruction-only'
      provenance = 'Bron niet verbonden'
    } else if (knowledge.microsoft365Information.length) {
      text = microsoft365Summary
      sources = ['Microsoft 365 demo-context']
      provenance = 'Demo-context; geen live Microsoft 365-bron'
    } else {
      text = 'Er is geen Microsoft 365-informatie opgenomen in de beschikbare demo-context.'
      sources = ['Partner 360 demo-context']
      responseKind = 'instruction-only'
      provenance = 'Geen brongegevens beschikbaar'
    }
  } else if (/stand van zaken|huidige status|hoe staat|status/.test(normalizedQuestion)) {
    text = `${statusSummary} ${profileSummary} De eerstvolgende stap is: ${knowledge.nextAction}. Er zijn ${knowledge.openActions.length} openstaande actie(s).`
    sources = ['Partnerprofiel', 'Openstaande acties']
  } else if (/contactmoment|besproken|gesproken|recent/.test(normalizedQuestion)) {
    text = `Dit is wat in het mockprofiel staat over de laatste contactmomenten:\n${activitySummary}`
    sources = ['Contactgeschiedenis']
  } else if (/actie|openstaand|openstaande|todo|to-do/.test(normalizedQuestion)) {
    text = `Dit zijn de openstaande acties in Partner 360:\n${actionSummary}${knowledge.partner.status === 'Aandacht nodig' ? '\nDe partnerstatus vraagt extra opvolging.' : ''}`
    sources = ['Openstaande acties']
  } else if (/goede volgende stap|volgende stap|aanpak/.test(normalizedQuestion)) {
    const firstAction = knowledge.openActions[0]
    const contact = knowledge.contacts.find((item) => item.isPrimary) ?? knowledge.contacts[0]
    text = `Een logische volgende stap is: ${firstAction?.title ?? knowledge.nextAction}. ${contact ? `Neem contact op met ${contact.name} (${contact.role})` : 'Bepaal eerst een contactpersoon'} en leg na afloop de gemaakte afspraken vast in Partner 360.`
    sources = ['Partnerprofiel', 'Openstaande acties', 'Contactpersoon']
  } else if (/rekening|voorbereid|volgende gesprek|gesprek/.test(normalizedQuestion)) {
    const contact = knowledge.contacts.find((item) => item.isPrimary) ?? knowledge.contacts[0]
    text = `Voor je gesprek met ${contact?.name ?? 'de contactpersoon'} van ${knowledge.partner.name}: bespreek “${knowledge.openActions[0]?.title ?? knowledge.nextAction}”. Het laatste contactmoment was: ${recentActivities[0]?.description ?? 'Niet vastgelegd.'} Interne notitie: ${knowledge.internalNotes[0]?.text ?? 'Geen interne notitie beschikbaar.'} Relevant document: ${knowledge.documents[0]?.name ?? 'Geen document beschikbaar.'} Microsoft 365-context: ${microsoft365Summary} Dit advies is uitsluitend gebaseerd op mockdata.`
    sources = ['Contactgeschiedenis', 'Openstaande acties', 'Interne notities', 'Documenten', 'Microsoft 365 mockcontext']
  } else if (/document|bestand|bijlage|rapport/.test(normalizedQuestion)) {
    text = `Dit zijn de documenten in het fictieve partnerprofiel:\n${documentSummary}`
    sources = ['Documenten']
  } else if (/notitie|interne opmerking|intern vastgelegd/.test(normalizedQuestion)) {
    text = `Dit is intern over de partner vastgelegd:\n${noteSummary}`
    sources = ['Interne notities']
  } else if (/ontbreekt|missen|informatie/.test(normalizedQuestion)) {
    text = `Deze informatie ontbreekt nog in het huidige mockprofiel:\n${knowledge.informationGaps.map((gap) => `• ${gap}`).join('\n')}`
    sources = ['Partnerprofiel', 'Beschikbare mockbronnen']
  } else {
    text = `${knowledge.partner.name} is een ${knowledge.partner.category} in regio ${knowledge.partner.region}. ${statusSummary} ${profileSummary}\n\nVolgende stap: ${knowledge.nextAction}. Er zijn ${knowledge.openActions.length} openstaande actie(s), ${knowledge.documents.length} fictieve document(en), ${knowledge.internalNotes.length} interne notitie(s) en ${knowledge.microsoft365Information.length} Microsoft 365 mockitem(s) beschikbaar. Ik baseer dit antwoord alleen op het geselecteerde mockprofiel.`
    sources = ['Partnerprofiel', 'Openstaande acties', 'Documenten', 'Interne notities', 'Microsoft 365 mockcontext']
  }

  return {
    text,
    sources,
    responseKind,
    provenance,
  }
}

function getTemplateCategory(question: string): string | undefined {
  if (/kennismaking/.test(question)) return templateCategories.find((category) => category === 'Kennismakingsmail')
  if (/introductie/.test(question)) return templateCategories.find((category) => category === 'Partnerintroductie')
  if (/follow.?up|opvolgmail|opvolgbericht/.test(question)) return templateCategories.find((category) => category === 'Partner follow-up')
  if (/verlengen|verlenging|contract/.test(question)) return templateCategories.find((category) => category === 'Contract / samenwerking verlengen')
  if (/event|bijeenkomst/.test(question) && /uitnodig/.test(question)) return templateCategories.find((category) => category === 'Event uitnodiging')
  if (/event|bijeenkomst/.test(question) && /bevestig/.test(question)) return templateCategories.find((category) => category === 'Event bevestiging')
  if (/event|bijeenkomst|praktische informatie/.test(question)) return templateCategories.find((category) => category === 'Praktische eventinformatie')
  if (/intern/.test(question)) return templateCategories.find((category) => category === 'Interne communicatie')
  if (/mail|bericht|communicatie/.test(question)) return templateCategories.find((category) => category === 'Partnercommunicatie')
  return undefined
}