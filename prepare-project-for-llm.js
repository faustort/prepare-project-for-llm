import fs from 'fs';
import path from 'path';

// CONFIG
const ignorarPastas = ['node_modules', '.git', 'dist', 'build', 'downloads', '.vscode'];

const ignorarArquivos = ['package-lock.json', 'yarn.lock', 'debug-esturura.log.txt'];

const extensoesPermitidas = ['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.md', '.yml', '.yaml'];

const TAMANHO_MAX = 200 * 1024; // 200kb por arquivo
const outputFile = 'ai-ready-context.txt';

// REMOVE COMENTÁRIOS SIMPLES
function limparCodigo(conteudo = '') {
  return (
    conteudo
      // remove comentários JS simples
      .replace(/\/\/.*$/gm, '')
      // remove comentários multi-line
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // limpa espaços excessivos
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

// VERIFICA SE É TEXTO
function ehArquivoTexto(buffer) {
  return !buffer.includes(0);
}

// COLETA CONTEÚDO RELEVANTE
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

        resultado += `\n### ARQUIVO: ${fullPath}\n\n`;
        resultado += conteudo + '\n';
      } catch {
        continue;
      }
    }
  }

  return resultado;
}

// EXECUTA
function executar() {
  const raiz = process.cwd();

  let output = 'CONTEXTO PARA IA\n';
  output += '====================\n';

  output += coletar(raiz);

  fs.writeFileSync(outputFile, output, 'utf8');

  console.log(`Arquivo gerado: ${outputFile}`);
}

executar();
