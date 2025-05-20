//unit test CRUD

import ServicesService from '../../src/services/services.service';
import { ServiceEntity } from '../../src/entities/Service.entity';

// Création d’un fake repository avec les méthodes utilisées
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
};

// Mock de datasource pour retourner le fake repository
jest.mock('../../src/lib/datasource', () => ({
  __esModule: true,
  default: {
    getRepository: () => mockRepository,
  },
}));

describe('ServicesService', () => {
  let service: ServicesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ServicesService();
  });

  it('createService crée et sauvegarde un service', async () => {
    const data = { name: 'Radiologie' };
    const fakeService = {
      id: 'uuid-123',
      name: 'Radiologie',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ServiceEntity;

    // Comportement simulé du repository
    mockRepository.create.mockReturnValue(fakeService);
    mockRepository.save.mockResolvedValue(fakeService);

    const result = await service.createService(data);

    // Vérifications
    expect(mockRepository.create).toHaveBeenCalledWith(data);
    expect(mockRepository.save).toHaveBeenCalledWith(fakeService);
    expect(result).toEqual(fakeService);
  });

   it('getAllServices retourne tous les services', async () => {
    const fakeServices = [
      { id: 'uuid-123', name: 'Radiologie' },
      { id: 'uuid-456', name: 'Cardiologie' },
    ];
    mockRepository.find.mockResolvedValue(fakeServices);

    const result = await service.getAllServices();

    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual(fakeServices);
  });

  it('getServiceById retourne un service si trouvé', async () => {
    const fakeService = { id: 'uuid-123', name: 'Radiologie' };
    mockRepository.findOneBy.mockResolvedValue(fakeService);

    const result = await service.getServiceById('uuid-123');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-123' });
    expect(result).toEqual(fakeService);
  });

  it("getServiceById retourne null si non trouvé", async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await service.getServiceById('uuid-999');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-999' });
    expect(result).toBeNull();
  });

  it('updateService met à jour un service si trouvé', async () => {
    const existing = { id: 'uuid-123', name: 'Radiologie' };
    const updates = { name: 'Radiologie avancée' };
    const updated = { ...existing, ...updates };

    mockRepository.findOneBy.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(updated);

    const result = await service.updateService('uuid-123', updates);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-123' });
    expect(mockRepository.save).toHaveBeenCalledWith(updated);
    expect(result).toEqual(updated);
  });

  it("updateService retourne null si le service n'existe pas", async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await service.updateService('uuid-999', { name: 'Test' });

    expect(result).toBeNull();
  });

  it('deleteService retourne true si suppression réussie', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.deleteService('uuid-123');

    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-123');
    expect(result).toBe(true);
  });

  it('deleteService retourne false si aucune suppression', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 0 });

    const result = await service.deleteService('uuid-123');

    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-123');
    expect(result).toBe(false);
  });
});
