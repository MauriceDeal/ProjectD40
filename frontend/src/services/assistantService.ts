import { answerFromMockProfile, type AssistantReply } from './mockAssistantService'
import { getDealCollegaContext } from './partnerContextService'
import { getDataSourceMode } from '../config/dataSources'
import { unconfiguredLiveSource } from '../integrations/unconfiguredLiveSource'

export interface AssistantRequest {
  partnerId: string
  question: string
}

export async function askDealCollega({ partnerId, question }: AssistantRequest): Promise<AssistantReply> {
  if (getDataSourceMode('dealCollegaAi') === 'live') return unconfiguredLiveSource('dealCollegaAi')
  const context = await getDealCollegaContext(partnerId)
  return answerFromMockProfile(context, question)
}