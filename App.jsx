import { useState, useEffect } from 'react'
import ProcessoModal from './ProcessoModal.jsx'
import ProcessoDetailsModal from './ProcessoDetailsModal.jsx'
import ClienteModal from './ClienteModal.jsx'
import AgendaPrazosModule from './AgendaPrazosModule.jsx' // NOVO
import DocumentosModule from './DocumentosModule.jsx'     // NOVO
import FinanceiroModule from './FinanceiroModule.jsx'     // NOVO
import NotesTasksModule from './NotesTasksModule.jsx'     // NOVO
import NotificationSystem from './NotificationSystem.jsx' // NOVO

import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

import { 
  Scale, 
  Gavel, 
  Calendar, 
  Users, 
  DollarSign, 
  FolderOpen, 
  BarChart3, 
  Bell, 
  Plus, 
  Search, 
  FileText, 
  FileDown, 
  Edit, 
  Copy, 
  Trash2,
  Menu,
  X,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

// Configurações do aplicativo
const APP_CONFIG = {
  version: '2.0',
  storageKeys: {
    processos: 'juristech_processos',
    clientes: 'juristech_clientes',
    transacoes: 'juristech_transacoes',
    documentos: 'juristech_documentos',
    audit: 'juristech_audit',
    eventos: 'juristech_eventos',       // NOVO
    notes: 'juristech_notes',           // NOVO
    reminders: 'juristech_reminders',   // NOVO
    tasks: 'juristech_tasks',           // NOVO
    notifications: 'juristech_notifications' // NOVO
  }
}

// Estado global da aplicação
const initialState = {
  processos: [],
  clientes: [],
  transacoes: [],
  documentos: [],
  auditLog: [],
  eventos: [],      // NOVO
  notes: [],        // NOVO
  reminders: [],    // NOVO
  tasks: [],        // NOVO
  currentPage: 'dashboard',
  sidebarOpen: false,
  filters: {
    status: '',
    localidade: ''
  },
  sortField: null,
  sortDirection: 'asc',
  pagination: {
    currentPage: 1,
    itemsPerPage: 10
  }
}

// Utilitários
const Utils = {
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
  
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

// Gerenciador de dados
const DataManager = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Erro ao salvar dados:', e)
      return false
    }
  },
  
  load: (key) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Erro ao carregar dados:', e)
      return []
    }
  }
}

function App() {
  const [appState, setAppState] = useState(initialState)
  const [notifications, setNotifications] = useState([]) // NOVO: Para NotificationSystem
  const [selectedProcesso, setSelectedProcesso] = useState(null)
  const [showProcessoModal, setShowProcessoModal] = useState(false)
  const [showAddProcessoModal, setShowAddProcessoModal] = useState(false)
  const [showAddClienteModal, setShowAddClienteModal] = useState(false)
  const [editingProcesso, setEditingProcesso] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadedState = {
      ...initialState,
      processos: DataManager.load(APP_CONFIG.storageKeys.processos),
      clientes: DataManager.load(APP_CONFIG.storageKeys.clientes),
      transacoes: DataManager.load(APP_CONFIG.storageKeys.transacoes),
      documentos: DataManager.load(APP_CONFIG.storageKeys.documentos),
      auditLog: DataManager.load(APP_CONFIG.storageKeys.audit),
      eventos: DataManager.load(APP_CONFIG.storageKeys.eventos),   // NOVO
      notes: DataManager.load(APP_CONFIG.storageKeys.notes),       // NOVO
      reminders: DataManager.load(APP_CONFIG.storageKeys.reminders), // NOVO
      tasks: DataManager.load(APP_CONFIG.storageKeys.tasks),       // NOVO
    }
    setAppState(loadedState)
    setNotifications(DataManager.load(APP_CONFIG.storageKeys.notifications)) // Carrega notificações separadamente
  }, [])

  // Salvar dados do appState sempre que o estado mudar
  useEffect(() => {
    DataManager.save(APP_CONFIG.storageKeys.processos, appState.processos)
    DataManager.save(APP_CONFIG.storageKeys.clientes, appState.clientes)
    DataManager.save(APP_CONFIG.storageKeys.transacoes, appState.transacoes)
    DataManager.save(APP_CONFIG.storageKeys.documentos, appState.documentos)
    DataManager.save(APP_CONFIG.storageKeys.audit, appState.auditLog)
    DataManager.save(APP_CONFIG.storageKeys.eventos, appState.eventos)     // NOVO
    DataManager.save(APP_CONFIG.storageKeys.notes, appState.notes)         // NOVO
    DataManager.save(APP_CONFIG.storageKeys.reminders, appState.reminders) // NOVO
    DataManager.save(APP_CONFIG.storageKeys.tasks, appState.tasks)         // NOVO
  }, [appState.processos, appState.clientes, appState.transacoes, appState.documentos, appState.auditLog, appState.eventos, appState.notes, appState.reminders, appState.tasks])

  // Salvar notificações separadamente
  useEffect(() => {
    DataManager.save(APP_CONFIG.storageKeys.notifications, notifications)
  }, [notifications])


  // Sistema de Auditoria (Audit Log)
  const addAuditLogEntry = (action, details, entityType, entityId) => {
    const logEntry = {
      id: Utils.generateId(),
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      entityType: entityType,
      entityId: entityId,
    }
    setAppState(prev => ({
      ...prev,
      auditLog: [logEntry, ...prev.auditLog.slice(0, 99)] // Limita o log a 100 entradas
    }))
  }

  // Sistema de Notificações
  const addAppNotification = (message, type = 'info', title = 'Notificação') => {
    const newNotification = {
      id: Utils.generateId(),
      title: title,
      message: message,
      type: type,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id)
    // Implementar lógica para navegar para a página relevante, se necessário
    // Ex: if (notification.type === 'prazo') setAppState(prev => ({...prev, currentPage: 'agenda'}))
  }

  // Adicionar processo
  const addProcesso = (processoData) => {
    const processo = {
      id: Utils.generateId(),
      ...processoData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setAppState(prev => ({
      ...prev,
      processos: [processo, ...prev.processos]
    }))
    
    addAuditLogEntry('Processo Adicionado', `Processo "${processo.numero}" cadastrado.`, 'Processo', processo.id)
    addAppNotification('Processo cadastrado com sucesso!', 'success', 'Sucesso')
    setShowAddProcessoModal(false)
  }

  // Atualizar processo
  const updateProcesso = (id, processoData) => {
    setAppState(prev => ({
      ...prev,
      processos: prev.processos.map(p => 
        p.id === id 
          ? { ...p, ...processoData, updatedAt: new Date().toISOString() }
          : p
      )
    }))
    
    addAuditLogEntry('Processo Atualizado', `Processo "${processoData.numero}" atualizado.`, 'Processo', id)
    addAppNotification('Processo atualizado com sucesso!', 'success', 'Sucesso')
    setShowAddProcessoModal(false)
    setEditingProcesso(null)
  }

  // Excluir processo
  const deleteProcesso = (id) => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      setAppState(prev => ({
        ...prev,
        processos: prev.processos.filter(p => p.id !== id)
      }))
      addAuditLogEntry('Processo Excluído', `Processo ${id} excluído.`, 'Processo', id)
      addAppNotification('Processo excluído com sucesso!', 'success', 'Sucesso')
      setShowProcessoModal(false)
    }
  }

  // Duplicar processo
  const duplicateProcesso = (processo) => {
    const duplicado = {
      ...processo,
      id: Utils.generateId(),
      numero: processo.numero + ' (CÓPIA)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setAppState(prev => ({
      ...prev,
      processos: [duplicado, ...prev.processos]
    }))
    
    addAuditLogEntry('Processo Duplicado', `Processo "${duplicado.numero}" duplicado.`, 'Processo', duplicado.id)
    addAppNotification('Processo duplicado com sucesso!', 'success', 'Sucesso')
  }

  // Adicionar cliente
  const addCliente = (clienteData) => {
    const cliente = {
      id: Utils.generateId(),
      ...clienteData,
      createdAt: new Date().toISOString()
    }
    
    setAppState(prev => ({
      ...prev,
      clientes: [cliente, ...prev.clientes]
    }))
    
    addAuditLogEntry('Cliente Adicionado', `Cliente "${cliente.nome}" cadastrado.`, 'Cliente', cliente.id)
    addAppNotification('Cliente cadastrado com sucesso!', 'success', 'Sucesso')
    setShowAddClienteModal(false)
  }

  // Funções CRUD para Eventos (Agenda & Prazos) - NOVO
  const addEvento = (eventData) => {
    const evento = { id: Utils.generateId(), ...eventData };
    setAppState(prev => ({ ...prev, eventos: [evento, ...prev.eventos] }));
    addAuditLogEntry('Evento Adicionado', `Evento "${evento.titulo}" adicionado.`, 'Evento', evento.id);
    addAppNotification(`Evento "${evento.titulo}" adicionado com sucesso!`, 'success', 'Sucesso');
  };

  const updateEvento = (id, eventData) => {
    setAppState(prev => ({
      ...prev,
      eventos: prev.eventos.map(e => e.id === id ? { ...e, ...eventData } : e)
    }));
    addAuditLogEntry('Evento Atualizado', `Evento "${eventData.titulo}" atualizado.`, 'Evento', id);
    addAppNotification(`Evento "${eventData.titulo}" atualizado com sucesso!`, 'success', 'Sucesso');
  };

  const deleteEvento = (id) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      setAppState(prev => ({ ...prev, eventos: prev.eventos.filter(e => e.id !== id) }));
      addAuditLogEntry('Evento Excluído', `Evento ${id} excluído.`, 'Evento', id);
      addAppNotification('Evento excluído com sucesso!', 'success', 'Sucesso');
    }
  };

  // Funções CRUD para Documentos - NOVO
  const addDocumento = (docData) => {
    const documento = { id: Utils.generateId(), ...docData };
    setAppState(prev => ({ ...prev, documentos: [documento, ...prev.documentos] }));
    addAuditLogEntry('Documento Adicionado', `Documento "${documento.nome}" adicionado.`, 'Documento', documento.id);
    addAppNotification(`Documento "${documento.nome}" adicionado com sucesso!`, 'success', 'Sucesso');
  };

  const onDeleteDocumento = (id) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      setAppState(prev => ({ ...prev, documentos: prev.documentos.filter(d => d.id !== id) }));
      addAuditLogEntry('Documento Excluído', `Documento ${id} excluído.`, 'Documento', id);
      addAppNotification('Documento excluído com sucesso!', 'success', 'Sucesso');
    }
  };

  // Funções CRUD para Transações (Financeiro) - NOVO
  const addTransacao = (transactionData) => {
    const transacao = { id: Utils.generateId(), ...transactionData };
    setAppState(prev => ({ ...prev, transacoes: [transacao, ...prev.transacoes] }));
    addAuditLogEntry('Transação Adicionada', `Transação de ${transactionData.valor} adicionada.`, 'Transação', transacao.id);
    addAppNotification('Transação adicionada com sucesso!', 'success', 'Sucesso');
  };

  const updateTransacao = (id, transactionData) => {
    setAppState(prev => ({
      ...prev,
      transacoes: prev.transacoes.map(t => t.id === id ? { ...t, ...transactionData } : t)
    }));
    addAuditLogEntry('Transação Atualizada', `Transação ${id} atualizada.`, 'Transação', id);
    addAppNotification('Transação atualizada com sucesso!', 'success', 'Sucesso');
  };

  const onDeleteTransacao = (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setAppState(prev => ({ ...prev, transacoes: prev.transacoes.filter(t => t.id !== id) }));
      addAuditLogEntry('Transação Excluída', `Transação ${id} excluída.`, 'Transação', id);
      addAppNotification('Transação excluída com sucesso!', 'success', 'Sucesso');
    }
  };

  // Funções CRUD para Notas, Lembretes e Tarefas (NotesTasksModule) - NOVO
  const addNote = (noteData) => {
    const note = { id: Utils.generateId(), ...noteData, createdAt: new Date().toISOString() };
    setAppState(prev => ({ ...prev, notes: [note, ...prev.notes] }));
    addAuditLogEntry('Anotação Adicionada', `Anotação "${note.title}" adicionada.`, 'Anotação', note.id);
    addAppNotification(`Anotação "${note.title}" adicionada com sucesso!`, 'success', 'Sucesso');
  };

  const deleteNote = (id) => {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      setAppState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
      addAuditLogEntry('Anotação Excluída', `Anotação ${id} excluída.`, 'Anotação', id);
      addAppNotification('Anotação excluída com sucesso!', 'success', 'Sucesso');
    }
  };

  const addReminder = (reminderData) => {
    const reminder = { id: Utils.generateId(), ...reminderData, createdAt: new Date().toISOString() };
    setAppState(prev => ({ ...prev, reminders: [reminder, ...prev.reminders] }));
    addAuditLogEntry('Lembrete Adicionado', `Lembrete "${reminder.title}" adicionado.`, 'Lembrete', reminder.id);
    addAppNotification(`Lembrete "${reminder.title}" adicionado com sucesso!`, 'success', 'Sucesso');
  };

  const deleteReminder = (id) => {
    if (confirm('Tem certeza que deseja excluir este lembrete?')) {
      setAppState(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
      addAuditLogEntry('Lembrete Excluído', `Lembrete ${id} excluído.`, 'Lembrete', id);
      addAppNotification('Lembrete excluído com sucesso!', 'success', 'Sucesso');
    }
  };

  const addTask = (taskData) => {
    const task = { id: Utils.generateId(), ...taskData, completed: false, createdAt: new Date().toISOString() };
    setAppState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    addAuditLogEntry('Tarefa Adicionada', `Tarefa "${task.title}" adicionada.`, 'Tarefa', task.id);
    addAppNotification(`Tarefa "${task.title}" adicionada com sucesso!`, 'success', 'Sucesso');
  };

  const deleteTask = (id) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setAppState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
      addAuditLogEntry('Tarefa Excluída', `Tarefa ${id} excluída.`, 'Tarefa', id);
      addAppNotification('Tarefa excluída com sucesso!', 'success', 'Sucesso');
    }
  };

  const toggleTask = (id) => {
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
    addAuditLogEntry('Tarefa Concluída/Incompleta', `Status da tarefa ${id} alterado.`, 'Tarefa', id);
    addAppNotification('Status da tarefa atualizado!', 'info', 'Info');
  };


  // Exportar dados para CSV
  const exportToCSV = () => {
    if (appState.processos.length === 0) {
      addAppNotification('Nenhum processo para exportar.', 'warning', 'Aviso')
      return
    }
    
    const headers = ['Número Processo', 'Classe', 'Autores', 'Réus', 'Localidade', 'Assunto', 
                    'Último Evento', 'Data/Hora Evento', 'Data Distribuição', 'Valor da Causa']
    
    const rows = appState.processos.map(p => [
      p.numero, p.classe, p.autores, p.reus, p.localidade, p.assunto,
      p.ultimoEvento, p.dataHoraEvento, p.dataDistribuicao, p.valorCausa
    ].map(field => `"${field || ''}"`))
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `processos-${new Date().getTime()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    addAppNotification('Processos exportados com sucesso!', 'success', 'Sucesso')
  }

  // Importar CSV
  const importCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target.result
        const lines = csvText.split('\n')
        let addedCount = 0
        
        // Pular cabeçalho
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const values = line.split(',').map(v => v.replace(/"/g, '').trim())
          if (values.length >= 10) {
            const processoData = {
              numero: values[0],
              classe: values[1],
              autores: values[2],
              reus: values[3],
              localidade: values[4],
              assunto: values[5],
              ultimoEvento: values[6],
              dataHoraEvento: values[7],
              dataDistribuicao: values[8],
              valorCausa: values[9]
            }
            
            addProcesso(processoData)
            addedCount++
          }
        }
        
        addAppNotification(`${addedCount} processos importados com sucesso!`, 'success', 'Sucesso')
      } catch (error) {
        console.error('Erro ao importar CSV:', error)
        addAppNotification('Erro ao importar arquivo CSV.', 'error', 'Erro')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Limpar input
  }

  // Fazer backup
  const exportBackup = () => {
    const backup = {
      version: APP_CONFIG.version,
      timestamp: new Date().toISOString(),
      data: {
        processos: appState.processos,
        clientes: appState.clientes,
        transacoes: appState.transacoes,
        documentos: appState.documentos,
        auditLog: appState.auditLog,
        eventos: appState.eventos,
        notes: appState.notes,
        reminders: appState.reminders,
        tasks: appState.tasks,
        notifications: notifications // Incluir notificações no backup
      }
    }
    
    const dataStr = JSON.stringify(backup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `juristech-backup-${new Date().getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    addAppNotification('Backup realizado com sucesso!', 'success', 'Sucesso')
  }

  // Restaurar backup
  const importBackup = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result)
        
        if (!backup.version || !backup.data) {
          throw new Error('Formato de backup inválido')
        }
        
        if (confirm('Deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
          setAppState(prev => ({
            ...prev,
            processos: backup.data.processos || [],
            clientes: backup.data.clientes || [],
            transacoes: backup.data.transacoes || [],
            documentos: backup.data.documentos || [],
            auditLog: backup.data.auditLog || [],
            eventos: backup.data.eventos || [],   // NOVO
            notes: backup.data.notes || [],       // NOVO
            reminders: backup.data.reminders || [], // NOVO
            tasks: backup.data.tasks || [],       // NOVO
          }))
          setNotifications(backup.data.notifications || []) // Restaura notificações
          
          addAppNotification('Backup restaurado com sucesso!', 'success', 'Sucesso')
        }
      } catch (error) {
        console.error('Erro ao restaurar backup:', error)
        addAppNotification('Erro ao restaurar backup. Arquivo inválido.', 'error', 'Erro')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Limpar input
  }

  // Filtrar e pesquisar processos
  const getFilteredProcessos = () => {
    let filtered = [...appState.processos]
    
    // Aplicar pesquisa
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.assunto?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Aplicar filtros
    if (appState.filters.status) {
      filtered = filtered.filter(p => 
        Utils.getProcessoStatus(p.ultimoEvento) === appState.filters.status
      )
    }
    
    if (appState.filters.localidade) {
      filtered = filtered.filter(p => 
        p.localidade === appState.filters.localidade
      )
    }
    
    return filtered
  }

  // Calcular estatísticas do dashboard
  const getDashboardStats = () => {
    const processos = appState.processos
    const totalProcessos = processos.length
    const totalClientes = appState.clientes.length
    
    // Prazos na semana (simulado)
    const hoje = new Date();
    const seteDiasDepois = new Date();
    seteDiasDepois.setDate(hoje.getDate() + 7);

    const prazosNaSemana = appState.eventos.filter(e => {
      const dataEvento = new Date(e.data);
      return dataEvento >= hoje && dataEvento <= seteDiasDepois && e.status === 'pendente';
    }).length;
    
    // Prazos vencidos (simulado)
    const prazosVencidos = appState.eventos.filter(e => {
      const dataEvento = new Date(e.data);
      return dataEvento < hoje && e.status === 'pendente';
    }).length;
    
    // Processos por status
    const statusCount = {}
    processos.forEach(p => {
      const status = Utils.getProcessoStatus(p.ultimoEvento)
      statusCount[status] = (statusCount[status] || 0) + 1
    })
    
    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      color: Utils.getStatusColor(status).includes('blue') ? '#3B82F6' :
             Utils.getStatusColor(status).includes('yellow') ? '#F59E0B' :
             Utils.getStatusColor(status).includes('gray') ? '#6B7280' : '#10B981'
    }))

    // Últimas atualizações de processos para o Dashboard
    const ultimasAtualizacoesProcessos = [...processos]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
    
    return {
      totalProcessos,
      totalClientes,
      prazosNaSemana,
      prazosVencidos,
      statusData,
      ultimasAtualizacoesProcessos
    }
  }

  const stats = getDashboardStats()
  const filteredProcessos = getFilteredProcessos()

  // Componente de navegação lateral
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transform ${appState.sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        <div className="flex items-center">
          <Scale className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold">JurisTech Pro</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-white hover:bg-blue-700"
          onClick={() => setAppState(prev => ({ ...prev, sidebarOpen: false }))}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 bg-blue-900 mx-2 rounded-lg mb-4">
        <p className="text-sm text-blue-200">Usuário</p>
        <p className="font-semibold">Dr(a). Usuário</p>
      </div>
      
      <nav className="px-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'processos', label: 'Processos', icon: Gavel },
          { id: 'agenda', label: 'Agenda & Prazos', icon: Calendar },
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'documentos', label: 'Documentos', icon: FolderOpen },
          { id: 'notes-tasks', label: 'Anotações & Tarefas', icon: FileText } // NOVO
        ].map(item => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={appState.currentPage === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 text-white hover:bg-blue-700 ${
                appState.currentPage === item.id ? 'bg-blue-600' : ''
              }`}
              onClick={() => setAppState(prev => ({ ...prev, currentPage: item.id, sidebarOpen: false }))}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          )
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4 text-xs text-blue-300 text-center">
        <p>Versão {APP_CONFIG.version}</p>
        <p className="mt-1">© 2025 JurisTech</p>
      </div>
    </div>
  )

  // Componente de cabeçalho
  const Header = () => (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden mr-4"
          onClick={() => setAppState(prev => ({ ...prev, sidebarOpen: true }))}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
          {appState.currentPage === 'dashboard' && 'Dashboard'}
          {appState.currentPage === 'processos' && 'Processos'}
          {appState.currentPage === 'agenda' && 'Agenda & Prazos'}
          {appState.currentPage === 'clientes' && 'Clientes'}
          {appState.currentPage === 'financeiro' && 'Financeiro'}
          {appState.currentPage === 'documentos' && 'Documentos'}
          {appState.currentPage === 'notes-tasks' && 'Anotações & Tarefas'} {/* NOVO */}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          id="backup-restore"
          className="hidden"
          accept=".json"
          onChange={importBackup}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={exportBackup}
          title="Fazer Backup"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById('backup-restore').click()}
          title="Restaurar Backup"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <NotificationSystem // NOVO: Integração do sistema de notificações
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onClearAll={clearAllNotifications}
          onNotificationClick={handleNotificationClick}
        />
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 hidden md:inline">Olá, Dr(a). Usuário</span>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  )

  // Componente Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center p-6">
            <Gavel className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-gray-500 text-sm">Total de Processos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProcessos}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-gray-500 text-sm">Prazos na Semana</p>
              <p className="text-2xl font-bold text-gray-800">{stats.prazosNaSemana}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-gray-500 text-sm">Prazos Vencidos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.prazosVencidos}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-gray-500 text-sm">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalClientes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Processos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum processo cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Últimas Atualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.ultimasAtualizacoesProcessos.map(processo => (
              <div key={processo.id} className="mb-3 p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">{processo.numero}</p>
                <p className="text-xs text-gray-500">{processo.assunto}</p>
                <p className="text-xs text-gray-400">{Utils.formatDate(processo.updatedAt)}</p>
              </div>
            ))}
            {stats.ultimasAtualizacoesProcessos.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhuma atualização recente.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Prazos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Alertas de Prazos Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appState.eventos.filter(e => {
            const dataEvento = new Date(e.data);
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            const diffTime = dataEvento.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return e.status === 'pendente' && e.prioridade === 'urgente' && diffDays >= 0 && diffDays <= 7;
          }).length > 0 ? (
            <div className="space-y-2">
              {appState.eventos.filter(e => {
                const dataEvento = new Date(e.data);
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const diffTime = dataEvento.getTime() - hoje.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return e.status === 'pendente' && e.prioridade === 'urgente' && diffDays >= 0 && diffDays <= 7;
              }).map(evento => (
                <div key={evento.id} className="p-2 border border-yellow-300 bg-yellow-50 rounded text-sm">
                  <p className="font-semibold">{evento.titulo}</p>
                  <p className="text-gray-700">Vence em: {Utils.formatDate(evento.data)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum alerta no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Componente de Processos
  const Processos = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle>Lista de Processos</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowAddProcessoModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Processo
              </Button>
              <input
                type="file"
                id="csv-import"
                className="hidden"
                accept=".csv"
                onChange={importCSV}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('csv-import').click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Select
              value={appState.filters.status}
              onValueChange={(value) => setAppState(prev => ({
                ...prev,
                filters: { ...prev.filters, status: value }
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Julgamento">Julgamento</SelectItem>
                <SelectItem value="Arquivado">Arquivado</SelectItem>
                <SelectItem value="Petição">Petição</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appState.filters.localidade}
              onValueChange={(value) => setAppState(prev => ({
                ...prev,
                filters: { ...prev.filters, localidade: value }
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Localidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Localidades</SelectItem>
                {[...new Set(appState.processos.map(p => p.localidade))].filter(Boolean).map(localidade => (
                  <SelectItem key={localidade} value={localidade}>{localidade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setAppState(prev => ({
                ...prev,
                filters: { status: '', localidade: '' }
              }))}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>

          {/* Tabela de Processos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Nº Processo</th>
                  <th className="px-4 py-3 text-left">Autor Principal</th>
                  <th className="px-4 py-3 text-left">Réu</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Data Evento</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcessos.map(processo => (
                  <tr key={processo.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{processo.numero}</td>
                    <td className="px-4 py-3">{processo.autores}</td>
                    <td className="px-4 py-3">{processo.reus}</td>
                    <td className="px-4 py-3">
                      <Badge className={Utils.getStatusColor(Utils.getProcessoStatus(processo.ultimoEvento))}>
                        {Utils.getProcessoStatus(processo.ultimoEvento)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{processo.dataHoraEvento}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProcesso(processo)
                            setShowProcessoModal(true)
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProcesso(processo)
                            setShowAddProcessoModal(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateProcesso(processo)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProcesso(processo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProcessos.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum processo encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Componente de Clientes
  const Clientes = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Clientes</CardTitle>
            <Button onClick={() => setShowAddClienteModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appState.clientes.map(cliente => (
              <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold">{cliente.nome}</h3>
                  <p className="text-sm text-gray-600">{cliente.cpf}</p>
                  <p className="text-sm text-gray-600">{cliente.telefone}</p>
                  <p className="text-sm text-gray-600">{cliente.email}</p>
                  {cliente.endereco && <p className="text-sm text-gray-600">{cliente.endereco}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          {appState.clientes.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum cliente cadastrado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Componente genérico para páginas em desenvolvimento (agora usado só de exemplo se algo não for integrado)
  const EmptyPage = ({ title, icon: Icon }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{title}</h2>
        <p className="text-gray-500 text-center">Esta funcionalidade está em desenvolvimento.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {appState.currentPage === 'dashboard' && <Dashboard />}
          {appState.currentPage === 'processos' && <Processos />}
          {appState.currentPage === 'agenda' && ( // Módulo Agenda & Prazos
            <AgendaPrazosModule
              eventos={appState.eventos}
              onAddEvento={addEvento}
              onUpdateEvento={updateEvento}
              onDeleteEvento={deleteEvento}
              processos={appState.processos}
              clientes={appState.clientes}
            />
          )}
          {appState.currentPage === 'clientes' && <Clientes />}
          {appState.currentPage === 'financeiro' && ( // Módulo Financeiro
            <FinanceiroModule
              transacoes={appState.transacoes}
              onAddTransacao={addTransacao}
              onUpdateTransacao={updateTransacao}
              onDeleteTransacao={onDeleteTransacao}
              processos={appState.processos}
              clientes={appState.clientes}
            />
          )}
          {appState.currentPage === 'documentos' && ( // Módulo Documentos
            <DocumentosModule
              documentos={appState.documentos}
              onAddDocumento={addDocumento}
              onDeleteDocumento={onDeleteDocumento}
              processos={appState.processos}
              clientes={appState.clientes}
            />
          )}
          {appState.currentPage === 'notes-tasks' && ( // Módulo Anotações & Tarefas
            <NotesTasksModule
              notes={appState.notes}
              reminders={appState.reminders}
              tasks={appState.tasks}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
              onAddReminder={addReminder}
              onDeleteReminder={deleteReminder}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onToggleTask={toggleTask}
              processos={appState.processos}
              clientes={appState.clientes}
            />
          )}
        </main>
      </div>

      {/* Modal Adicionar/Editar Processo */}
      <ProcessoModal
        open={showAddProcessoModal}
        onOpenChange={setShowAddProcessoModal}
        processo={editingProcesso}
        onSave={editingProcesso ? updateProcesso : addProcesso}
        onCancel={() => {
          setShowAddProcessoModal(false)
          setEditingProcesso(null)
        }}
      />

      {/* Modal Detalhes do Processo */}
      <ProcessoDetailsModal
        open={showProcessoModal}
        onOpenChange={setShowProcessoModal}
        processo={selectedProcesso}
        onEdit={(processo) => {
          setEditingProcesso(processo)
          setShowAddProcessoModal(true)
          setShowProcessoModal(false)
        }}
        onDuplicate={duplicateProcesso}
        onDelete={deleteProcesso}
      />

      {/* Modal Adicionar Cliente */}
      <ClienteModal
        open={showAddClienteModal}
        onOpenChange={setShowAddClienteModal}
        onSave={addCliente}
      />
    </div>
  )
}

export default App