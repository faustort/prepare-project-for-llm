// ===============================
// prepare-project-for-llm.js
//
// 🇧🇷 Este script prepara seu projeto para análise por IA, coletando apenas arquivos relevantes, removendo comentários e gerando um contexto limpo.
// 🇺🇸 This script prepares your project for AI analysis, collecting only relevant files, removing comments, and generating a clean context.
//
// Como usar / How to use:
// 1. Coloque este arquivo na raiz do seu projeto. / Place this file at your project root.
// 2. Execute: node prepare-project-for-llm.js
// 3. O arquivo ai-ready-context.txt será gerado. / The ai-ready-context.txt file will be generated.
// ===============================

import fs from 'fs';
import path from 'path';

// ===============================
// CONFIGURAÇÃO / CONFIGURATION
// ===============================
const ignorarPastas = ['node_modules', '.git', 'dist', 'build', 'downloads', '.vscode']; // Pastas a ignorar / Folders to ignore
const ignorarArquivos = ['package-lock.json', 'yarn.lock', 'debug-esturura.log.txt']; // Arquivos a ignorar / Files to ignore
const extensoesPermitidas = ['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.md', '.yml', '.yaml']; // Extensões permitidas / Allowed extensions
const TAMANHO_MAX = 200 * 1024; // 200kb por arquivo / per file
const outputFile = 'ai-ready-context.txt'; // Nome do arquivo de saída / Output file name

// ===============================
// Função para limpar comentários / Function to remove comments
// ===============================
function limparCodigo(conteudo = '') {
  return (
    conteudo
      // 🇧🇷 Remove comentários simples e multi-linha
      // 🇺🇸 Remove single-line and multi-line comments
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 🇧🇷 Limpa espaços excessivos / 🇺🇸 Clean excessive spaces
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

// ===============================
// Verifica se é arquivo texto / Checks if file is text
// ===============================
function ehArquivoTexto(buffer) {
  return !buffer.includes(0);
}

// ===============================
// Coleta conteúdo relevante / Collects relevant content
// ===============================
function coletar(diretorio) {
  let resultado = '';
  const arquivos = fs.readdirSync(diretorio);
  for (const arquivo of arquivos) {
    if (ignorarPastas.includes(arquivo) || ignorarArquivos.includes(arquivo)) continue;
    const fullPath = path.join(diretorio, arquivo);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      resultado += coletar(fullPath);
    } else {
      const ext = path.extname(arquivo);
      if (!extensoesPermitidas.includes(ext)) continue;
      if (stat.size > TAMANHO_MAX) continue;
      try {
        const buffer = fs.readFileSync(fullPath);
        if (!ehArquivoTexto(buffer)) continue;
        let conteudo = buffer.toString('utf8');
        conteudo = limparCodigo(conteudo);
        if (!conteudo || conteudo.length < 50) continue;
        resultado += `\n### ARQUIVO / FILE: ${fullPath}\n\n`;
        resultado += conteudo + '\n';
      } catch {
        continue;
      }
    }
  }
  return resultado;
}

// ===============================
// Executa o script / Run the script
// ===============================
function executar() {
  const raiz = process.cwd();
  let output = 'CONTEXTO PARA IA / AI CONTEXT\n';
  output += '==============================\n';
  output += coletar(raiz);
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Arquivo gerado: ${outputFile} / File generated: ${outputFile}`);
}

executar();
