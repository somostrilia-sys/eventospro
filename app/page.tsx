import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">EventosPRO Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Eventos Abertos</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Em Andamento</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Resolvidos</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Média Resolução (dias)</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/eventos" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Ver Eventos
          </Link>
          <Link href="/eventos/novo" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Novo Evento
          </Link>
        </div>
      </div>
    </div>
  )
}
