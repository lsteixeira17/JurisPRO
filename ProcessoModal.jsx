import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

const ProcessoModal = ({ open, onOpenChange, processo, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    classe: '',
    autores: '',
    reus: '',
    localidade: '',
    assunto: '',
    ultimoEvento: '',
    dataHoraEvento: '',
    dataDistribuicao: '',
    valorCausa: ''
  })

  useEffect(() => {
    if (processo) {
      setFormData({
        numero: processo.numero || '',
        classe: processo.classe || '',
        autores: processo.autores || '',
        reus: processo.reus || '',
        localidade: processo.localidade || '',
        assunto: processo.assunto || '',
        ultimoEvento: processo.ultimoEvento || '',
        dataHoraEvento: processo.dataHoraEvento || '',
        dataDistribuicao: processo.dataDistribuicao || '',
        valorCausa: processo.valorCausa || ''
      })
    } else {
      setFormData({
        numero: '',
        classe: '',
        autores: '',
        reus: '',
        localidade: '',
        assunto: '',
        ultimoEvento: '',
        dataHoraEvento: '',
        dataDistribuicao: '',
        valorCausa: ''
      })
    }
  }, [processo, open])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = () => {
    if (processo) {
      onSave(processo.id, formData)
    } else {
      onSave(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{processo ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
          <DialogDescription>
            {processo ? 'Edite os detalhes do processo existente.' : 'Preencha os campos para adicionar um novo processo.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numero" className="text-right">Número</Label>
            <Input id="numero" value={formData.numero} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classe" className="text-right">Classe</Label>
            <Input id="classe" value={formData.classe} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="autores" className="text-right">Autores</Label>
            <Input id="autores" value={formData.autores} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reus" className="text-right">Réus</Label>
            <Input id="reus" value={formData.reus} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="localidade" className="text-right">Localidade</Label>
            <Input id="localidade" value={formData.localidade} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assunto" className="text-right">Assunto</Label>
            <Textarea id="assunto" value={formData.assunto} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ultimoEvento" className="text-right">Último Evento</Label>
            <Textarea id="ultimoEvento" value={formData.ultimoEvento} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataHoraEvento" className="text-right">Data/Hora Evento</Label>
            <Input id="dataHoraEvento" type="datetime-local" value={formData.dataHoraEvento} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataDistribuicao" className="text-right">Data Distribuição</Label>
            <Input id="dataDistribuicao" type="date" value={formData.dataDistribuicao} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valorCausa" className="text-right">Valor da Causa</Label>
            <Input id="valorCausa" value={formData.valorCausa} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSubmit}>{processo ? 'Salvar Alterações' : 'Adicionar Processo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProcessoModal
