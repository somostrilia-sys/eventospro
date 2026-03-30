'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NovoEventoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    associado_nome: '',
    associado_cpf: '',
    veiculo_placa: '',
    veiculo_modelo: '',
    tipo: 'colisao',
    descricao: '',
    responsavel_nome: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('eventos').insert([form])
    if (!error) router.push('/eventos')
    else alert('Erro ao criar evento: ' + error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Evento</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Associado</label>
            <input
              type="text"
              value={form.associado_nome}
              onChange={(e) => setForm({ ...form, associado_nome: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={form.associado_cpf}
              onChange={(e) => setForm({ ...form, associado_cpf: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa do Veículo</label>
              <input
                type="text"
                value={form.veiculo_placa}
                onChange={(e) => setForm({ ...form, veiculo_placa: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                value={form.veiculo_modelo}
                onChange={(e) => setForm({ ...form, veiculo_modelo: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sinistro</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="colisao">Colisão</option>
              <option value="furto">Furto</option>
              <option value="roubo">Roubo</option>
              <option value="incendio">Incêndio</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <input
              type="text"
              value={form.responsavel_nome}
              onChange={(e) => setForm({ ...form, responsavel_nome: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Criar Evento
            </button>
            <button type="button" onClick={() => router.push('/eventos')} className="border px-6 py-2 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
