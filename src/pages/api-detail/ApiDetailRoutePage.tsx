import { getApiBySlug } from '../../data/apis'
import { ApiExplorerPage } from '../api-explorer/ApiExplorerPage'
import { ApiDetailPage } from './ApiDetailPage'

export function ApiDetailRoutePage({ slug }: { slug: string }) {
  const api = getApiBySlug(slug)
  return api ? <ApiDetailPage api={api} /> : <ApiExplorerPage />
}
