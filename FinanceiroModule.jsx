import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X,
  Filter,
  Download,
  Calendar,
  PieChart
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FinanceiroModule = ({ 
  transacoes, 
  onAddTransacao, 
  onUpdateTransacao,
  onDeleteTransacao,
  processos,
  clientes 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [selectedPeriodo, setSelectedPeriodo] = useState('todos')
  const [showTransacaoModal, setShowTransacaoModal] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState(null)
  const [transacaoForm, setTransacaoForm] = useState({
    tipo: 'receita',
    categoria: '',
    valor: '',
    descricao: '',
    data: '',
    formaPagamento: '',
    vinculadoA: '',
    vinculadoId: '',
    status: 'pendente',
    observacoes: ''
  })

  // Categorias
  const categorias = {
    receita: [
      'Honorários',
      'Consultas',
      'Pareceres',
      'Contratos',
      'Outros Serviços'
    ],
    despesa: [
      'Custas Processuais',
      'Despesas Operacionais',
      'Salários',
      'Aluguel',
      'Tecnologia',
      'Marketing',
      'Impostos',
      'Outras Despesas'
    ]
  }

  // Formas de pagamento
  const formasPagamento = [
    'Dinheiro',
    'PIX',
    'Transferência Bancária',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Boleto',
    'Cheque'
  ]

  // Status
  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'atrasado', label: 'Atrasado', color: 'bg-orange-100 text-orange-800' }
  ]

  // Filtrar transações por período
  const filterByPeriodo = (transacao) => {
    if (selectedPeriodo === 'todos') return true
    
    const hoje = new Date()
    const dataTransacao = new Date(transacao.data)
    
    switch (selectedPeriodo) {
      case 'hoje':
        return dataTransacao.toDateString() === hoje.toDateString()
      case 'semana':
        const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
        return dataTransacao >= umaSemanaAtras
      case 'mes':
        return dataTransacao.getMonth() === hoje.getMonth() && 
               dataTransacao.getFullYear() === hoje.getFullYear()
      case 'ano':
        return dataTransacao.getFullYear() === hoje.getFullYear()
      default:
        return true
    }
  }

  // Filtrar transações
  const filteredTransacoes = transacoes.filter(transacao => {
    const matchesSearch = transacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transacao.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = !selectedTipo || transacao.tipo === selectedTipo
    const matchesCategoria = !selectedCategoria || transacao.categoria === selectedCategoria
    const matchesPeriodo = filterByPeriodo(transacao)
    
    return matchesSearch && matchesTipo && matchesCategoria && matchesPeriodo
  })

  // Ordenar por data (mais recente primeiro)
  const sortedTransacoes = [...filteredTransacoes].sort((a, b) => {
    return new Date(b.data) - new Date(a.data)
  })

  // Calcular estatísticas
  const stats = {
    receitas: transacoes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0),
    despesas: transacoes
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0),
    pendentes: transacoes
      .filter(t => t.status === 'pendente')
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0),
    total: transacoes.length
  }
  stats.saldo = stats.receitas - stats.despesas

  // Dados para gráficos
  const getChartData = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const anoAtual = new Date().getFullYear()
    
    const data = meses.map((mes, index) => {
      const receitas = transacoes
        .filter(t => {
          const data = new Date(t.data)
          return t.tipo === 'receita' && 
                 t.status === 'pago' &&
                 data.getMonth() === index && 
                 data.getFullYear() === anoAtual
        })
        .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0)
      
      const despesas = transacoes
        .filter(t => {
          const data = new Date(t.data)
          return t.tipo === 'despesa' && 
                 t.status === 'pago' &&
                 data.getMonth() === index && 
                 data.getFullYear() === anoAtual
        })
        .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0)
      
      return {
        mes,
        receitas: receitas,
        despesas: despesas,
        lucro: receitas - despesas
      }
    })
    
    return data
  }

  // Dados para gráfico de pizza (categorias)
  const getPieChartData = () => {
    const categoriasData = {}
    
    transacoes
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .forEach(t => {
        if (categoriasData[t.categoria]) {
          categoriasData[t.categoria] += parseFloat(t.valor || 0)
        } else {
          categoriasData[t.categoria] = parseFloat(t.valor || 0)
        }
      })
    
    return Object.entries(categoriasData).map(([name, value]) => ({
      name,
      value: value
    }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B']

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Handler para abrir modal de edição
  const handleEdit = (transacao) => {
    setEditingTransacao(transacao)
    setTransacaoForm({
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      valor: transacao.valor,
      descricao: transacao.descricao || '',
      data: transacao.data,
      formaPagamento: transacao.formaPagamento || '',
      vinculadoA: transacao.vinculadoA || '',
      vinculadoId: transacao.vinculadoId || '',
      status: transacao.status || 'pendente',
      observacoes: transacao.observacoes || ''
    })
    setShowTransacaoModal(true)
  }

  // Handler para salvar transação
  const handleSave = () => {
    if (!transacaoForm.categoria || !transacaoForm.valor || !transacaoForm.data) {
      alert('Por favor, preencha os campos obrigatórios: Categoria, Valor e Data')
      return
    }

    if (editingTransacao) {
      onUpdateTransacao(editingTransacao.id, transacaoForm)
    } else {
      onAddTransacao(transacaoForm)
    }

    setShowTransacaoModal(false)
    setEditingTransacao(null)
    setTransacaoForm({
      tipo: 'receita',
      categoria: '',
      valor: '',
      descricao: '',
      data: '',
      formaPagamento: '',
      vinculadoA: '',
      vinculadoId: '',
      status: 'pendente',
      observacoes: ''
    })
  }

  // Exportar para CSV
  const exportToCSV = () => {
    if (transacoes.length === 0) {
      alert('Nenhuma transação para exportar.')
      return
    }

    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Forma de Pagamento', 'Status']
    const rows = transacoes.map(t => [
      formatDate(t.data),
      t.tipo === 'receita' ? 'Receita' : 'Despesa',
      t.categoria,
      t.descricao || '',
      t.valor,
      t.formaPagamento || '',
      t.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.receitas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.despesas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.saldo)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendentes)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas (Mensal)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Lista */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Transações</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => {
                setEditingTransacao(null)
                setTransacaoForm({
                  tipo: 'receita',
                  categoria: '',
                  valor: '',
                  descricao: '',
                  data: '',
                  formaPagamento: '',
                  vinculadoA: '',
                  vinculadoId: '',
                  status: 'pendente',
                  observacoes: ''
                })
                setShowTransacaoModal(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
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
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todos os Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>

            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todas as Categorias</option>
              <optgroup label="Receitas">
                {categorias.receita.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Despesas">
                {categorias.despesa.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>

            <select
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Este Mês</option>
              <option value="ano">Este Ano</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              {sortedTransacoes.length} transação(ões)
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {sortedTransacoes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Data</th>
                    <th className="text-left p-3 text-sm font-semibold">Tipo</th>
                    <th className="text-left p-3 text-sm font-semibold">Categoria</th>
                    <th className="text-left p-3 text-sm font-semibold">Descrição</th>
                    <th className="text-right p-3 text-sm font-semibold">Valor</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-right p-3 text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransacoes.map(transacao => {
                    const status = statusOptions.find(s => s.value === transacao.status)
                    
                    return (
                      <tr key={transacao.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{formatDate(transacao.data)}</td>
                        <td className="p-3 text-sm">
                          <Badge className={transacao.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{transacao.categoria}</td>
                        <td className="p-3 text-sm">{transacao.descricao || '-'}</td>
                        <td className={`p-3 text-sm text-right font-semibold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(parseFloat(transacao.valor))}
                        </td>
                        <td className="p-3 text-sm">
                          {status && (
                            <Badge className={`text-xs ${status.color}`}>
                              {status.label}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(transacao)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteTransacao(transacao.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                {searchTerm || selectedTipo || selectedCategoria || selectedPeriodo !== 'todos'
                  ? 'Nenhuma transação encontrada.' 
                  : 'Nenhuma transação cadastrada.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Transação */}
      {showTransacaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingTransacao ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowTransacaoModal(false)
                    setEditingTransacao(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo *
                    </label>
                    <select
                      value={transacaoForm.tipo}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, tipo: e.target.value, categoria: '' })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Categoria *
                    </label>
                    <select
                      value={transacaoForm.categoria}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, categoria: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Selecione</option>
                      {categorias[transacaoForm.tipo].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor (R$) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={transacaoForm.valor}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, valor: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data *
                    </label>
                    <Input
                      type="date"
                      value={transacaoForm.data}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, data: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <Input
                    value={transacaoForm.descricao}
                    onChange={(e) => setTransacaoForm({ ...transacaoForm, descricao: e.target.value })}
                    placeholder="Ex: Honorários advocatícios - Processo 123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Forma de Pagamento
                    </label>
                    <select
                      value={transacaoForm.formaPagamento}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, formaPagamento: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Selecione</option>
                      {formasPagamento.map(forma => (
                        <option key={forma} value={forma}>{forma}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={transacaoForm.status}
                      onChange={(e) => setTransacaoForm({ ...transacaoForm, status: e.target.value })}
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
                      value={transacaoForm.vinculadoA}
                      onChange={(e) => {
                        setTransacaoForm({ ...transacaoForm, vinculadoA: e.target.value, vinculadoId: '' })
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Nenhum</option>
                      <option value="Processo">Processo</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                  </div>

                  {transacaoForm.vinculadoA && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {transacaoForm.vinculadoA}
                      </label>
                      <select
                        value={transacaoForm.vinculadoId}
                        onChange={(e) => setTransacaoForm({ ...transacaoForm, vinculadoId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecione</option>
                        {transacaoForm.vinculadoA === 'Processo' && processos.map(p => (
                          <option key={p.id} value={p.id}>{p.numero}</option>
                        ))}
                        {transacaoForm.vinculadoA === 'Cliente' && clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Observações
                  </label>
                  <textarea
                    value={transacaoForm.observacoes}
                    onChange={(e) => setTransacaoForm({ ...transacaoForm, observacoes: e.target.value })}
                    placeholder="Informações adicionais"
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTransacaoModal(false)
                      setEditingTransacao(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingTransacao ? 'Atualizar' : 'Salvar'}
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

export default FinanceiroModule
