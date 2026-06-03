import React, { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { DocumentHeaderConfig } from '@/components/document-header'
import { useModal } from '@/providers/modal-provider'

import { saveConfiguracoes } from '../actions'

export function useConfiguracoesForm(initialConfig: DocumentHeaderConfig | null) {
  const { confirm } = useModal()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados locais para inputs
  const [titulo, setTitulo] = useState(initialConfig?.titulo || '')
  const [secaoSindical, setSecaoSindical] = useState(initialConfig?.secao_sindical || '')
  const [endereco, setEndereco] = useState(initialConfig?.endereco || '')
  const [cep, setCep] = useState(initialConfig?.cep || '')
  const [cnpj, setCnpj] = useState(initialConfig?.cnpj || '')
  const [filiacao, setFiliacao] = useState(initialConfig?.filiacao || '')
  const [fundacao, setFundacao] = useState(initialConfig?.fundacao || '')

  // Estados para gerenciamento de logotipo
  const [logoUrl, setLogoUrl] = useState<string | null>(initialConfig?.logo_url || null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [removerLogo, setRemoverLogo] = useState(false)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('O logotipo deve ter no máximo 2MB.')
        return
      }

      setLogoFile(file)
      setRemoverLogo(false)
      const localUrl = URL.createObjectURL(file)
      setLogoUrl(localUrl)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoUrl(null)
    setRemoverLogo(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleResetToDefault = async () => {
    if (await confirm('Deseja restaurar todos os campos de texto para os valores oficiais padrões do SINASEFE Jataí? (O logotipo atual não será apagado)')) {
      setTitulo('SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA')
      setSecaoSindical('SINASEFE - SEÇÃO SINDICAL JATAÍ')
      setEndereco('RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO')
      setCep('CEP: 75804-020')
      setCnpj('CNPJ: 07.341.258/0001-90')
      setFiliacao('FILIADO À CEA')
      setFundacao('FUNDADO EM 16/05/2005')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const formData = new FormData()
      formData.append('titulo', titulo)
      formData.append('secao_sindical', secaoSindical)
      formData.append('endereco', endereco)
      formData.append('cep', cep)
      formData.append('cnpj', cnpj)
      formData.append('filiacao', filiacao)
      formData.append('fundacao', fundacao)
      formData.append('remover_logo', removerLogo ? 'true' : 'false')

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const result = await saveConfiguracoes(formData)

      if (result.success) {
        toast.success('Configurações de cabeçalho salvas com sucesso em todo o sistema!')
        setLogoFile(null)
      } else {
        toast.error(result.error || 'Erro inesperado ao salvar configurações.')
      }
    })
  }

  const previewConfig: DocumentHeaderConfig = {
    titulo,
    secao_sindical: secaoSindical,
    endereco,
    cep,
    cnpj,
    filiacao,
    fundacao,
    logo_url: logoUrl
  }

  return {
    isPending,
    fileInputRef,
    previewConfig,
    formData: {
      titulo, setTitulo,
      secaoSindical, setSecaoSindical,
      endereco, setEndereco,
      cep, setCep,
      cnpj, setCnpj,
      filiacao, setFiliacao,
      fundacao, setFundacao,
      logoUrl
    },
    actions: {
      handleLogoChange,
      handleRemoveLogo,
      handleResetToDefault,
      handleSubmit
    }
  }
}
