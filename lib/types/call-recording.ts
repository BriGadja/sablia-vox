/**
 * Multi-track recording URL map returned by the call-recording API route.
 * Only keys whose underlying recording exists in Dipler are present.
 */

export type TrackKey = 'merged' | 'legacy' | 'userMic' | 'vad' | 'iris'

export type CallRecordingTracks = Partial<Record<TrackKey, string>>

export type RecordingApiResponse =
  | { tracks: CallRecordingTracks }
  | { error: string; code?: string }

export const TRACK_PRIORITY: TrackKey[] = ['merged', 'legacy', 'userMic', 'vad', 'iris']

export const TRACK_LABELS: Record<TrackKey, string> = {
  merged: 'Mixé',
  legacy: 'Legacy',
  userMic: 'Micro',
  vad: 'VAD',
  iris: 'Iris',
}
