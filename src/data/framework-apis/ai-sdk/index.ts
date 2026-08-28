import { aiSdkAgentToolApis } from './agents-tools'
import { aiSdkGenerationApis } from './generation'
import { aiSdkProviderMiddlewareApis } from './providers-middleware'
import { aiSdkUiApis } from './ui'

export const AI_SDK_FRAMEWORK_API_EXPECTED_COUNT = 56

export const aiSdkFrameworkApis = [
  ...aiSdkGenerationApis,
  ...aiSdkAgentToolApis,
  ...aiSdkProviderMiddlewareApis,
  ...aiSdkUiApis,
]
