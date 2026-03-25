import { Bell, Key, Settings, Shield, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parametres | Sablia Vox Dashboard',
  description: 'Configurez vos preferences et parametres de compte',
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-violet-400" />
            <h1 className="text-3xl font-bold text-white">Parametres</h1>
          </div>
          <p className="text-gray-400">Gerez vos preferences et la configuration de votre compte</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Profil</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Les informations de profil sont gerees via votre compte Supabase Auth.
            </p>
          </div>

          {/* Notifications Section */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            <p className="text-gray-400 text-sm">Configuration des notifications a venir.</p>
          </div>

          {/* Security Section */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Securite</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Parametres de securite et authentification a deux facteurs a venir.
            </p>
          </div>

          {/* API Keys Section */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Cles API</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Gestion des cles API pour les integrations externes a venir.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-800/20 border border-gray-700/20 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            Cette page de parametres sera enrichie avec plus de fonctionnalites dans les prochaines
            mises a jour.
          </p>
        </div>
      </div>
    </div>
  )
}
