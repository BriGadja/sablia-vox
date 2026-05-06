import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError, handleApiError } from '@/lib/api-auth'
import { getConversationRecording } from '@/lib/dipler/client'
import { createClient } from '@/lib/supabase/server'

const ParamsSchema = z.object({ callId: z.uuid() })

export async function GET(_req: NextRequest, ctx: { params: Promise<{ callId: string }> }) {
  try {
    const params = await ctx.params
    const parsed = ParamsSchema.safeParse(params)
    if (!parsed.success) {
      throw new ApiError('Invalid callId', 400)
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new ApiError('Unauthorized', 401)
    }

    const { data: call, error } = await supabase
      .from('calls')
      .select('id, recording_url, dipler_conversation_id')
      .eq('id', parsed.data.callId)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle()

    if (error) {
      console.error('Recording route DB error:', error)
      throw new ApiError('Database error', 500)
    }
    if (!call) {
      throw new ApiError('Call not found', 404)
    }
    if (!call.recording_url || !call.dipler_conversation_id) {
      return NextResponse.json({ tracks: {} })
    }
    if (call.recording_url.includes('://')) {
      // Legacy full-URL row — already-expired presigned URL. Caller can't refresh it; surface empty.
      return NextResponse.json({ tracks: {} })
    }

    const workspaceUlid = call.recording_url.split('/')[0]
    if (!workspaceUlid) {
      return NextResponse.json({ tracks: {} })
    }

    const result = await getConversationRecording({
      workspaceUlid,
      conversationId: call.dipler_conversation_id,
    })

    if (!result.ok) {
      if (result.code === 'WORKSPACE_PAK_MISSING') {
        return NextResponse.json({ tracks: {} })
      }
      throw new ApiError(result.code, result.status)
    }

    return NextResponse.json({ tracks: result.value })
  } catch (err) {
    return handleApiError(err)
  }
}
