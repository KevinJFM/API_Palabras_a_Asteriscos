const palabrasService = require('../../../src/services/palabrasService');
const palabrasRepository = require('../../../src/repositories/palabrasRepository');

// Mock the repository
jest.mock('../../../src/repositories/palabrasRepository');

// Mock the Alfabeto helper
jest.mock('../../../src/helpers/Alfabeto', () => ({
  'A': ['   A   ', '  A A  ', ' A   A ', 'AAAAAAA', 'A     A', 'A     A', 'A     A'],
  'B': ['BBBBBB ', 'B     B', 'B     B', 'BBBBBB ', 'B     B', 'B     B', 'BBBBBB ']
}));

describe('PalabrasService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('procesarPalabra', () => {
    it('should process a word and save it', async () => {
      // Mock repository response
      const mockSavedWord = {
        id: 1,
        palabra: 'AB',
        representacion: '   A      BBBBBB \n  A A     B     B\n A   A    B     B\nAAAAAAA   BBBBBB \nA     A   B     B\nA     A   B     B\nA     A   BBBBBB ',
        contador_uso: 1,
        fecha_creacion: new Date(),
        ultima_consulta: new Date()
      };
      palabrasRepository.guardarPalabra.mockResolvedValue(mockSavedWord);

      const result = await palabrasService.procesarPalabra('AB');
      
      expect(palabrasRepository.guardarPalabra).toHaveBeenCalledWith(
        'AB',
        expect.any(String)
      );
      expect(result).toEqual(mockSavedWord);
    });

    it('should throw an error if no word is provided', async () => {
      await expect(palabrasService.procesarPalabra()).rejects.toThrow('Se requiere una palabra');
      await expect(palabrasService.procesarPalabra('')).rejects.toThrow('Se requiere una palabra');
    });
  });

  describe('obtenerPalabra', () => {
    it('should get a word by id and increment its counter', async () => {
      // Mock findById responses
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1
      };
      const mockUpdatedWord = {
        ...mockWord,
        contador_uso: 2
      };
      
      palabrasRepository.findById.mockResolvedValueOnce(mockWord);
      palabrasRepository.findById.mockResolvedValueOnce(mockUpdatedWord);
      palabrasRepository.incrementarContador.mockResolvedValue(true);

      const result = await palabrasService.obtenerPalabra(1);
      
      expect(palabrasRepository.findById).toHaveBeenCalledWith(1);
      expect(palabrasRepository.incrementarContador).toHaveBeenCalledWith(1);
      expect(palabrasRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUpdatedWord);
    });

    it('should throw an error if word is not found', async () => {
      palabrasRepository.findById.mockResolvedValue(null);

      await expect(palabrasService.obtenerPalabra(999)).rejects.toThrow('No se encontró la palabra con ID 999');
      expect(palabrasRepository.findById).toHaveBeenCalledWith(999);
      expect(palabrasRepository.incrementarContador).not.toHaveBeenCalled();
    });
  });

  describe('listarPalabras', () => {
    it('should list words with default pagination', async () => {
      // Mock repository responses
      const mockWords = [
        { id: 1, palabra: 'TEST1' },
        { id: 2, palabra: 'TEST2' }
      ];
      palabrasRepository.findAll.mockResolvedValue(mockWords);
      palabrasRepository.count.mockResolvedValue(2);

      const result = await palabrasService.listarPalabras();
      
      expect(palabrasRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(palabrasRepository.count).toHaveBeenCalled();
      expect(result).toEqual({
        palabras: mockWords,
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 2,
          paginas: 1
        }
      });
    });

    it('should list words with custom pagination', async () => {
      // Mock repository responses
      const mockWords = [{ id: 1, palabra: 'TEST1' }];
      palabrasRepository.findAll.mockResolvedValue(mockWords);
      palabrasRepository.count.mockResolvedValue(5);

      const result = await palabrasService.listarPalabras(2, 2);
      
      expect(palabrasRepository.findAll).toHaveBeenCalledWith(2, 2);
      expect(palabrasRepository.count).toHaveBeenCalled();
      expect(result).toEqual({
        palabras: mockWords,
        paginacion: {
          pagina: 2,
          limite: 2,
          total: 5,
          paginas: 3
        }
      });
    });
  });

  describe('buscarPalabras', () => {
    it('should search words by text', async () => {
      // Mock repository responses
      const mockWords = [
        { id: 1, palabra: 'TEST' },
        { id: 2, palabra: 'TESTING' }
      ];
      palabrasRepository.buscarPorTexto.mockResolvedValue(mockWords);
      palabrasRepository.count.mockResolvedValue(2);

      const result = await palabrasService.buscarPalabras('TEST');
      
      expect(palabrasRepository.buscarPorTexto).toHaveBeenCalledWith('TEST', 1, 10);
      expect(result).toEqual({
        palabras: mockWords,
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 2,
          paginas: 1
        },
        filtro: 'TEST'
      });
    });

    it('should list all words if no search text is provided', async () => {
      // Mock listarPalabras
      const mockListResult = {
        palabras: [{ id: 1, palabra: 'TEST' }],
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 1,
          paginas: 1
        }
      };
      
      // Spy on listarPalabras
      jest.spyOn(palabrasService, 'listarPalabras').mockResolvedValue(mockListResult);

      const result = await palabrasService.buscarPalabras('');
      
      expect(palabrasService.listarPalabras).toHaveBeenCalledWith(1, 10);
      expect(palabrasRepository.buscarPorTexto).not.toHaveBeenCalled();
      expect(result).toEqual(mockListResult);
    });
  });
});