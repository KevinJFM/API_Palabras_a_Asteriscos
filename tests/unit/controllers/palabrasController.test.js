const palabrasController = require('../../../src/controllers/palabrasController');
const palabrasService = require('../../../src/services/palabrasService');

// Mock the service
jest.mock('../../../src/services/palabrasService');

describe('PalabrasController', () => {
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
    
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('PalabraEnAsteriscos', () => {
    it('should process a word and return its representation', async () => {
      // Setup request
      req.body = { palabra: 'TEST' };
      
      // Mock service response
      const mockResult = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1
      };
      palabrasService.procesarPalabra.mockResolvedValue(mockResult);

      // Call controller
      await palabrasController.PalabraEnAsteriscos(req, res);
      
      // Verify service was called
      expect(palabrasService.procesarPalabra).toHaveBeenCalledWith('TEST');
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        palabra: 'TEST',
        resultado: '****',
        contador_uso: 1
      });
    });

    it('should return 400 if no word is provided', async () => {
      // Setup request with empty body
      req.body = {};

      // Call controller
      await palabrasController.PalabraEnAsteriscos(req, res);
      
      // Verify service was not called
      expect(palabrasService.procesarPalabra).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere una palabra' });
    });

    it('should return 500 if service throws an error', async () => {
      // Setup request
      req.body = { palabra: 'TEST' };
      
      // Mock service error
      palabrasService.procesarPalabra.mockRejectedValue(new Error('Service error'));

      // Call controller
      await palabrasController.PalabraEnAsteriscos(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al procesar la palabra' });
    });
  });

  describe('obtenerPalabra', () => {
    it('should get a word by id', async () => {
      // Setup request
      req.params = { id: '1' };
      
      // Mock service response
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 2
      };
      palabrasService.obtenerPalabra.mockResolvedValue(mockWord);

      // Call controller
      await palabrasController.obtenerPalabra(req, res);
      
      // Verify service was called
      expect(palabrasService.obtenerPalabra).toHaveBeenCalledWith(1);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockWord);
    });

    it('should return 400 if no id is provided', async () => {
      // Setup request with empty params
      req.params = {};

      // Call controller
      await palabrasController.obtenerPalabra(req, res);
      
      // Verify service was not called
      expect(palabrasService.obtenerPalabra).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere un ID válido' });
    });

    it('should return 404 if word is not found', async () => {
      // Setup request
      req.params = { id: '999' };
      
      // Mock service error
      palabrasService.obtenerPalabra.mockRejectedValue(new Error('No se encontró la palabra con ID 999'));

      // Call controller
      await palabrasController.obtenerPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se encontró la palabra con ID 999' });
    });

    it('should return 500 for other errors', async () => {
      // Setup request
      req.params = { id: '1' };
      
      // Mock service error
      palabrasService.obtenerPalabra.mockRejectedValue(new Error('Database error'));

      // Call controller
      await palabrasController.obtenerPalabra(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener la palabra' });
    });
  });

  describe('listarPalabras', () => {
    it('should list words with default pagination', async () => {
      // Setup request
      req.query = {};
      
      // Mock service response
      const mockResult = {
        palabras: [{ id: 1, palabra: 'TEST' }],
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 1,
          paginas: 1
        }
      };
      palabrasService.listarPalabras.mockResolvedValue(mockResult);

      // Call controller
      await palabrasController.listarPalabras(req, res);
      
      // Verify service was called
      expect(palabrasService.listarPalabras).toHaveBeenCalledWith(1, 10);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should list words with custom pagination', async () => {
      // Setup request
      req.query = { pagina: '2', limite: '5' };
      
      // Mock service response
      const mockResult = {
        palabras: [{ id: 1, palabra: 'TEST' }],
        paginacion: {
          pagina: 2,
          limite: 5,
          total: 6,
          paginas: 2
        }
      };
      palabrasService.listarPalabras.mockResolvedValue(mockResult);

      // Call controller
      await palabrasController.listarPalabras(req, res);
      
      // Verify service was called
      expect(palabrasService.listarPalabras).toHaveBeenCalledWith(2, 5);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 500 if service throws an error', async () => {
      // Setup request
      req.query = {};
      
      // Mock service error
      palabrasService.listarPalabras.mockRejectedValue(new Error('Service error'));

      // Call controller
      await palabrasController.listarPalabras(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al listar las palabras' });
    });
  });

  describe('buscarPalabras', () => {
    it('should search words by text', async () => {
      // Setup request
      req.query = { texto: 'TEST' };
      
      // Mock service response
      const mockResult = {
        palabras: [{ id: 1, palabra: 'TEST' }],
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 1,
          paginas: 1
        },
        filtro: 'TEST'
      };
      palabrasService.buscarPalabras.mockResolvedValue(mockResult);

      // Call controller
      await palabrasController.buscarPalabras(req, res);
      
      // Verify service was called
      expect(palabrasService.buscarPalabras).toHaveBeenCalledWith('TEST', 1, 10);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should search words with custom pagination', async () => {
      // Setup request
      req.query = { texto: 'TEST', pagina: '2', limite: '5' };
      
      // Mock service response
      const mockResult = {
        palabras: [{ id: 1, palabra: 'TEST' }],
        paginacion: {
          pagina: 2,
          limite: 5,
          total: 6,
          paginas: 2
        },
        filtro: 'TEST'
      };
      palabrasService.buscarPalabras.mockResolvedValue(mockResult);

      // Call controller
      await palabrasController.buscarPalabras(req, res);
      
      // Verify service was called
      expect(palabrasService.buscarPalabras).toHaveBeenCalledWith('TEST', 2, 5);
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 500 if service throws an error', async () => {
      // Setup request
      req.query = { texto: 'TEST' };
      
      // Mock service error
      palabrasService.buscarPalabras.mockRejectedValue(new Error('Service error'));

      // Call controller
      await palabrasController.buscarPalabras(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al buscar palabras' });
    });
  });
});