import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { BoletimForm } from '../../components/boletim-form'

export default async function EditarBoletimPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: boletim, error } = await supabase
    .from('boletins')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !boletim) {
    redirect('/admin/boletins')
  }

  return <BoletimForm boletim={boletim} />
}
