const adminService = require('../../../src/services/adminService');
const palabrasRepository = require('../../../src/repositories/palabrasRepository');

// Mock the repository
jest.mock('../../../src/repositories/palabrasRepository');

describe('AdminService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('eliminarPalabra', () => {
    it('should delete a word by id', async () => {
      palabrasRepository.delete.mockResolvedValue(true);

      const result = await adminService.eliminarPalabra(1);
      
      expect(palabrasRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw an error if word cannot be deleted', async () => {
      palabrasRepository.delete.mockResolvedValue(false);

      await expect(adminService.eliminarPalabra(999)).rejects.toThrow('No se pudo eliminar la palabra con ID 999');
      expect(palabrasRepository.delete).toHaveBeenCalledWith(999);
    });
  });

  describe('actualizarPalabra', () => {
    it('should update a word with valid fields', async () => {
      // Mock findById to return a word
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****'
      };
      palabrasRepository.findById.mockResolvedValueOnce(mockWord);
      
      // Mock update to return true
      palabrasRepository.update.mockResolvedValue(true);
      
      // Mock findById after update to return updated word
      const mockUpdatedWord = {
        id: 1,
        palabra: 'UPDATED',
        representacion: '******'
      };
      palabrasRepository.findById.mockResolvedValueOnce(mockUpdatedWord);

      const updateData = {
        palabra: 'UPDATED',
        representacion: '******'
      };
      
      const result = await adminService.actualizarPalabra(1, updateData);
      
      expect(palabrasRepository.findById).toHaveBeenCalledWith(1);
      expect(palabrasRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        palabra: 'UPDATED',
        representacion: '******',
        ultima_consulta: expect.any(Date)
      }));
      expect(palabrasRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUpdatedWord);
    });

    it('should throw an error if word is not found', async () => {
      palabrasRepository.findById.mockResolvedValue(null);

      await expect(adminService.actualizarPalabra(999, { palabra: 'UPDATED' })).rejects.toThrow('No se encontró la palabra con ID 999');
      expect(palabrasRepository.findById).toHaveBeenCalledWith(999);
      expect(palabrasRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if update fails', async () => {
      // Mock findById to return a word
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****'
      };
      palabrasRepository.findById.mockResolvedValue(mockWord);
      
      // Mock update to return false (update failed)
      palabrasRepository.update.mockResolvedValue(false);

      await expect(adminService.actualizarPalabra(1, { palabra: 'UPDATED' })).rejects.toThrow('No se pudo actualizar la palabra con ID 1');
      expect(palabrasRepository.findById).toHaveBeenCalledWith(1);
      expect(palabrasRepository.update).toHaveBeenCalled();
    });

    it('should only update allowed fields', async () => {
      // Mock findById to return a word
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 5
      };
      palabrasRepository.findById.mockResolvedValueOnce(mockWord);
      
      // Mock update to return true
      palabrasRepository.update.mockResolvedValue(true);
      
      // Mock findById after update to return updated word
      const mockUpdatedWord = {
        id: 1,
        palabra: 'UPDATED',
        representacion: '****',
        contador_uso: 5
      };
      palabrasRepository.findById.mockResolvedValueOnce(mockUpdatedWord);

      // Try to update both allowed and disallowed fields
      const updateData = {
        palabra: 'UPDATED',
        contador_uso: 999 // This should be ignored
      };
      
      await adminService.actualizarPalabra(1, updateData);
      
      // Verify that only allowed fields were updated
      expect(palabrasRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        palabra: 'UPDATED',
        ultima_consulta: expect.any(Date)
      }));
      
      // Verify that disallowed fields were not included
      expect(palabrasRepository.update).not.toHaveBeenCalledWith(
        1, 
        expect.objectContaining({ contador_uso: 999 })
      );
    });
  });

  describe('obtenerEstadisticas', () => {
    it('should get usage statistics', async () => {
      // Mock repository response
      const mockStats = {
        total_palabras: 5,
        total_usos: 15,
        palabras_mas_utilizadas: [{ id: 1, palabra: 'TEST', contador_uso: 10 }],
        ultimas_consultadas: [{ id: 2, palabra: 'HELLO', ultima_consulta: new Date() }]
      };
      palabrasRepository.obtenerEstadisticas.mockResolvedValue(mockStats);

      const result = await adminService.obtenerEstadisticas();
      
      expect(palabrasRepository.obtenerEstadisticas).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});