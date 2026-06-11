import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

import { getGestaoById } from '../actions'

import GestaoMembrosCliente from './gestao-membros-cliente'

export const metadata = {
  title: 'Membros da Gestão | SINASEFE Jataí',
}

export default async function GestaoMembrosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let gestao
  try {
    gestao = await getGestaoById(id)
  } catch {
    notFound()
  }

  const supabase = await createClient()
  const { data: filiados } = await supabase
    .from('filiados')
    .select('id, nome, perfis(id)')
    .order('nome', { ascending: true })

  return (
    <AdminPageWrapper>
      <div className="mb-2">
        <Link href="/admin/diretoria" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors">
          <ArrowLeft size={14} /> Voltar para Gestões
        </Link>
      </div>
      <AdminPageHeader titulo={`Gestão: ${gestao.nome}`} subtitulo="Gerencie as cadeiras fixas (estatutárias) e adicione cargos extras" />
      
      <GestaoMembrosCliente gestao={gestao} filiados={filiados || []} />
    </AdminPageWrapper>
  )
}
