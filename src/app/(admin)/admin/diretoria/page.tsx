import { getGestoes } from './actions'
import DiretoriaCliente from './diretoria-cliente'
import AdminPageHeader from '@/components/admin-page-header'
import AdminPageWrapper from '@/components/admin-page-wrapper'

export const metadata = {
  title: 'Gestão da Diretoria | SINASEFE Jataí',
}

export default async function DiretoriaAdminPage() {
  const gestoes = await getGestoes()

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Diretorias e Gestões" subtitulo="Gerencie o histórico de gestões e a atual diretoria do sindicato" />
      
      <div className="bg-brand-card border border-brand-border p-6 shadow-xl">
        <DiretoriaCliente gestoesIniciais={gestoes} />
      </div>
    </AdminPageWrapper>
  )
}
