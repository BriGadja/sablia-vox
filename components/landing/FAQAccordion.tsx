'use client'

import { ChevronDown, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import type { FAQItem } from '@/lib/types/landing'

interface FAQAccordionProps {
  faqs: FAQItem[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Questions fréquentes</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Vous avez des questions ?</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              On a les réponses.
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Tout ce que vous devez savoir sur VoIPIA et nos agents IA vocaux.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <Card
                key={index}
                variant="gradient"
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-purple-500/30' : ''
                }`}
              >
                {/* Question button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0 border-t border-white/5">
                    <p className="text-gray-300 leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">Vous ne trouvez pas la réponse à votre question ?</p>
          <button className="text-purple-400 font-semibold hover:text-purple-300 transition-colors underline">
            Contactez notre équipe support
          </button>
        </div>
      </div>
    </section>
  )
}
