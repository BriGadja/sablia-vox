'use client'

import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  History,
  LayoutDashboard,
  MessageSquare,
  Phone,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

type TabId = 'dashboard' | 'history' | 'transcriptions'

const tabs = [
  {
    id: 'dashboard' as TabId,
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    title: 'Tableau de bord analytique en temps réel',
    description:
      'Visualisez les performances de votre agent IA avec des statistiques claires. Suivez les appels traités et les taux de conversion pour optimiser votre stratégie commerciale.',
  },
  {
    id: 'history' as TabId,
    label: 'Historique',
    icon: History,
    title: 'Historique complet de vos interactions',
    description:
      "Consultez l'ensemble des appels gérés par votre agent IA. Filtrez et analysez chaque conversation pour ne manquer aucune opportunité commerciale.",
  },
  {
    id: 'transcriptions' as TabId,
    label: 'Transcriptions',
    icon: FileText,
    title: 'Transcriptions détaillées',
    description:
      'Accédez à la transcription complète de chaque appel. Analysez le contenu des conversations pour améliorer vos scripts et votre approche commerciale.',
  },
]

// Mockup du Dashboard
function DashboardMockup() {
  return (
    <div className="p-6 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Appels', value: '1,247', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Taux Décroché', value: '78%', color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'RDV Pris', value: '342', color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Conversion', value: '27.4%', color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-lg p-4 border border-white/5`}>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart - Area chart style like Louis dashboard */}
      <div className="bg-white/5 rounded-lg border border-white/5 p-4">
        <p className="text-sm text-gray-400 mb-4">Volume d&apos;appels par jour</p>
        <div className="relative h-36">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Total appels - Cyan area */}
            <defs>
              <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0,80 C20,75 40,65 60,70 C80,75 100,50 120,35 C140,20 160,15 180,25 C200,35 220,45 240,50 C260,55 280,45 300,50 C320,55 340,45 360,40 C380,35 400,45 400,45 L400,120 L0,120 Z"
              fill="url(#totalGradient)"
            />
            <path
              d="M0,80 C20,75 40,65 60,70 C80,75 100,50 120,35 C140,20 160,15 180,25 C200,35 220,45 240,50 C260,55 280,45 300,50 C320,55 340,45 360,40 C380,35 400,45 400,45"
              fill="none"
              stroke="rgb(34, 211, 238)"
              strokeWidth="2"
            />

            {/* Appels répondus - Lime area */}
            <defs>
              <linearGradient id="answeredGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(163, 230, 53)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(163, 230, 53)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0,90 C20,88 40,82 60,85 C80,88 100,70 120,55 C140,40 160,35 180,45 C200,55 220,62 240,65 C260,68 280,60 300,65 C320,70 340,62 360,58 C380,54 400,60 400,60 L400,120 L0,120 Z"
              fill="url(#answeredGradient)"
            />
            <path
              d="M0,90 C20,88 40,82 60,85 C80,88 100,70 120,55 C140,40 160,35 180,45 C200,55 220,62 240,65 C260,68 280,60 300,65 C320,70 340,62 360,58 C380,54 400,60 400,60"
              fill="none"
              stroke="rgb(163, 230, 53)"
              strokeWidth="2"
            />

            {/* RDV pris - Violet/Pink area */}
            <defs>
              <linearGradient id="rdvGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(192, 132, 252)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0,105 C20,103 40,100 60,102 C80,104 100,95 120,85 C140,75 160,72 180,80 C200,88 220,92 240,94 C260,96 280,92 300,94 C320,96 340,93 360,90 C380,87 400,92 400,92 L400,120 L0,120 Z"
              fill="url(#rdvGradient)"
            />
            <path
              d="M0,105 C20,103 40,100 60,102 C80,104 100,95 120,85 C140,75 160,72 180,80 C200,88 220,92 240,94 C260,96 280,92 300,94 C320,96 340,93 360,90 C380,87 400,92 400,92"
              fill="none"
              stroke="rgb(192, 132, 252)"
              strokeWidth="2"
            />
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-600 px-1 -mb-4">
            <span>05 nov.</span>
            <span>08 nov.</span>
            <span>11 nov.</span>
            <span>14 nov.</span>
            <span>17 nov.</span>
            <span>20 nov.</span>
            <span>23 nov.</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lime-400" />
            <span className="text-gray-400">Appels répondus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-gray-400">RDV pris</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-gray-400">Total appels</span>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-gray-500">Durée moyenne</p>
          <p className="text-lg font-semibold text-white">3m 24s</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-gray-500">Messagerie</p>
          <p className="text-lg font-semibold text-amber-400">18%</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <p className="text-xs text-gray-500">Satisfaction</p>
          <p className="text-lg font-semibold text-green-400">4.8/5</p>
        </div>
      </div>
    </div>
  )
}

// Mockup de l'Historique
function HistoryMockup() {
  const calls = [
    {
      name: 'Martin Dupont',
      phone: '+33 6 12 34 56 78',
      time: '14:32',
      duration: '4:21',
      status: 'rdv',
      outcome: 'RDV planifié',
    },
    {
      name: 'Sophie Laurent',
      phone: '+33 6 98 76 54 32',
      time: '14:15',
      duration: '2:45',
      status: 'qualified',
      outcome: 'Qualifié',
    },
    {
      name: 'Jean Moreau',
      phone: '+33 6 11 22 33 44',
      time: '13:58',
      duration: '1:12',
      status: 'voicemail',
      outcome: 'Messagerie',
    },
    {
      name: 'Marie Petit',
      phone: '+33 6 55 66 77 88',
      time: '13:42',
      duration: '5:33',
      status: 'rdv',
      outcome: 'RDV planifié',
    },
    {
      name: 'Pierre Bernard',
      phone: '+33 6 99 88 77 66',
      time: '13:25',
      duration: '0:45',
      status: 'refused',
      outcome: 'Pas intéressé',
    },
    {
      name: 'Claire Dubois',
      phone: '+33 6 44 33 22 11',
      time: '13:10',
      duration: '3:18',
      status: 'callback',
      outcome: 'Rappel demandé',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rdv':
        return <Calendar className="w-4 h-4 text-green-400" />
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'voicemail':
        return <MessageSquare className="w-4 h-4 text-amber-400" />
      case 'refused':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'callback':
        return <Phone className="w-4 h-4 text-violet-400" />
      default:
        return <Phone className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg">Tous</div>
        <div className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg">RDV</div>
        <div className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg">Qualifiés</div>
        <div className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg">Messagerie</div>
      </div>

      {/* Call list */}
      <div className="space-y-2">
        {calls.map((call, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {call.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{call.name}</p>
              <p className="text-xs text-gray-500">{call.phone}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                {getStatusIcon(call.status)}
                <span className="text-xs text-gray-400">{call.outcome}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{call.duration}</span>
                <span className="text-gray-600">|</span>
                <span>{call.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mockup des Transcriptions
function TranscriptionsMockup() {
  const messages = [
    {
      speaker: 'Louis',
      text: "Bonjour, je suis Louis, l'assistant de VoIPIA. Comment puis-je vous aider aujourd'hui ?",
      time: '0:00',
    },
    {
      speaker: 'Client',
      text: "Bonjour, j'aimerais avoir des informations sur vos services d'agents IA pour mon entreprise.",
      time: '0:08',
    },
    {
      speaker: 'Louis',
      text: "Bien sûr ! Nous proposons des agents IA vocaux qui peuvent gérer vos appels entrants 24/7, qualifier vos prospects et prendre des rendez-vous. Pouvez-vous me dire quel type d'activité vous avez ?",
      time: '0:15',
    },
    {
      speaker: 'Client',
      text: 'Nous sommes une agence immobilière avec environ 200 leads par mois.',
      time: '0:32',
    },
    {
      speaker: 'Louis',
      text: "Parfait, c'est exactement le type d'entreprise pour laquelle nos agents IA sont très efficaces. Souhaitez-vous planifier un rendez-vous avec notre équipe pour une démonstration personnalisée ?",
      time: '0:40',
    },
    { speaker: 'Client', text: 'Oui, je suis disponible jeudi après-midi.', time: '0:55' },
  ]

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-sm font-medium text-white">Martin Dupont</p>
          <p className="text-xs text-gray-500">+33 6 12 34 56 78 • Aujourd&apos;hui 14:32</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
            RDV planifié
          </span>
          <span className="text-xs text-gray-500">4:21</span>
        </div>
      </div>

      {/* Conversation */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.speaker === 'Louis' ? '' : 'flex-row-reverse'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                msg.speaker === 'Louis'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {msg.speaker === 'Louis' ? 'L' : 'C'}
            </div>
            <div className={`flex-1 ${msg.speaker === 'Louis' ? '' : 'text-right'}`}>
              <div
                className={`inline-block px-3 py-2 rounded-lg text-sm ${
                  msg.speaker === 'Louis'
                    ? 'bg-violet-500/20 text-gray-200'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {msg.text}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const activeTabData = tabs.find((t) => t.id === activeTab)!

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
            <LayoutDashboard className="w-4 h-4" />
            Plateforme intuitive
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Suivez et analysez tous vos appels{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              en temps réel
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Une interface claire et intuitive pour piloter vos agents IA vocaux
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto">
          {/* Tabs + Description */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Tabs */}
            <div className="flex md:flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="flex-1 bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">{activeTabData.title}</h3>
              <p className="text-gray-400">{activeTabData.description}</p>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />

            {/* Browser frame */}
            <div className="relative bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
              {/* Browser bar */}
              <div className="h-10 bg-gray-800 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-gray-700 rounded-md flex items-center px-3 text-xs text-gray-400">
                    app.voipia.fr/dashboard
                  </div>
                </div>
              </div>

              {/* Content based on active tab */}
              <div className="min-h-[400px]">
                {activeTab === 'dashboard' && <DashboardMockup />}
                {activeTab === 'history' && <HistoryMockup />}
                {activeTab === 'transcriptions' && <TranscriptionsMockup />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
