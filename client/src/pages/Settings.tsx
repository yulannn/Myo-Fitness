export default function Settings() {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Paramètres</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-gray-600">Activées</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="font-medium">Langue</p>
            <p className="text-sm text-gray-600">Français</p>
          </div>
          <button className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition">
            Déconnexion
          </button>
        </div>
      </div>
    )
  }