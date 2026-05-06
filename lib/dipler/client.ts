import 'server-only'
import type { CallRecordingTracks, TrackKey } from '@/lib/types/call-recording'

const DIPLER_ENDPOINT = 'https://dipler-backend-203319928451.europe-west9.run.app/'
const TIMEOUT_MS = 8000

let pakCache: Record<string, string> | null = null

function loadWorkspacePaks(): Record<string, string> {
  if (pakCache) return pakCache
  const raw = process.env.DIPLER_WORKSPACE_PAKS
  if (!raw) {
    throw new Error('Missing DIPLER_WORKSPACE_PAKS env var')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('DIPLER_WORKSPACE_PAKS is not valid JSON')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('DIPLER_WORKSPACE_PAKS must be a JSON object')
  }
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v !== 'string' || v.length === 0) {
      throw new Error(`DIPLER_WORKSPACE_PAKS["${k}"] must be a non-empty string`)
    }
  }
  pakCache = parsed as Record<string, string>
  return pakCache
}

export type DiplerResult<T> = { ok: true; value: T } | { ok: false; code: string; status: number }

const FIELD_TO_TRACK: Record<string, TrackKey> = {
  recordingSignedUrl: 'merged',
  legacyRecordingSignedUrl: 'legacy',
  userMicRecordingSignedUrl: 'userMic',
  vadAudioRecordingSignedUrl: 'vad',
  irisAudioRecordingSignedUrl: 'iris',
}

interface DiplerSuccess {
  success: true
  conversation?: Record<string, unknown>
}

interface DiplerHandledError {
  success: false
  error: string
}

interface DiplerMiddlewareError {
  type: 'error'
  success: false
  errorMessage: string
  code: string
}

type DiplerEnvelope = DiplerSuccess | DiplerHandledError | DiplerMiddlewareError

function extractTracks(conversation: Record<string, unknown>): CallRecordingTracks {
  const tracks: CallRecordingTracks = {}
  for (const [field, key] of Object.entries(FIELD_TO_TRACK)) {
    const value = conversation[field]
    if (typeof value === 'string' && value.length > 0) {
      tracks[key] = value
    }
  }
  return tracks
}

export async function getConversationRecording(args: {
  workspaceUlid: string
  conversationId: string
}): Promise<DiplerResult<CallRecordingTracks>> {
  const paks = loadWorkspacePaks()
  const pak = paks[args.workspaceUlid]
  if (!pak) {
    return { ok: false, code: 'WORKSPACE_PAK_MISSING', status: 404 }
  }

  let response: Response
  try {
    response = await fetch(DIPLER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pak}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'conversation',
        action: 'getConversation',
        payload: { conversationId: args.conversationId },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    const code =
      err instanceof DOMException && err.name === 'TimeoutError'
        ? 'DIPLER_TIMEOUT'
        : 'DIPLER_NETWORK'
    return { ok: false, code, status: 504 }
  }

  let body: DiplerEnvelope
  try {
    body = (await response.json()) as DiplerEnvelope
  } catch {
    return { ok: false, code: 'DIPLER_INVALID_JSON', status: 502 }
  }

  if (body.success === false) {
    if ('type' in body && body.type === 'error') {
      return {
        ok: false,
        code: body.code,
        status: response.status === 200 ? 502 : response.status,
      }
    }
    const message = (body as DiplerHandledError).error
    const code = message === 'Conversation non trouvée' ? 'CONVERSATION_NOT_FOUND' : 'DIPLER_ERROR'
    return { ok: false, code, status: code === 'CONVERSATION_NOT_FOUND' ? 404 : 502 }
  }

  const conversation = body.conversation
  if (!conversation || typeof conversation !== 'object') {
    return { ok: true, value: {} }
  }

  return { ok: true, value: extractTracks(conversation) }
}
