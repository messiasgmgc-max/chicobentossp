# 🏙️ SampaTrip - Planejador Colaborativo de Viagem para São Paulo

Aplicativo web completo, moderno e colaborativo para planejar viagens a São Paulo, com itinerários diários, mapas interativos, rotas inteligentes, catálogo e votação de pontos turísticos, guia de transporte (Metrô/CPTM) e controle financeiro de gastos.

---

## 🌟 Funcionalidades

- 📅 **Roteiro Diário Inteligente**: Organização por dias, estimativas de tempo, paradas sequenciais e botão para abrir o trajeto direto no Google Maps.
- 🗺️ **Mapa Interativo & Rotas**: Visualização de todos os pontos de SP com pins categorizados e traçado de rotas com polilinhas.
- 🧭 **Catálogo & Votação da Galera**: Pré-populado com os melhores points de SP (MASP, Japan House, Liberdade, Beco do Batman, Bixiga, etc.), comentários e sistema de votos.
- 🚇 **Guia de Mobilidade SP**: Linhas de Metrô e CPTM, pagamento por aproximação, dicas de aeroporto e simulador de trajeto.
- 📝 **Anotações, Dicas & Divisão de Gastos**: Dicas de segurança, packing list e cálculo de divisão de despesas do grupo.
- 🗄️ **Supabase + LocalStorage**: Funciona instantaneamente no navegador e suporta sincronização em nuvem com Supabase (schema SQL incluso).

---

## 🚀 Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18 / 19** + **TypeScript** + **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **Leaflet & Google Maps JS API**
- **Supabase JS Client**
