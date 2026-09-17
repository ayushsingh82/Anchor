import type { WorkflowDefinition } from './types'

const BASE_URL = process.env.KEEPERHUB_BASE_URL ?? 'https://app.keeperhub.com'

function apiKey(): string {
  const key = process.env.KEEPERHUB_API_KEY
  if (!key) throw new Error('KEEPERHUB_API_KEY is not set')
  return key
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KeeperHub API ${init?.method ?? 'GET'} ${path} -> ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export function listWorkflows(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams()
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.offset) qs.set('offset', String(params.offset))
  const suffix = qs.toString() ? `?${qs}` : ''
  return request<unknown[]>(`/api/workflows${suffix}`)
}

export function getWorkflow(workflowId: string) {
  return request<unknown>(`/api/workflows/${workflowId}`)
}

export function createWorkflow(definition: WorkflowDefinition) {
  return request<{ id: string }>('/api/workflows/create', {
    method: 'POST',
    body: JSON.stringify(definition),
  })
}

export function getWorkflowHistory(workflowId: string) {
  return request<unknown[]>(`/api/workflows/${workflowId}/history`)
}
