import type { DataSourceId } from '../config/dataSources'
import { getDataSourceLabel } from '../config/dataSources'

export function unconfiguredLiveSource(source: DataSourceId): never {
  throw new Error(`${getDataSourceLabel(source)} staat op Live, maar er is nog geen adapter geconfigureerd. Er is geen externe verbinding gemaakt.`)
}