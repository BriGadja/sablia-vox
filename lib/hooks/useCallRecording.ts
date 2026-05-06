import { useQuery } from '@tanstack/react-query'
import type { CallRecordingTracks, RecordingApiResponse } from '@/lib/types/call-recording'

const STALE_TIME_MS = 4 * 60 * 1000 // 4 min — Dipler signed URL TTL is short, refetch keeps it fresh

async function fetchCallRecording(callId: string): Promise<CallRecordingTracks> {
  const res = await fetch(`/api/calls/${callId}/recording`, {
    signal: AbortSignal.timeout(10_000),
  })
  const body = (await res.json()) as RecordingApiResponse
  if (!res.ok) {
    const message = 'error' in body ? body.error : 'Failed to load recording'
    throw new Error(message)
  }
  if ('error' in body) {
    throw new Error(body.error)
  }
  return body.tracks
}

export function useCallRecording(callId: string | null) {
  return useQuery<CallRecordingTracks>({
    queryKey: ['call-recording', callId],
    queryFn: () => {
      if (!callId) throw new Error('callId required')
      return fetchCallRecording(callId)
    },
    enabled: !!callId,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
