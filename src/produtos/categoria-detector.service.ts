import { Injectable } from '@nestjs/common';

interface CategoriaRule {
  keywords: string[];
  categoria: string;
}

const categoriaRules: CategoriaRule[] = [
  { keywords: ['banha de porco', 'lubrificante', 'graxa', 'óleo motor', 'óleo hidráulico', 'óleo industrial'], categoria: 'Lubrificantes' },
  { keywords: ['banha', 'óleo', 'azeite', 'manteiga', 'margarina', 'gordura', 'lard'], categoria: 'Alimentos' },
  { keywords: ['arroz', 'feijão', 'açúcar', 'sal', 'farinha', 'macarrão', 'massa'], categoria: 'Alimentos' },
  { keywords: ['leite', 'queijo', 'iogurte', 'requeijão', 'manteiga'], categoria: 'Laticínios' },
  { keywords: ['carne', 'frango', 'peixe', 'bacon', 'linguiça', 'salsicha'], categoria: 'Carnes' },
  { keywords: ['refrigerante', 'suco', 'água', 'cerveja', 'vinho', 'bebida'], categoria: 'Bebidas' },
  { keywords: ['parafuso', 'porca', 'prego', 'arruela', 'rebite', 'parafusos'], categoria: 'Ferramentas' },
  { keywords: ['martelo', 'chave', 'alicate', 'serra', 'furadeira', 'broca'], categoria: 'Ferramentas' },
  { keywords: ['tinta', 'pincel', 'rolo', 'verniz', 'selador'], categoria: 'Tintas e Pintura' },
  { keywords: ['cimento', 'areia', 'tijolo', 'bloco', 'argamassa', 'rejunte'], categoria: 'Construção' },
  { keywords: ['cano', 'tubo', 'conexão', 'válvula', 'registro'], categoria: 'Hidráulica' },
  { keywords: ['fio', 'cabo', 'disjuntor', 'tomada', 'interruptor', 'lâmpada'], categoria: 'Elétrica' },
  { keywords: ['celular', 'smartphone', 'tablet', 'notebook', 'computador'], categoria: 'Eletrônicos' },
  { keywords: ['tv', 'televisão', 'monitor', 'tela'], categoria: 'Eletrônicos' },
  { keywords: ['mouse', 'teclado', 'fone', 'caixa de som', 'alto-falante'], categoria: 'Informática' },
  { keywords: ['camisa', 'camiseta', 'calça', 'short', 'vestido', 'saia'], categoria: 'Vestuário' },
  { keywords: ['tênis', 'sapato', 'chinelo', 'bota', 'sandália'], categoria: 'Calçados' },
  { keywords: ['tecido', 'linha', 'agulha', 'botão', 'ziper'], categoria: 'Têxtil' },
  { keywords: ['sabão', 'detergente', 'desinfetante', 'água sanitária', 'limpa-vidros'], categoria: 'Limpeza' },
  { keywords: ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova'], categoria: 'Higiene' },
  { keywords: ['papel', 'toalha', 'guardanapo', 'fralda'], categoria: 'Higiene' },
  { keywords: ['pneu', 'óleo motor', 'filtro', 'bateria', 'vela'], categoria: 'Automotivo' },
  { keywords: ['combustível', 'gasolina', 'álcool', 'diesel'], categoria: 'Combustíveis' },
  { keywords: ['mesa', 'cadeira', 'sofá', 'armário', 'estante'], categoria: 'Móveis' },
  { keywords: ['cortina', 'tapete', 'almofada', 'quadro', 'vaso'], categoria: 'Decoração' },
  { keywords: ['resina', 'adesivo', 'cola', 'selante', 'espuma'], categoria: 'Químicos' },
  { keywords: ['ferro', 'aço', 'alumínio', 'cobre', 'metal'], categoria: 'Metais' },
  { keywords: ['plástico', 'pvc', 'poliéster', 'polietileno'], categoria: 'Plásticos' },
  { keywords: ['papel', 'caderno', 'caneta', 'lápis', 'borracha'], categoria: 'Papelaria' },
  { keywords: ['medicamento', 'remédio', 'vitamina', 'suplemento'], categoria: 'Farmácia' },
  { keywords: ['semente', 'adubo', 'fertilizante', 'inseticida'], categoria: 'Agricultura' },
];

@Injectable()
export class CategoriaDetectorService {
  detectarCategoria(nomeProduto: string): string | null {
    if (!nomeProduto || !nomeProduto.trim()) {
      return null;
    }

    const nomeNormalizado = nomeProduto.toLowerCase().trim();

    // Ordena regras por tamanho da keyword (mais longas primeiro) para priorizar correspondências específicas
    const rulesOrdenadas = [...categoriaRules].sort((a, b) => {
      const maxA = Math.max(...a.keywords.map(k => k.length));
      const maxB = Math.max(...b.keywords.map(k => k.length));
      return maxB - maxA;
    });

    for (const rule of rulesOrdenadas) {
      for (const keyword of rule.keywords) {
        if (nomeNormalizado.includes(keyword.toLowerCase())) {
          return rule.categoria;
        }
      }
    }

    return null;
  }

  obterSugestoesCategoria(nomeProduto: string): string[] {
    if (!nomeProduto || !nomeProduto.trim()) {
      return [];
    }

    const nomeNormalizado = nomeProduto.toLowerCase().trim();
    const sugestoes: Map<string, number> = new Map();

    for (const rule of categoriaRules) {
      let matches = 0;
      for (const keyword of rule.keywords) {
        if (nomeNormalizado.includes(keyword.toLowerCase())) {
          matches++;
        }
      }
      if (matches > 0) {
        const scoreAtual = sugestoes.get(rule.categoria) || 0;
        sugestoes.set(rule.categoria, scoreAtual + matches);
      }
    }

    return Array.from(sugestoes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([categoria]) => categoria);
  }
}

