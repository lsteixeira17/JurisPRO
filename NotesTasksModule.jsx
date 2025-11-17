import { useState } from 'react'
import { Plus, Edit, Trash2, Check, Clock, FileText, Bell as BellIcon, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

const NotesTasksModule = ({ 
  notes, 
  reminders, 
  tasks, 
  onAddNote, 
  onAddReminder, 
  onAddTask,
  onDeleteNote,
  onDeleteReminder,
  onDeleteTask,
  onToggleTask,
  processos,
  clientes
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState('note') // 'note', 'reminder', 'task'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    time: '',
    priority: 'medium',
    linkedTo: '',
    linkedType: ''
  })

  const openAddModal = (type) => {
    setModalType(type)
    setFormData({
      title: '',
      content: '',
      date: '',
      time: '',
      priority: 'medium',
      linkedTo: '',
      linkedType: ''
    })
    setShowAddModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (modalType === 'note') {
      onAddNote(formData)
    } else if (modalType === 'reminder') {
      onAddReminder(formData)
    } else if (modalType === 'task') {
      onAddTask(formData)
    }
    
    setShowAddModal(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="reminders">Lembretes</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
            </TabsList>

            {/* Tarefas */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tarefas</h3>
                <Button onClick={() => openAddModal('task')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma tarefa cadastrada.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg ${
                        task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-1"
                        >
                          {task.completed ? (
                            <CheckSquare className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{task.content}</p>
                          {task.date && (
                            <p className="text-xs text-gray-400 mt-2">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Vencimento: {formatDate(task.date)}
                            </p>
                          )}
                          {task.linkedTo && (
                            <p className="text-xs text-blue-600 mt-1">
                              Vinculado a: {task.linkedType === 'processo' ? 'Processo' : 'Cliente'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Lembretes */}
            <TabsContent value="reminders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lembretes</h3>
                <Button onClick={() => openAddModal('reminder')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lembrete
                </Button>
              </div>
              
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum lembrete cadastrado.</p>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <BellIcon className="h-5 w-5 text-purple-500 mt-1" />
                          <div>
                            <h4 className="font-medium">{reminder.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{reminder.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatDate(reminder.date)} {reminder.time && `às ${reminder.time}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Anotações */}
            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Anotações</h3>
                <Button onClick={() => openAddModal('note')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Anotação
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">Nenhuma anotação cadastrada.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="h-5 w-5 text-yellow-600" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <h4 className="font-medium mb-2">{note.title}</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      {note.linkedTo && (
                        <p className="text-xs text-blue-600 mt-2">
                          Vinculado a: {note.linkedType === 'processo' ? 'Processo' : 'Cliente'}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Adicionar */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'note' && 'Nova Anotação'}
              {modalType === 'reminder' && 'Novo Lembrete'}
              {modalType === 'task' && 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content">
                {modalType === 'note' ? 'Conteúdo' : 'Descrição'} *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                required
              />
            </div>
            
            {(modalType === 'reminder' || modalType === 'task') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data {modalType === 'task' ? 'de Vencimento' : ''} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                {modalType === 'reminder' && (
                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}
            
            {modalType === 'task' && (
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotesTasksModule
