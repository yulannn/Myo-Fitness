import { mockFriendRequests, mockFriends } from '../data/mockData'

export default function Community() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Communauté</h1>

      {mockFriendRequests.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-900">Demandes ({mockFriendRequests.length})</p>
          <div className="mt-4 space-y-3">
            {mockFriendRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{request.from}</p>
                <p className="mt-1 text-sm text-slate-500">{request.message}</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                    Accepter
                  </button>
                  <button className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Mes amis ({mockFriends.length})</p>
        <div className="mt-4 space-y-3">
          {mockFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <img src={friend.avatarUrl} alt={friend.name} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-900">{friend.name}</p>
                  <p className="text-xs text-slate-500">{friend.streak} jours de streak</p>
                </div>
              </div>
              <button className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                Inviter
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
