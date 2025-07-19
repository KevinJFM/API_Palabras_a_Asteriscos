const adminController = require('../../../src/controllers/adminController');
const adminService = require('../../../src/services/adminService');

// Mock the service
jest.mock('../../../src/services/adminService');

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('eliminarPalabra', () => {
    it('should delete a word by id', async () => {
      // Setup request
      req.params = { id: '1' };
      
      // Mock service response
      adminService.eliminarPalabra.mockResolvedValue(true);

      // Call controller
      await adminController.eliminarPalabra(req, res);
      
      // Verify service was called
      expect(adminService.eliminarPalabra).toHaveBeenCalledWith(1);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Palabra con ID 1 eliminada correctamente' });
    });

    it('should return 400 if no id is provided', async () => {
      // Setup request with empty params
      req.params = {};

      // Call controller
      await adminController.eliminarPalabra(req, res);
      
      // Verify service was not called
      expect(adminService.eliminarPalabra).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere un ID válido' });
    });

    it('should return 404 if word cannot be deleted', async () => {
      // Setup request
      req.params = { id: '999' };
      
      // Mock service error
      adminService.eliminarPalabra.mockRejectedValue(new Error('No se pudo eliminar la palabra con ID 999'));

      // Call controller
      await adminController.eliminarPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo eliminar la palabra con ID 999' });
    });

    it('should return 500 for other errors', async () => {
      // Setup request
      req.params = { id: '1' };
      
      // Mock service error
      adminService.eliminarPalabra.mockRejectedValue(new Error('Database error'));

      // Call controller
      await adminController.eliminarPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar la palabra' });
    });
  });

  describe('actualizarPalabra', () => {
    it('should update a word', async () => {
      // Setup request
      req.params = { id: '1' };
      req.body = { palabra: 'UPDATED' };
      
      // Mock service response
      const mockUpdatedWord = {
        id: 1,
        palabra: 'UPDATED',
        representacion: '******',
        contador_uso: 1
      };
      adminService.actualizarPalabra.mockResolvedValue(mockUpdatedWord);

      // Call controller
      await adminController.actualizarPalabra(req, res);
      
      // Verify service was called
      expect(adminService.actualizarPalabra).toHaveBeenCalledWith(1, { palabra: 'UPDATED' });
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockUpdatedWord);
    });

    it('should return 400 if no id is provided', async () => {
      // Setup request with empty params
      req.params = {};
      req.body = { palabra: 'UPDATED' };

      // Call controller
      await adminController.actualizarPalabra(req, res);
      
      // Verify service was not called
      expect(adminService.actualizarPalabra).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere un ID válido' });
    });

    it('should return 400 if no data is provided', async () => {
      // Setup request with empty body
      req.params = { id: '1' };
      req.body = {};

      // Call controller
      await adminController.actualizarPalabra(req, res);
      
      // Verify service was not called
      expect(adminService.actualizarPalabra).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requieren datos para actualizar' });
    });

    it('should return 404 if word is not found', async () => {
      // Setup request
      req.params = { id: '999' };
      req.body = { palabra: 'UPDATED' };
      
      // Mock service error
      adminService.actualizarPalabra.mockRejectedValue(new Error('No se encontró la palabra con ID 999'));

      // Call controller
      await adminController.actualizarPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se encontró la palabra con ID 999' });
    });

    it('should return 500 for other errors', async () => {
      // Setup request
      req.params = { id: '1' };
      req.body = { palabra: 'UPDATED' };
      
      // Mock service error
      adminService.actualizarPalabra.mockRejectedValue(new Error('Database error'));

      // Call controller
      await adminController.actualizarPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar la palabra' });
    });
  });

  describe('obtenerEstadisticas', () => {
    it('should get usage statistics', async () => {
      // Mock service response
      const mockStats = {
        total_palabras: 5,
        total_usos: 15,
        palabras_mas_utilizadas: [{ id: 1, palabra: 'TEST', contador_uso: 10 }],
        ultimas_consultadas: [{ id: 2, palabra: 'HELLO', ultima_consulta: new Date() }]
      };
      adminService.obtenerEstadisticas.mockResolvedValue(mockStats);

      // Call controller
      await adminController.obtenerEstadisticas(req, res);
      
      // Verify service was called
      expect(adminService.obtenerEstadisticas).toHaveBeenCalled();
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('should return 500 if service throws an error', async () => {
      // Mock service error
      adminService.obtenerEstadisticas.mockRejectedValue(new Error('Service error'));

      // Call controller
      await adminController.obtenerEstadisticas(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener estadísticas' });
    });
  });
});