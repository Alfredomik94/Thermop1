#!/bin/bash

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Avvio applicazione Thermopolio ===${NC}"

# Verifica installazione dipendenze
echo -e "${YELLOW}Verificando dipendenze...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installando dipendenze...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Errore nell'installazione delle dipendenze. Uscita.${NC}"
    exit 1
  fi
fi

# Verifica esistenza file necessari
echo -e "${YELLOW}Verificando file necessari...${NC}"
if [ ! -f "server.js" ]; then
  echo -e "${RED}File server.js non trovato. Uscita.${NC}"
  exit 1
fi

# Verifica directory public
if [ ! -d "public" ]; then
  echo -e "${YELLOW}Creazione directory public...${NC}"
  mkdir -p public
  mkdir -p public/css
  mkdir -p public/js
fi

# Avvio applicazione
echo -e "${GREEN}Avvio del server Node.js...${NC}"
node server.js