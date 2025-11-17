import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Edit, Copy, Trash2 } from 'lucide-react'

const Utils = {
  formatCurrency: (value) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value.toString().replace(/[^\d,.-]/g, '').replace(',', '.')))
  },
  
  formatDate: (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  },
  
  getProcessoStatus: (ultimoEvento) => {
    if (!ultimoEvento) return 'Em Andamento'
    const evento = ultimoEvento.toLowerCase()
    if (evento.includes('julgamento') || evento.includes('sentença')) return 'Julgamento'
    if (evento.includes('arquivado') || evento.includes('baixa')) return 'Arquivado'
    if (evento.includes('petição') || evento.includes('inicial')) return 'Petição'
    return 'Em Andamento'
  },
  
  getStatusColor: (status) => {
    const colors = {
      'Em Andamento': 'bg-blue-100 text-blue-800',
      'Julgamento': 'bg-yellow-100 text-yellow-800',
      'Arquivado': 'bg-gray-100 text-gray-800',
      'Petição': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
}

const ProcessoDetailsModal = ({ open, onOpenChange, processo, onEdit, onDuplicate, onDelete }) => {
  if (!processo) return null

  const status = Utils.getProcessoStatus(processo.ultimoEvento)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Processo</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o processo selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Número do Processo:</span>
            <span>{processo.numero}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Classe:</span>
            <span>{processo.classe}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Autores:</span>
            <span>{processo.autores}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Réus:</span>
            <span>{processo.reus}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Localidade:</span>
            <span>{processo.localidade}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Assunto:</span>
            <span>{processo.assunto}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Último Evento:</span>
            <span>{processo.ultimoEvento}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Data/Hora Evento:</span>
            <span>{processo.dataHoraEvento}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Data Distribuição:</span>
            <span>{Utils.formatDate(processo.dataDistribuicao)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Valor da Causa:</span>
            <span>{Utils.formatCurrency(processo.valorCausa)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Status:</span>
            <Badge className={Utils.getStatusColor(status)}>{status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Criado em:</span>
            <span>{Utils.formatDate(processo.createdAt)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-semibold">Última Atualização:</span>
            <span>{Utils.formatDate(processo.updatedAt)}</span>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(processo)}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" onClick={() => onDuplicate(processo)}>
              <Copy className="h-4 w-4 mr-2" /> Duplicar
            </Button>
          </div>
          <Button variant="destructive" onClick={() => onDelete(processo.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProcessoDetailsModal
