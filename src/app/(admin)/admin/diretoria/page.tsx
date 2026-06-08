import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { getGestoes } from './actions'
import { BtnNovaGestao } from './btn-nova-gestao'
import DiretoriaCliente from './diretoria-cliente'

export const metadata = {
  title: 'Gestão da Diretoria | SINASEFE Jataí',
}

export default async function DiretoriaAdminPage() {
  const gestoes = await getGestoes()

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Diretorias e Gestões" subtitulo="Gerencie o histórico de gestões e a atual diretoria do sindicato">
        <BtnNovaGestao />
      </AdminPageHeader>
      
      <div className="bg-brand-card border border-brand-border p-6 shadow-xl">
        <DiretoriaCliente gestoesIniciais={gestoes} />
      </div>
    </AdminPageWrapper>
  )
}
