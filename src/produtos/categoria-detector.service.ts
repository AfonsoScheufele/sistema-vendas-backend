import { Injectable } from '@nestjs/common';

interface CategoriaRule {
  keywords: string[];
  categoria: string;
}

const categoriaRules: CategoriaRule[] = [
  // Lubrificantes e desengripantes
  {
    keywords: [
      'banha de porco', 'lubrificante', 'graxa', 'graxa branca', 'graxa azul', 'graxa spray',
      'óleo motor', 'oleo motor', 'óleo hidráulico', 'oleo hidraulico', 'óleo industrial', 'oleo industrial',
      'óleo de corte', 'oleo de corte', 'fluido de corte', 'spray lubrificante',
      'desengripante', 'desengripante spray', 'wd-40', 'wd 40', 'afrouxa tudo',
    ],
    categoria: 'Lubrificantes',
  },
  // Vedação e silicones
  {
    keywords: [
      'silicone', 'silicone acético', 'silicone acido', 'silicone neutro', 'silicone estrutural',
      'selante de silicone', 'vedação', 'vedacao', 'reparo de fissuras',
    ],
    categoria: 'Vedação',
  },
  // Impermeabilizante
  {
    keywords: ['impermeabilizante', 'manta líquida', 'manta asfaltica', 'waterproof', 'elastomérico', 'elastomerico', 'infiltração', 'infiltracao'],
    categoria: 'Impermeabilizante',
  },
  // Espumas e isolantes
  {
    keywords: ['espuma expansiva', 'espuma expansão', 'espuma de poliuretano', 'lã de vidro', 'la de vidro', 'isolante térmico', 'isolante termico', 'isolamento acústico'],
    categoria: 'Espumas e Isolantes',
  },
  // Fixadores
  {
    keywords: ['parafuso', 'parafusos', 'porca', 'arruela', 'prego', 'rebite', 'bucha', 'chumbador', 'rosca soberba', 'tarugo', 'barbatanas'],
    categoria: 'Fixadores',
  },
  // Ferramentas
  {
    keywords: [
      'martelo', 'chave de fenda', 'chave philips', 'chave combinada', 'chave allen', 'chave estrela',
      'alicate', 'serra', 'serrote', 'furadeira', 'parafusadeira', 'broca', 'soquete', 'carrinho de ferramentas',
      'trena', 'nível', 'nivel', 'esquadro', 'formão', 'formao', 'talhadeira',
    ],
    categoria: 'Ferramentas',
  },
  // Abrasivos
  {
    keywords: ['lixa', 'lixa d\'água', 'lixa dagua', 'disco de lixa', 'disco lixa', 'esmeril', 'rebolo', 'pasta de lixar', 'broca concretico'],
    categoria: 'Abrasivos',
  },
  // Tintas e pintura
  {
    keywords: ['tinta', 'pincel', 'rolo', 'verniz', 'selador', 'massa corrida', 'massa plastica', 'primer', 'esmalte', 'látex', 'latex', 'acrílica', 'acrilica', 'textura', 'stucco'],
    categoria: 'Tintas e Pintura',
  },
  // Construção civil
  {
    keywords: ['cimento', 'areia', 'tijolo', 'bloco', 'argamassa', 'rejunte', 'cerâmica', 'ceramica', 'piso', 'contrapiso', 'gesso', 'drywall', 'chapisco', 'reboco', 'cal', 'brita'],
    categoria: 'Construção',
  },
  // Hidráulica
  {
    keywords: ['cano', 'tubo', 'conexão', 'conexao', 'válvula', 'valvula', 'registro', 'torneira', 'sifão', 'sifao', 'caixa gordura', 'bomba d\'água', 'bomba dagua', 'mangueira flexível', 'joelho', 'luva pvc', 'redução', 'te'],
    categoria: 'Hidráulica',
  },
  // Fitas e adesivos
  {
    keywords: ['fita crepe', 'fita veda rosca', 'fita dupla face', 'fita isolante', 'fita adesiva', 'fita embalagem', 'veda rosca', 'fita teflon'],
    categoria: 'Fitas e Adesivos',
  },
  // Elétrica
  {
    keywords: ['fio', 'cabo', 'disjuntor', 'tomada', 'interruptor', 'lâmpada', 'lampada', 'lustre', 'refletor', 'luminária', 'luminaria', 'plafon', 'pendente', 'conduit', 'eletroduto', 'fita isolante'],
    categoria: 'Elétrica',
  },
  // Solda
  {
    keywords: ['solda', 'eletrodo', 'maçarico', 'macarico', 'tocha', 'rebitadeira', 'haste solda'],
    categoria: 'Solda',
  },
  // Limpeza
  {
    keywords: [
      'sabão', 'sabao', 'detergente', 'desinfetante', 'água sanitária', 'agua sanitaria',
      'limpa-vidros', 'limpa vidros', 'limpa alumínio', 'limpa aluminio', 'desengraxante', 'desincrustante',
      'limpador multiuso', 'multiuso', 'limpa piso', 'limpa piso industrial', 'balde', 'vassoura', 'rodo', 'pá', 'pa',
    ],
    categoria: 'Limpeza',
  },
  // Químicos
  {
    keywords: ['resina', 'adesivo', 'cola', 'selante', 'espuma', 'thinner', 'solvente', 'removedor', 'ácido', 'acido', 'diluyente', 'catalisador'],
    categoria: 'Químicos',
  },
  // EPI
  {
    keywords: [
      'luva', 'luvas', 'luva nitrílica', 'luva nitrilica', 'luva de vaqueta', 'bota', 'botina',
      'capacete', 'óculos de proteção', 'oculos de protecao', 'protetor auricular', 'máscara', 'mascara', 'respirador', 'aventais', 'colete refletivo',
    ],
    categoria: 'EPI',
  },
  // Automotivo
  {
    keywords: ['pneu', 'óleo motor', 'oleo motor', 'filtro', 'bateria', 'vela', 'pastilha freio', 'disco freio', 'correia', 'filtro óleo', 'filtro oleo', 'filtro ar', 'fluido freio', 'aditivo radiador', 'limpa parabrisa'],
    categoria: 'Automotivo',
  },
  // Grampos e abraçadeiras
  {
    keywords: ['grampo', 'abraçadeira', 'abracadeira', 'prendedor', 'cantonera', 'morsa'],
    categoria: 'Grampos e Abraçadeiras',
  },
  // Escadas e acessórios
  {
    keywords: ['escada', 'andaime', 'plataforma', 'cadeira escada', 'apoio escada'],
    categoria: 'Escadas e Acessórios',
  },
  // Madeira
  {
    keywords: ['madeira', 'mdf', 'compensado', 'tábua', 'tabua', 'sarrafo', 'ripa', 'caibro', 'vigota', 'OSB'],
    categoria: 'Madeira',
  },
  // Metais
  {
    keywords: ['ferro', 'aço', 'aco', 'alumínio', 'aluminio', 'cobre', 'metal', 'chapa', 'cantoneira', 'perfil', 'tela metálica', 'tela metalica'],
    categoria: 'Metais',
  },
  // Plásticos
  {
    keywords: ['plástico', 'plastico', 'pvc', 'poliéster', 'poliester', 'polietileno', 'tubo pvc', 'conexão pvc'],
    categoria: 'Plásticos',
  },
  // Embalagens
  {
    keywords: ['caixa papelão', 'caixa papelao', 'saco plástico', 'saco plastico', 'filme stretch', 'fita embalagem', 'bobina filme', 'saco lixo', 'saco para lixo'],
    categoria: 'Embalagens',
  },
  // Iluminação
  {
    keywords: ['lâmpada led', 'lampada led', 'refletor led', 'luminária led', 'luminaria led', 'plafon', 'pendente', 'projetor', 'refletor'],
    categoria: 'Iluminação',
  },
  // Jardim e agricultura
  {
    keywords: ['semente', 'adubo', 'fertilizante', 'inseticida', 'mangueira jardim', 'torneira jardim', 'regador', 'pá jardim', 'terra', 'substrato'],
    categoria: 'Jardim e Agricultura',
  },
  // Alimentos (genérico)
  {
    keywords: ['banha', 'óleo', 'azeite', 'manteiga', 'margarina', 'gordura', 'lard'],
    categoria: 'Alimentos',
  },
  {
    keywords: ['arroz', 'feijão', 'feijao', 'açúcar', 'acucar', 'sal', 'farinha', 'macarrão', 'massa'],
    categoria: 'Alimentos',
  },
  {
    keywords: ['leite', 'queijo', 'iogurte', 'requeijão', 'manteiga'],
    categoria: 'Laticínios',
  },
  {
    keywords: ['carne', 'frango', 'peixe', 'bacon', 'linguiça', 'salsicha'],
    categoria: 'Carnes',
  },
  {
    keywords: ['refrigerante', 'suco', 'água', 'agua', 'cerveja', 'vinho', 'bebida'],
    categoria: 'Bebidas',
  },
  // Eletrônicos e informática
  {
    keywords: ['celular', 'smartphone', 'tablet', 'notebook', 'computador'],
    categoria: 'Eletrônicos',
  },
  {
    keywords: ['tv', 'televisão', 'televisao', 'monitor', 'tela'],
    categoria: 'Eletrônicos',
  },
  {
    keywords: ['mouse', 'teclado', 'fone', 'caixa de som', 'alto-falante'],
    categoria: 'Informática',
  },
  // Vestuário e têxtil
  {
    keywords: ['camisa', 'camiseta', 'calça', 'calca', 'short', 'vestido', 'saia'],
    categoria: 'Vestuário',
  },
  {
    keywords: ['tênis', 'tenis', 'sapato', 'chinelo', 'bota', 'sandália', 'sandalia'],
    categoria: 'Calçados',
  },
  {
    keywords: ['tecido', 'linha', 'agulha', 'botão', 'botao', 'ziper'],
    categoria: 'Têxtil',
  },
  // Outros
  {
    keywords: ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova'],
    categoria: 'Higiene',
  },
  {
    keywords: ['papel', 'toalha', 'guardanapo', 'fralda'],
    categoria: 'Higiene',
  },
  {
    keywords: ['combustível', 'combustivel', 'gasolina', 'álcool', 'alcool', 'diesel'],
    categoria: 'Combustíveis',
  },
  {
    keywords: ['mesa', 'cadeira', 'sofá', 'sofa', 'armário', 'armario', 'estante'],
    categoria: 'Móveis',
  },
  {
    keywords: ['cortina', 'tapete', 'almofada', 'quadro', 'vaso'],
    categoria: 'Decoração',
  },
  {
    keywords: ['papel', 'caderno', 'caneta', 'lápis', 'lapis', 'borracha'],
    categoria: 'Papelaria',
  },
  {
    keywords: ['medicamento', 'remédio', 'remedio', 'vitamina', 'suplemento'],
    categoria: 'Farmácia',
  },
];

@Injectable()
export class CategoriaDetectorService {
  detectarCategoria(nomeProduto: string): string | null {
    if (!nomeProduto || !nomeProduto.trim()) {
      return null;
    }

    const nomeNormalizado = nomeProduto.toLowerCase().trim();

    const rulesOrdenadas = [...categoriaRules].sort((a, b) => {
      const maxA = Math.max(...a.keywords.map((k) => k.length));
      const maxB = Math.max(...b.keywords.map((k) => k.length));
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

