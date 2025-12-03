export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-jewel-panel/80 p-8 shadow-xl shadow-black/40">
        <h1 className="mb-4 text-2xl font-semibold">Zaloguj się</h1>
        <p className="mb-6 text-sm text-white/60">
          Tu podłączysz później backend Spring z JWT.
        </p>
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/80">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/80">Hasło</label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 px-4 py-2 text-sm font-medium text-black shadow-lg shadow-purple-500/40"
          >
            Zaloguj
          </button>
        </form>
      </div>
    </div>
  );
}