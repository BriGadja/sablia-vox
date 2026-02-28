'use client'

import { Check, TrendingUp, X } from 'lucide-react'
import { Card } from '@/components/shared/Card'

const comparisonData = [
  {
    category: 'Coût mensuel',
    sdr: '3 500€ - 5 000€',
    voipia: '190€ - 490€',
    advantage: 'voipia',
  },
  {
    category: 'Disponibilité',
    sdr: '8h/jour (congés, absences)',
    voipia: '24/7 sans interruption',
    advantage: 'voipia',
  },
  {
    category: 'Appels par jour',
    sdr: '40-60 appels',
    voipia: 'Illimité (500+ appels)',
    advantage: 'voipia',
  },
  {
    category: 'Temps de formation',
    sdr: '2-4 semaines',
    voipia: '< 10 minutes',
    advantage: 'voipia',
  },
  {
    category: 'Cohérence du discours',
    sdr: 'Variable selon humeur',
    voipia: '100% conforme au script',
    advantage: 'voipia',
  },
  {
    category: 'Analyse des données',
    sdr: 'Manuelle et chronophage',
    voipia: 'Automatique et temps réel',
    advantage: 'voipia',
  },
  {
    category: 'Scalabilité',
    sdr: 'Recrutement = +1-2 mois',
    voipia: 'Instantanée (1 clic)',
    advantage: 'voipia',
  },
  {
    category: 'ROI moyen',
    sdr: '150-200%',
    voipia: '800%+ en 3 mois',
    advantage: 'voipia',
  },
]

export function SDRComparison() {
  return (
    <section className="py-24 relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">Comparatif objectif</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">SDR classique</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              vs Agent IA VoIPIA
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Découvrez pourquoi plus de 50 entreprises ont déjà fait le choix de
            l&apos;automatisation.
          </p>
        </div>

        {/* Comparison table */}
        <Card variant="gradient" className="max-w-5xl mx-auto overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Critère
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                SDR Humain
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-700/50 text-xs text-gray-300">
                👤 Traditionnel
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-1">
                Agent VoIPIA
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-orange-600 to-amber-600 text-xs text-white font-semibold">
                🤖 IA Vocale
              </div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/5">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-4 p-6 hover:bg-white/5 transition-colors"
              >
                {/* Category */}
                <div className="flex items-center">
                  <p className="font-semibold text-white">{row.category}</p>
                </div>

                {/* SDR value */}
                <div className="flex items-center justify-center text-center">
                  <div className="space-y-1">
                    <p className="text-gray-300 text-sm">{row.sdr}</p>
                    {row.advantage !== 'sdr' && <X className="w-4 h-4 text-red-400 mx-auto" />}
                  </div>
                </div>

                {/* VoIPIA value */}
                <div className="flex items-center justify-center text-center">
                  <div className="space-y-1">
                    <p className="text-white font-semibold text-sm">{row.voipia}</p>
                    {row.advantage === 'voipia' && (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom summary */}
          <div className="p-6 bg-gradient-to-r from-orange-900/20 to-amber-900/20 border-t border-orange-500/20">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">-90%</p>
                <p className="text-xs text-gray-400">de coûts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">x10</p>
                <p className="text-xs text-gray-400">de volume</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">800%</p>
                <p className="text-xs text-gray-400">ROI moyen</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            💡 <strong className="text-white">L&apos;humain reste indispensable</strong> pour
            conclure les deals complexes.
            <br />
            Voipia s&apos;occupe de la qualification et du premier contact, vos équipes se
            concentrent sur la conversion.
          </p>
        </div>
      </div>
    </section>
  )
}
