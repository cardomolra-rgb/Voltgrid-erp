# ⚡ ProObras ERP — Gestão Integrada de Obras de Energia Elétrica

**ProObras ERP** é um sistema completo de gestão operacional, financeira, comercial e regulatória projetado especificamente para empresas de engenharia elétrica, empreiteiras de energia e construtoras de redes de distribuição (RDU/RDR 34,5 kV, Subestações e Iluminação Pública).


---

## 🚀 Funcionalidades Principais

### 🏗️ 1. Gestão de Obras & Engenharia
- **Monitoramento de Obras**: Acompanhamento por Número de Projeto cadastrado (ex: `PRJ-2026/001`), cliente, concessionária e responsável técnico CREA.
- **Alertas de Orçamento**: Alerta visual animado e automático quando o custo executado ultrapassa 85% do valor do contrato.
- **Local de Prestação de Serviços**: Especificação detalhada do endereço e interessado diretamente no escopo e dossiê técnico.
- **Diário de Obra (RDO)**: Registro diário de condições climáticas, avanço físico e equipes em campo.

### 📜 2. Gerador de Documentos & Homologação Regulatória
- **Contratos de Empreitada**: Geração automática de minuta de contrato ajustada às normas da **Energisa** e normas ABNT.
- **Procurações para Concessionária**: Emissão automatizada para representação perante órgãos reguladores.
- **Histórico & Dossiê de Contratos**: Controle de contratos aprovados com integração direta ao financeiro (Contas a Receber).

### 📊 3. Financeiro & DRE Executivo
- **DRE Operacional em Tempo Real**: Cálculo de Receita Bruta, Receita Líquida, Margem Operacional e Lucro Líquido.
- **Configuração de Alíquota de Impostos**: Define a porcentagem de tributos (ex: Simples Nacional/Presumido) no Cadastro da Empresa.
- **Contas a Pagar & Receber**: Controle de fluxo de caixa vinculado a fornecedores, clientes e obras.

### 👥 4. CRM Comercial & Propostas Elétricas
- **Gestão de Clientes**: Cadastro completo com funções para Editar, Excluir e Buscar por Razão Social/CNPJ.
- **Elaboração de Propostas**: Cálculo automático de totais, impostos, margens e valores por extenso.
- **Conversor 1-Clique**: Transforma propostas comerciais aprovadas diretamente em uma nova Obra no sistema.

### ⛽ 5. Controle de Frota & Combustíveis
- **Abastecimentos de Campo**: Lançamento de combustível por veículo, placa, funcionário, posto e valor.
- **Leitura de comprovantes**: Anexo e análise de cupons fiscais de postos de combustível.

### 📦 6. Almoxarifado & Estoque de Materiais
- **Estoque de Redes**: Controle de condutores, transformadores, postes, isoladores e chaves fusíveis.
- **Movimentação por Obra**: Baixas e entradas automáticas vinculadas aos projetos de campo.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion, Recharts.
- **Backend / Server**: Node.js, Express, ESBuild, TSX.
- **Inteligência Artificial (Opcional)**: Google Gemini GenAI SDK (`@google/genai`).

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js**: Versão 18.x ou superior.
- **npm** ou **bun**.

### Passos:

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/SEU_USUARIO/voltgrid-erp.git
   cd voltgrid-erp
   ```

2. **Instalar as Dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente (Opcional)**:
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Executar em Modo de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`

5. **Verificação de Código e Build de Produção**:
   ```bash
   # Executar checagem de tipos TypeScript
   npm run lint

   # Compilar pacote de produção
   npm run build
   ```

---

## 📁 Estrutura do Projeto

```
voltgrid-erp/
├── src/
│   ├── components/       # Módulos principais (CRM, Obras, Financeiro, Documentos, etc.)
│   ├── data/             # Dados mockados e configurações iniciais da empresa
│   ├── types.ts          # Definições de interfaces TypeScript
│   ├── App.tsx           # Componente principal e controle de estado global
│   └── main.tsx          # Ponto de entrada do React
├── server.ts             # Servidor Express com rotas de API e estáticos
├── package.json          # Dependências e scripts
├── vite.config.ts        # Configuração do Vite
└── README.md             # Documentação oficial
```

---

## 📝 Licença

Este projeto é privado e de propriedade de **Moura Soluções Elétricas LTDA**.
