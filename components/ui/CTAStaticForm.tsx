'use client'

import type React from 'react'
import {
  CTAErrorMessage,
  CTAFormFields,
  CTAFormIntro,
  CTASubmitButton,
  useCTAForm,
} from '@/components/ui/cta-form'

interface CTAStaticFormProps {
  onSuccess?: () => void
}

const CTAStaticForm: React.FC<CTAStaticFormProps> = ({ onSuccess }) => {
  const { formData, isSubmitting, error, isFormValid, handleChange, handleSubmit } = useCTAForm({
    source: 'landing_page_tester_nos_agents',
    includeTimestamp: false,
  })

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, onSuccess)
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-violet-600/20 to-purple-600/20 border-b border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">{'\u{1F399}\u{FE0F}'}</span>
          Testez votre futur Agent Vocal IA
        </h2>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <CTAFormIntro />
          <CTAFormFields formData={formData} onChange={handleChange} />
          <CTAErrorMessage error={error} />
          <CTASubmitButton isFormValid={isFormValid} isSubmitting={isSubmitting} />
        </form>
      </div>
    </div>
  )
}

export default CTAStaticForm
