import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  File,
  FileImage,
  FileVideo,
  FileArchive,
  Plus,
  X
} from 'lucide-react'

const DocumentosModule = ({ 
  documentos, 
  onAddDocumento, 
  onDeleteDocumento,
  processos,
  clientes 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    vinculadoA: '',
    vinculadoId: '',
    tags: ''
  })

  // Categorias disponíveis
  const categorias = [
    'Petição',
    'Contrato',
    'Procuração',
    'Certidão',
    'Sentença',
    'Acórdão',
    'Parecer',
    'Comprovante',
    'Outros'
  ]

  // Função para obter ícone baseado no tipo de arquivo
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
      return <FileImage className="h-8 w-8 text-blue-500" />
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
      return <FileVideo className="h-8 w-8 text-purple-500" />
    } else if (['zip', 'rar', '7z', 'tar'].includes(ext)) {
      return <FileArchive className="h-8 w-8 text-orange-500" />
    } else if (['pdf'].includes(ext)) {
      return <FileText className="h-8 w-8 text-red-500" />
    } else {
      return <File className="h-8 w-8 text-gray-500" />
    }
  }

  // Filtrar documentos
  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || doc.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Estatísticas
  const stats = {
    total: documentos.length,
    porCategoria: categorias.map(cat => ({
      categoria: cat,
      count: documentos.filter(d => d.categoria === cat).length
    })).filter(s => s.count > 0)
  }

  // Handler para upload de arquivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Simular upload (em produção, enviaria para servidor)
    const reader = new FileReader()
    reader.onload = (e) => {
      const documento = {
        ...uploadForm,
        nome: uploadForm.nome || file.name,
        tamanho: file.size,
        tipo: file.type,
        dataUpload: new Date().toISOString(),
        arquivo: e.target.result // Base64 para demonstração
      }
      
      onAddDocumento(documento)
      setShowUploadModal(false)
      setUploadForm({
        nome: '',
        categoria: '',
        descricao: '',
        vinculadoA: '',
        vinculadoId: '',
        tags: ''
      })
    }
    reader.readAsDataURL(file)
  }

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Documentos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {stats.porCategoria.slice(0, 3).map(stat => (
          <Card key={stat.categoria}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.categoria}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barra de ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle>Gerenciamento de Documentos</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Todas as Categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lista de documentos */}
          {filteredDocumentos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocumentos.map(doc => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      {getFileIcon(doc.nome)}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Download do arquivo
                            const link = document.createElement('a')
                            link.href = doc.arquivo
                            link.download = doc.nome
                            link.click()
                          }}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteDocumento(doc.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-2 truncate" title={doc.nome}>
                      {doc.nome}
                    </h3>
                    
                    {doc.descricao && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {doc.descricao}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.categoria && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.categoria}
                        </Badge>
                      )}
                      {doc.tags && doc.tags.split(',').map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Tamanho: {formatFileSize(doc.tamanho)}</p>
                      <p>Upload: {formatDate(doc.dataUpload)}</p>
                      {doc.vinculadoA && doc.vinculadoId && (
                        <p>Vinculado: {doc.vinculadoA}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Nenhum documento encontrado com os filtros aplicados.' 
                  : 'Nenhum documento cadastrado ainda. Faça o upload do primeiro documento.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upload de Documento</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Arquivo *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome do Documento
                  </label>
                  <Input
                    value={uploadForm.nome}
                    onChange={(e) => setUploadForm({ ...uploadForm, nome: e.target.value })}
                    placeholder="Deixe em branco para usar o nome do arquivo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoria *
                  </label>
                  <select
                    value={uploadForm.categoria}
                    onChange={(e) => setUploadForm({ ...uploadForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm({ ...uploadForm, descricao: e.target.value })}
                    placeholder="Descrição do documento"
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vincular a
                    </label>
                    <select
                      value={uploadForm.vinculadoA}
                      onChange={(e) => {
                        setUploadForm({ ...uploadForm, vinculadoA: e.target.value, vinculadoId: '' })
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Nenhum</option>
                      <option value="Processo">Processo</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                  </div>

                  {uploadForm.vinculadoA && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {uploadForm.vinculadoA}
                      </label>
                      <select
                        value={uploadForm.vinculadoId}
                        onChange={(e) => setUploadForm({ ...uploadForm, vinculadoId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecione</option>
                        {uploadForm.vinculadoA === 'Processo' && processos.map(p => (
                          <option key={p.id} value={p.id}>{p.numero}</option>
                        ))}
                        {uploadForm.vinculadoA === 'Cliente' && clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="urgente, importante, revisão"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancelar
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

export default DocumentosModule
