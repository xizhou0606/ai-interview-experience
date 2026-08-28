import { mcpClientFeatureApis } from './client-features'
import { mcpLifecycleUtilityApis } from './lifecycle-utilities'
import { mcpServerFeatureApis } from './server-features'
import { mcpTaskNotificationApis } from './tasks-notifications'

export const MCP_FRAMEWORK_API_EXPECTED_COUNT = 31

export const mcpFrameworkApis = [
  ...mcpLifecycleUtilityApis,
  ...mcpServerFeatureApis,
  ...mcpClientFeatureApis,
  ...mcpTaskNotificationApis,
]
