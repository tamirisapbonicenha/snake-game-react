# 🐍 Jogo da Cobrinha

Jogo da cobrinha feito com React + Vite.

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Como jogar

- **Setas** ou **WASD** — mover a cobra
- **Espaço** / **Enter** — iniciar, pausar e reiniciar
- **Celular** — deslize o dedo no tabuleiro ou use os botões na tela

A cobra acelera a cada comida. Bater na parede ou no próprio corpo encerra a partida.
O recorde fica salvo no navegador.

## Estrutura

- `src/game.js` — regras do jogo (funções puras: movimento, colisão, comida)
- `src/App.jsx` — interface, loop do jogo e controles
