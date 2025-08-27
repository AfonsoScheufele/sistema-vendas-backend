export class CreateProdutoDto {
  nome!: string;
  descricao?: string;
  preco!: number;
  estoque?: number;
  categoria?: string;
}
