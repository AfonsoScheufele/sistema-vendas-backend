export class CreateVendaDto {
  clienteId!: number;
  itens!: {
    produtoId: number;
    quantidade: number;
  }[];
}
