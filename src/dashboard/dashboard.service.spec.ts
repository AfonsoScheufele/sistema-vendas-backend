import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from '../produtos/produto.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { PedidosService } from '../pedidos/pedidos.service';
import { ProdutosService } from '../produtos/produtos.service';
import { Repository } from 'typeorm';

describe('DashboardService', () => {
  let service: DashboardService;
  let pedidoRepo: Repository<Pedido>;

  const mockPedidoRepo = {
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockFinanceiroService = {
    listarContasReceber: jest.fn(),
    listarContasPagar: jest.fn(),
    obterFluxoCaixa: jest.fn(),
  };

  const mockGenericRepo = {
    count: jest.fn().mockResolvedValue(10),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockProdutosService = {
    getEstoqueBaixo: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Produto), useValue: mockGenericRepo },
        { provide: getRepositoryToken(Cliente), useValue: mockGenericRepo },
        { provide: getRepositoryToken(Pedido), useValue: mockPedidoRepo },
        { provide: getRepositoryToken(ItemPedido), useValue: mockGenericRepo },
        { provide: FinanceiroService, useValue: mockFinanceiroService },
        { provide: PedidosService, useValue: {} },
        { provide: ProdutosService, useValue: mockProdutosService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    pedidoRepo = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should filter by vendedorId when user is Vendedor', async () => {
      const user = { id: 123, role: 'Vendedor' };
      const mockPedidos = [
        { total: 100, status: 'finalizado', dataPedido: new Date() },
        { total: 200, status: 'finalizado', dataPedido: new Date() },
      ];
      
      mockPedidoRepo.find.mockResolvedValue(mockPedidos);

      const result = await service.getStats('30d', 'empresa-1', user);

      expect(mockPedidoRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vendedorId: 123,
          }),
        }),
      );
      // Validar se totalVendas foi calculado corretamente
      expect(result.totalVendas).toBe(300);
    });

    it('should NOT filter by vendedorId when user is Admin', async () => {
      const user = { id: 999, role: 'Admin' };
      
      mockFinanceiroService.listarContasReceber.mockResolvedValue([
         { status: 'recebida', valorPago: 500, pagamento: new Date() }
      ]);
      mockFinanceiroService.listarContasPagar.mockResolvedValue([]);

      const result = await service.getStats('30d', 'empresa-1', user);

      // Admin logic uses FinanceiroService, verifies generic call
      expect(mockFinanceiroService.listarContasReceber).toHaveBeenCalledWith('empresa-1');
      expect(result.totalVendas).toBe(500);
    });
  });

  describe('getVendasMensais', () => {
      it('should filter pedidos by vendedorId', async () => {
          const user = { id: 123, role: 'Vendedor' };
          mockPedidoRepo.find.mockResolvedValue([]);

          await service.getVendasMensais(2023, 'empresa-1', user);
          
          expect(mockPedidoRepo.find).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                vendedorId: 123,
              }),
            }),
          );
      });
  });
});
