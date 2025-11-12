export default function Profile() {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
          <div className="w-24 h-24 bg-indigo-500 rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-center">John Doe</h2>
          <p className="text-gray-600 text-center">john@example.com</p>
          <button className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
            Éditer le profil
          </button>
        </div>
      </div>
    )
  }