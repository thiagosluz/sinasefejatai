import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { getGestoes } from './actions'
import { BtnNovaGestao } from './btn-nova-gestao'
import ConselhoFiscalCliente from './conselho-fiscal-cliente'

export const metadata = {
  title: 'Conselho Fiscal | SINASEFE JATAÍ',
}

export default async function ConselhoFiscalAdminPage() {
  const gestoes = await getGestoes()

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Conselho Fiscal" subtitulo="Gerencie o histórico e a composição do Conselho Fiscal do sindicato">
        <BtnNovaGestao />
      </AdminPageHeader>
      
      <div className="bg-brand-card border border-brand-border p-6 shadow-xl">
        <ConselhoFiscalCliente gestoesIniciais={gestoes} />
      </div>
    </AdminPageWrapper>
  )
}
