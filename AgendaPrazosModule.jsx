import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

const AgendaPrazosModule = ({ 
  eventos, 
  onAddEvento, 
  onUpdateEvento,
  onDeleteEvento,
  processos,
  clientes 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState(null)
  const [eventForm, setEventForm] = useState({
    titulo: '',
    tipo: '',
    data: '',
    hora: '',
    duracao: '',
    descricao: '',
    local: '',
    vinculadoA: '',
    vinculadoId: '',
    prioridade: 'normal',
    status: 'pendente'
  })

  // Tipos de eventos
  const tiposEvento = [
    'Audiência',
    'Prazo Processual',
    'Reunião',
    'Consulta',
    'Vencimento',
    'Outros'
  ]

  // Prioridades
  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
    { value: 'normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' }
  ]

  // Status
  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-blue-100 text-blue-800' }
  ]

  // Funções de calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString
  }

  // Verificar se há eventos em uma data específica
  const getEventosForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return eventos.filter(e => e.data === dateStr)
  }

  // Verificar se um prazo está próximo (7 dias)
  const isPrazoProximo = (dataStr) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataPrazo = new Date(dataStr)
    const diffTime = dataPrazo - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  // Verificar se um prazo está vencido
  const isPrazoVencido = (dataStr) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataPrazo = new Date(dataStr)
    return dataPrazo < hoje
  }

  // Filtrar eventos
  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.local?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = !selectedTipo || evento.tipo === selectedTipo
    return matchesSearch && matchesTipo
  })

  // Ordenar eventos por data e hora
  const sortedEventos = [...filteredEventos].sort((a, b) => {
    const dateA = new Date(`${a.data} ${a.hora || '00:00'}`)
    const dateB = new Date(`${b.data} ${b.hora || '00:00'}`)
    return dateA - dateB
  })

  // Estatísticas
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const stats = {
    total: eventos.length,
    hoje: eventos.filter(e => e.data === hoje.toISOString().split('T')[0]).length,
    proximos7dias: eventos.filter(e => isPrazoProximo(e.data) && !isPrazoVencido(e.data)).length,
    vencidos: eventos.filter(e => isPrazoVencido(e.data) && e.status === 'pendente').length
  }

  // Handler para abrir modal de edição
  const handleEdit = (evento) => {
    setEditingEvento(evento)
    setEventForm({
      titulo: evento.titulo,
      tipo: evento.tipo,
      data: evento.data,
      hora: evento.hora || '',
      duracao: evento.duracao || '',
      descricao: evento.descricao || '',
      local: evento.local || '',
      vinculadoA: evento.vinculadoA || '',
      vinculadoId: evento.vinculadoId || '',
      prioridade: evento.prioridade || 'normal',
      status: evento.status || 'pendente'
    })
    setShowEventModal(true)
  }

  // Handler para salvar evento
  const handleSave = () => {
    if (!eventForm.titulo || !eventForm.tipo || !eventForm.data) {
      alert('Por favor, preencha os campos obrigatórios: Título, Tipo e Data')
      return
    }

    if (editingEvento) {
      onUpdateEvento(editingEvento.id, eventForm)
    } else {
      onAddEvento(eventForm)
    }

    setShowEventModal(false)
    setEditingEvento(null)
    setEventForm({
      titulo: '',
      tipo: '',
      data: '',
      hora: '',
      duracao: '',
      descricao: '',
      local: '',
      vinculadoA: '',
      vinculadoId: '',
      prioridade: 'normal',
      status: 'pendente'
    })
  }

  // Renderizar calendário
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const eventosNoDia = getEventosForDate(day)
      const isToday = day === hoje.getDate() && 
                      currentDate.getMonth() === hoje.getMonth() && 
                      currentDate.getFullYear() === hoje.getFullYear()
      
      days.push(
        <div
          key={day}
          className={`p-2 border rounded cursor-pointer hover:bg-gray-50 min-h-[80px] ${
            isToday ? 'bg-blue-50 border-blue-500' : ''
          }`}
          onClick={() => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            setEventForm({ ...eventForm, data: dateStr })
            setShowEventModal(true)
          }}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {eventosNoDia.slice(0, 2).map(evento => (
              <div
                key={evento.id}
                className={`text-xs p-1 rounded truncate ${
                  evento.prioridade === 'urgente' ? 'bg-red-100 text-red-800' :
                  evento.prioridade === 'alta' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}
                title={evento.titulo}
              >
                {evento.hora && `${evento.hora} `}{evento.titulo}
              </div>
            ))}
            {eventosNoDia.length > 2 && (
              <div className="text-xs text-gray-500">+{eventosNoDia.length - 2} mais</div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Eventos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eventos Hoje</p>
                <p className="text-2xl font-bold">{stats.hoje}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Próximos 7 Dias</p>
                <p className="text-2xl font-bold">{stats.proximos7dias}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Prazos Vencidos</p>
                <p className="text-2xl font-bold">{stats.vencidos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Calendário</span>
              <Button onClick={() => {
                setEditingEvento(null)
                setEventForm({
                  titulo: '',
                  tipo: '',
                  data: '',
                  hora: '',
                  duracao: '',
                  descricao: '',
                  local: '',
                  vinculadoA: '',
                  vinculadoId: '',
                  prioridade: 'normal',
                  status: 'pendente'
                })
                setShowEventModal(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCalendar()}
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <div className="space-y-2 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Todos os Tipos</option>
                {tiposEvento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {sortedEventos.length > 0 ? (
              <div className="space-y-3">
                {sortedEventos.map(evento => {
                  const prioridade = prioridades.find(p => p.value === evento.prioridade)
                  const status = statusOptions.find(s => s.value === evento.status)
                  const isVencido = isPrazoVencido(evento.data) && evento.status === 'pendente'
                  
                  return (
                    <div
                      key={evento.id}
                      className={`p-3 border rounded-lg hover:shadow-md transition-shadow ${
                        isVencido ? 'border-red-300 bg-red-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{evento.titulo}</h4>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(evento)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteEvento(evento.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {formatDate(evento.data)}
                          {evento.hora && ` às ${formatTime(evento.hora)}`}
                        </p>
                        {evento.local && <p>📍 {evento.local}</p>}
                        {evento.descricao && (
                          <p className="text-gray-500 line-clamp-2">{evento.descricao}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {evento.tipo}
                        </Badge>
                        {prioridade && (
                          <Badge className={`text-xs ${prioridade.color}`}>
                            {prioridade.label}
                          </Badge>
                        )}
                        {status && (
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        )}
                        {isVencido && (
                          <Badge className="text-xs bg-red-100 text-red-800">
                            Vencido
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm || selectedTipo 
                    ? 'Nenhum evento encontrado.' 
                    : 'Nenhum evento cadastrado.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingEvento ? 'Editar Evento' : 'Novo Evento'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEventModal(false)
                    setEditingEvento(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título *
                  </label>
                  <Input
                    value={eventForm.titulo}
                    onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                    placeholder="Ex: Audiência de Instrução"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo *
                    </label>
                    <select
                      value={eventForm.tipo}
                      onChange={(e) => setEventForm({ ...eventForm, tipo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Selecione</option>
                      {tiposEvento.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data *
                    </label>
                    <Input
                      type="date"
                      value={eventForm.data}
                      onChange={(e) => setEventForm({ ...eventForm, data: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hora
                    </label>
                    <Input
                      type="time"
                      value={eventForm.hora}
                      onChange={(e) => setEventForm({ ...eventForm, hora: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duração (minutos)
                    </label>
                    <Input
                      type="number"
                      value={eventForm.duracao}
                      onChange={(e) => setEventForm({ ...eventForm, duracao: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Local
                  </label>
                  <Input
                    value={eventForm.local}
                    onChange={(e) => setEventForm({ ...eventForm, local: e.target.value })}
                    placeholder="Ex: Fórum Central - Sala 201"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={eventForm.descricao}
                    onChange={(e) => setEventForm({ ...eventForm, descricao: e.target.value })}
                    placeholder="Detalhes do evento"
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prioridade
                    </label>
                    <select
                      value={eventForm.prioridade}
                      onChange={(e) => setEventForm({ ...eventForm, prioridade: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {prioridades.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vincular a
                    </label>
                    <select
                      value={eventForm.vinculadoA}
                      onChange={(e) => {
                        setEventForm({ ...eventForm, vinculadoA: e.target.value, vinculadoId: '' })
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Nenhum</option>
                      <option value="Processo">Processo</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                  </div>

                  {eventForm.vinculadoA && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {eventForm.vinculadoA}
                      </label>
                      <select
                        value={eventForm.vinculadoId}
                        onChange={(e) => setEventForm({ ...eventForm, vinculadoId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecione</option>
                        {eventForm.vinculadoA === 'Processo' && processos.map(p => (
                          <option key={p.id} value={p.id}>{p.numero}</option>
                        ))}
                        {eventForm.vinculadoA === 'Cliente' && clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvento(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingEvento ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AgendaPrazosModule
