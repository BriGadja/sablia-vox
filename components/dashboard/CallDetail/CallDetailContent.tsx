'use client'

import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Frown,
  Mail,
  Meh,
  Phone,
  Smile,
  User,
  Volume2,
} from 'lucide-react'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { FadeIn } from '@/components/motion'
import { TranscriptDisplay } from '@/components/transcript/TranscriptDisplay'
import type { DashboardCall } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'
import {
  formatDuration,
  getContactName,
  getEmotionDisplay,
  getOutcomeDisplay,
} from './useCallDetail'

// ── Emotion icon mapping ─────────────────────────────────────────

const EMOTION_ICONS: Record<string, React.ReactNode> = {
  positive: <Smile className="w-4 h-4" />,
  negative: <Frown className="w-4 h-4" />,
  neutral: <Meh className="w-4 h-4" />,
}

// ── Variant-aware size tokens ────────────────────────────────────

const VARIANT_STYLES = {
  page: {
    metaIcon: 'w-4 h-4',
    metaLabel: 'text-sm',
    metaValue: 'text-white font-medium',
    metaSubValue: 'text-white/50 text-sm',
    sectionTitle: 'text-lg font-semibold text-white',
    sectionTitleIcon: 'w-5 h-5 text-purple-400',
    contactIcon: 'w-4 h-4',
    contactIconWrap: 'p-2',
    contactLabel: 'text-xs text-white/60',
    contactValue: 'text-white font-medium',
    cardPadding: 'p-6',
    transcriptMaxHeight: undefined,
  },
  modal: {
    metaIcon: 'w-3 h-3',
    metaLabel: 'text-xs',
    metaValue: 'text-white text-sm font-medium',
    metaSubValue: 'text-white/50 text-xs',
    sectionTitle: 'text-sm font-medium text-white',
    sectionTitleIcon: 'w-4 h-4 text-purple-400',
    contactIcon: 'w-3 h-3',
    contactIconWrap: 'p-2',
    contactLabel: 'text-xs text-white/60',
    contactValue: 'text-white text-sm',
    cardPadding: 'p-4',
    transcriptMaxHeight: 'max-h-48' as const,
  },
} as const

// ── Props ────────────────────────────────────────────────────────

interface CallDetailContentProps {
  call: DashboardCall
  /** 'page' renders full-size sections; 'modal' is compact */
  variant: 'page' | 'modal'
}

// ── Component ────────────────────────────────────────────────────

export function CallDetailContent({ call, variant }: CallDetailContentProps) {
  const s = VARIANT_STYLES[variant]
  const outcomeDisplay = getOutcomeDisplay(call.outcome)
  const emotionConfig = getEmotionDisplay(call.emotion)
  const contactName = getContactName(call.first_name, call.last_name)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column — Call Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Call Metadata */}
        <div
          className={cn(
            'rounded-xl border border-white/10 bg-white/5 space-y-6',
            variant === 'page' ? 'p-6' : 'p-4',
          )}
        >
          {variant === 'page' && <h3 className={s.sectionTitle}>Informations de l&apos;appel</h3>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Date */}
            <div className="space-y-1">
              <div className={cn('flex items-center gap-2 text-white/60', s.metaLabel)}>
                <Calendar className={s.metaIcon} />
                <span>Date</span>
              </div>
              <p className={s.metaValue}>{new Date(call.started_at).toLocaleDateString('fr-FR')}</p>
              <p className={s.metaSubValue}>
                {new Date(call.started_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <div className={cn('flex items-center gap-2 text-white/60', s.metaLabel)}>
                <Clock className={s.metaIcon} />
                <span>Dur\u00E9e</span>
              </div>
              <p className={s.metaValue}>{formatDuration(call.duration_seconds ?? 0)}</p>
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <div className={cn('flex items-center gap-2 text-white/60', s.metaLabel)}>
                <DollarSign className={s.metaIcon} />
                <span>Co\u00FBt</span>
              </div>
              <p className={s.metaValue}>{call.billed_cost?.toFixed(2) || '0.00'} \u20AC</p>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <div className={cn('flex items-center gap-2 text-white/60', s.metaLabel)}>
                <Phone className={s.metaIcon} />
                <span>Statut</span>
              </div>
              <p className={cn(s.metaValue, call.is_answered ? 'text-green-400' : 'text-red-400')}>
                {call.is_answered ? 'R\u00E9pondu' : 'Non r\u00E9pondu'}
              </p>
            </div>
          </div>

          {/* Outcome & Emotion Badges — inside card for page, separate for modal */}
          {variant === 'page' && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
              <OutcomeBadge outcomeDisplay={outcomeDisplay} />
              {emotionConfig && (
                <EmotionBadge emotionConfig={emotionConfig} emotion={call.emotion} />
              )}
            </div>
          )}
        </div>

        {/* Outcome & Emotion Badges — outside card for modal */}
        {variant === 'modal' && (
          <div className="flex flex-wrap gap-3">
            <OutcomeBadge outcomeDisplay={outcomeDisplay} />
            {emotionConfig && <EmotionBadge emotionConfig={emotionConfig} emotion={call.emotion} />}
          </div>
        )}

        {/* Recording */}
        {call.recording_url && (
          <FadeIn>
            <div
              className={cn(
                variant === 'page'
                  ? 'rounded-xl border border-white/10 bg-white/5 p-6 space-y-4'
                  : 'space-y-3',
              )}
            >
              <h3 className={cn(s.sectionTitle, 'flex items-center gap-2')}>
                <Volume2 className={s.sectionTitleIcon} />
                Enregistrement
              </h3>
              <AudioPlayer url={call.recording_url} />
            </div>
          </FadeIn>
        )}

        {/* Transcript */}
        {call.transcript && (
          <FadeIn delay={0.1}>
            <div
              className={cn(
                variant === 'page'
                  ? 'rounded-xl border border-white/10 bg-white/5 p-6 space-y-4'
                  : 'space-y-3',
              )}
            >
              <h3 className={cn(s.sectionTitle, 'flex items-center gap-2')}>
                <FileText className={s.sectionTitleIcon} />
                Transcription
              </h3>
              <TranscriptDisplay
                transcript={call.transcript}
                {...(s.transcriptMaxHeight ? { maxHeight: s.transcriptMaxHeight } : {})}
              />
            </div>
          </FadeIn>
        )}
      </div>

      {/* Right Column — Contact & Agent Info */}
      <div className="space-y-6">
        {/* Contact Card */}
        <div
          className={cn('rounded-xl border border-white/10 bg-white/5 space-y-4', s.cardPadding)}
        >
          <h3 className={s.sectionTitle}>Contact</h3>

          <div className={variant === 'page' ? 'space-y-4' : 'space-y-3'}>
            <ContactRow
              icon={<User className={cn(s.contactIcon, 'text-white/60')} />}
              label="Nom"
              value={contactName}
              styles={s}
            />
            <ContactRow
              icon={<Phone className={cn(s.contactIcon, 'text-white/60')} />}
              label="T\u00E9l\u00E9phone"
              value={call.phone_number ?? ''}
              styles={s}
            />
            {call.contact_email && (
              <ContactRow
                icon={<Mail className={cn(s.contactIcon, 'text-white/60')} />}
                label="Email"
                value={call.contact_email}
                breakAll
                styles={s}
              />
            )}
          </div>
        </div>

        {/* Agent Info Card */}
        <div
          className={cn('rounded-xl border border-white/10 bg-white/5 space-y-4', s.cardPadding)}
        >
          <h3 className={s.sectionTitle}>Agent</h3>
          <div className={variant === 'page' ? 'space-y-3' : 'space-y-2'}>
            <div>
              <p className="text-xs text-white/60">Nom</p>
              <p className={s.contactValue}>{call.deployment_name}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Type</p>
              <p className={cn(s.contactValue, 'capitalize')}>{call.template_display_name}</p>
            </div>
          </div>
        </div>

        {/* Extracted Data (page only — omitted in modal for space) */}
        {variant === 'page' &&
          call.extracted_data &&
          Object.keys(call.extracted_data).length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className={s.sectionTitle}>Donn\u00E9es extraites</h3>
              <div className="bg-black/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-white/60 text-xs overflow-x-auto">
                  {JSON.stringify(call.extracted_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

// ── Helper sub-components ────────────────────────────────────────

function OutcomeBadge({
  outcomeDisplay,
}: {
  outcomeDisplay: { label: string; className: string }
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-white/60">R\u00E9sultat</span>
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
          outcomeDisplay.className,
        )}
      >
        {outcomeDisplay.label}
      </div>
    </div>
  )
}

function EmotionBadge({
  emotionConfig,
  emotion,
}: {
  emotionConfig: { label: string; className: string }
  emotion: string | null
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-white/60">\u00C9motion</span>
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
          emotionConfig.className,
        )}
      >
        {emotion && EMOTION_ICONS[emotion]}
        {emotionConfig.label}
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  breakAll,
  styles,
}: {
  icon: React.ReactNode
  label: string
  value: string
  breakAll?: boolean
  styles: (typeof VARIANT_STYLES)['page'] | (typeof VARIANT_STYLES)['modal']
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(styles.contactIconWrap, 'rounded-lg bg-white/5')}>{icon}</div>
      <div>
        <p className={styles.contactLabel}>{label}</p>
        <p className={cn(styles.contactValue, breakAll && 'break-all')}>{value}</p>
      </div>
    </div>
  )
}
