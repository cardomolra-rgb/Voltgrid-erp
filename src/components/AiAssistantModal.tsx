import React, { useState } from 'react';
import { Bot, FileCheck, X, Send, Sparkles, Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Obra } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  obras: Obra[];
  mode: 'chat' | 'ocr';
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  obras,
  mode: initialMode,
}) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'ocr'>(initialMode);
  const [prompt, setPrompt] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Olá! Sou o Assistente IA de Engenharia Elétrica ProObras. Posso analisar o lucro das suas obras, detectar estouros de orçamento, sugerir otimização de materiais ou checar se há exigências da CPFL/Enel pendentes. Em que posso ajudar hoje?',
    },
  ]);
  const [loading, setLoading] = useState(false);

  // OCR state
  const [ocrDocType, setOcrDocType] = useState('Nota Fiscal de Transformador');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt;
    setPrompt('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, obras }),
      });
      const data = await res.json();
      setChatLog((prev) => [
        ...prev,
        { sender: 'ai', text: data.reply || 'Erro ao processar resposta com Gemini.' },
      ]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Não foi possível conectar ao assistente de IA no momento. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setOcrResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Image = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType: ocrDocType, imageBase64: base64Image }),
        });
        const data = await res.json();
        setOcrResult(data);
      } catch (err) {
        setOcrResult({
          error: 'Falha na leitura por OCR. Certifique-se de que a imagem está nítida.',
        });
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                Inteligência Artificial ProObras (Gemini 2.5)
              </h2>
              <p className="text-[11px] text-zinc-400">Análise preditiva de engenharia e leitor OCR de documentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 p-3 bg-zinc-950 border-b border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'chat'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Assistente de Engenharia & Finanças</span>
          </button>

          <button
            onClick={() => setActiveMode('ocr')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'ocr'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>OCR de Documentos & NFs</span>
          </button>
        </div>

        {/* Mode 1: Chat Assistant */}
        {activeMode === 'chat' && (
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-zinc-950 text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-xl bg-zinc-950 text-xs flex items-center space-x-2 text-blue-400 border border-zinc-800">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando portfólio com Gemini AI...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Pergunte sobre rentabilidade das obras, atrasos, exigências CPFL..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mode 2: OCR Reader */}
        {activeMode === 'ocr' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block font-mono">
                Selecione o Tipo de Documento Elétrico
              </label>
              <select
                value={ocrDocType}
                onChange={(e) => setOcrDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Nota Fiscal de Transformador">Nota Fiscal de Transformador / Cabo</option>
                <option value="AART CREA / Laudo de Ensaio">ART CREA / Laudo de Ensaio de Laboratório</option>
                <option value="Projeto Aprovado CPFL">Projeto / Memorial Descritivo Aprovado</option>
              </select>

              <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center space-y-2 bg-zinc-950">
                <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">
                  {selectedFile ? selectedFile.name : 'Anexe uma foto ou PDF do documento'}
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ocr-file-upload"
                />
                <label
                  htmlFor="ocr-file-upload"
                  className="inline-block px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-700 transition-all"
                >
                  Selecionar Arquivo
                </label>
              </div>

              <button
                onClick={handleRunOcr}
                disabled={!selectedFile || loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executando Leitura OCR com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extrair Dados Automaticamente</span>
                  </>
                )}
              </button>

              {ocrResult && (
                <div className="p-4 rounded-xl bg-zinc-950 text-white text-xs space-y-2 border border-zinc-800">
                  <span className="text-emerald-400 font-semibold uppercase text-[10px] block font-mono">
                    Resultado Extraído com Sucesso:
                  </span>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-emerald-400">
                    {JSON.stringify(ocrResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
