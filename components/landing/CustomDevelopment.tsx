'use client'

import { Code2, HardHat, ShoppingCart, Stethoscope } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'

export function CustomDevelopment() {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-blue-900/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm mb-6">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">Sur-mesure</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Votre besoin est unique ?</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              On construit l&apos;agent qu&apos;il vous faut.
            </span>
          </h2>

          <p className="text-xl text-gray-300 leading-relaxed">
            Louis, Alexandra et Arthur couvrent 90% des besoins commerciaux. Mais votre entreprise a
            peut-être un processus spécifique, un secteur particulier, ou un workflow unique. Nous
            développons des agents vocaux sur-mesure pour répondre exactement à votre besoin.
          </p>
        </div>

        {/* 3 Exemples sectoriels */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card variant="gradient" className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secteur médical</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Agent de prise de RDV pour cabinets médicaux avec gestion des urgences, rappels
              automatiques et intégration dossiers patients.
            </p>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">BTP & artisans</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Agent de gestion de chantiers avec prise de RDV pour devis, relance automatique des
              prospects et coordination avec planning chantiers.
            </p>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">E-commerce</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Agent de support client 24/7 avec gestion des retours, suivi de commandes et upsell
              intelligent selon l&apos;historique d&apos;achat.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            Discuter de mon projet
          </Button>
        </div>
      </div>
    </section>
  )
}
