import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const currentDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : (import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());


async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily or safely
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. AI Assistant will run in fallback smart mode.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY_FOR_FALLBACK',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'VoltGrid ERP', time: new Date().toISOString() });
  });

  // AI Assistant Endpoint - Integrated with Gemini API
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback response if API Key is pending configuration
        return res.json({
          reply: `[Modo Assistente VoltGrid AI System]
Análise Inteligente das Obras:
- Total de Obras: ${context?.obras?.length || 4}
- Obra Principal: ${context?.obras?.[0]?.projectName || 'Extensão RDU Campinas'}
- Lucro Previsto Médio: R$ 72.000,00
- Alerta de Protocolo: A obra OBR-2026-001 possui 2 pendências impeditivas (Laudo do Trafo 150kVA e NF dos Postes).

Recomendação: Para liberar o protocolo na CPFL Paulista, providencie o upload do Laudo de Ensaio do Trafo.`,
          dataSummary: {
            metric: 'Margem do Portfólio',
            value: '24.8% de Lucro Líquido',
            recommendation: 'Priorizar liberação de protocolo em OBR-002 para faturar R$ 140.000,00.',
          },
        });
      }

      const ai = getAI();
      const systemInstruction = `Você é o VoltGrid AI, Assistente Virtual e Especialista Sênior em Engenharia Elétrica, Finanças, Gestão de Obras e Redes de Distribuição (RDU/RDR, Subestações, Transmissão) do ERP VoltGrid.
Sua missão é responder perguntas sobre o estado das obras, calcular lucros e margens, encontrar gargalos de protocolo, detectar anomalias de combustível/frotas, analisar orçamentos vs custos reais e gerar resumos executivos.

Regras de Resposta:
- Seja profissional, direto, preciso e use termos técnicos de engenharia elétrica do Brasil (CPFL, Enel, Cemig, Copel, ART, CREA, kVA, AWT, Linha Viva, RDU, RDR, Trafo, Padrão Agrupado).
- Formate a resposta usando marcadores concisos e valores numéricos claros em Reais (R$).
- Forneça uma recomendação acionável.`;

      const userPromptWithContext = `Contexto do Sistema VoltGrid ERP:
${JSON.stringify(context, null, 2)}

Pergunta do Usuário:
${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPromptWithContext,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const replyText = response.text || 'Não foi possível obter a análise da IA no momento.';

      res.json({
        reply: replyText,
        dataSummary: {
          metric: 'Análise Concluída',
          value: 'Gemini 3.6 Flash Active',
          recommendation: 'Verifique o painel de protocolos pendentes.',
        },
      });
    } catch (err: any) {
      console.error('Error in AI Assistant route:', err);
      res.status(500).json({
        error: 'Falha ao processar solicitação na IA VoltGrid.',
        details: err?.message || String(err),
      });
    }
  });

  // OCR Document Parser Endpoint (Vision)
  app.post('/api/ai/ocr', async (req, res) => {
    try {
      const { documentType, imageBase64 } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || !imageBase64) {
        // Mock OCR response if no image or key
        return res.json({
          success: true,
          extractedData: {
            documentNumber: documentType === 'ART' ? 'ART-SP-20260099881' : 'NF-e 000.045.981',
            value: documentType === 'ART' ? 185.50 : 28500.00,
            issueDate: '2026-07-20',
            supplierClient: 'WEG Equipamentos Elétricos S.A.',
            responsibleCrea: 'Engº Carlos Alberto Ramos - CREA 506987123',
            technicalSummary: 'Documento homologado para uso em subestação/extensão RDU.',
          },
        });
      }

      const ai = getAI();
      const prompt = `Analise a imagem deste documento de Engenharia Elétrica / Obra (${documentType}). 
Extraia os seguintes dados em formato JSON limpo:
- documentNumber (número da nota, ART, contrato ou laudo)
- value (valor em reais)
- issueDate (data de emissão AAAA-MM-DD)
- supplierClient (empresa ou órgão emissor)
- responsibleCrea (engenheiro responsável se houver)
- technicalSummary (resumo técnico de 1 frase)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const jsonString = response.text || '{}';
      let extractedData = {};
      try {
        extractedData = JSON.parse(jsonString);
      } catch (e) {
        extractedData = { rawText: jsonString };
      }

      res.json({ success: true, extractedData });
    } catch (err: any) {
      console.error('Error in OCR route:', err);
      res.status(500).json({ error: 'Erro ao processar OCR do documento.', details: err?.message });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const listenPort = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`⚡ VoltGrid ERP Server listening on http://0.0.0.0:${port}`);
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && !process.env.PORT) {
        console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
        listenPort(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  listenPort(PORT);
}

startServer();
