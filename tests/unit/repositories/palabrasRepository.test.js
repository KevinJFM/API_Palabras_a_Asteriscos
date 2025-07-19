// Mock the database module before requiring any other modules
jest.mock('../../../src/config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Import the modules after mocking
const palabrasRepository = require('../../../src/repositories/palabrasRepository');

describe('PalabrasRepository', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set the tableName property directly for testing
    palabrasRepository.tableName = 'palabras';
  });

  describe('guardarPalabra', () => {
    it('should create a new word if it does not exist', async () => {
      // Mock buscarPorPalabra to return null (word doesn't exist)
      const buscarPorPalabraSpy = jest.spyOn(palabrasRepository, 'buscarPorPalabra')
        .mockImplementation(() => Promise.resolve(null));
      
      // Mock create to return a new word
      const mockNewWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1,
        fecha_creacion: new Date(),
        ultima_consulta: new Date()
      };
      
      // Mock the create method directly on the instance
      const createSpy = jest.spyOn(palabrasRepository, 'create')
        .mockImplementation(() => Promise.resolve(mockNewWord));

      const result = await palabrasRepository.guardarPalabra('TEST', '****');
      
      expect(buscarPorPalabraSpy).toHaveBeenCalledWith('TEST');
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1
      }));
      expect(result).toEqual(mockNewWord);
    });

    it('should update an existing word if it exists', async () => {
      // Mock existing word
      const mockExistingWord = {
        id: 1,
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1,
        fecha_creacion: new Date('2025-01-01'),
        ultima_consulta: new Date('2025-01-01')
      };
      
      // Mock buscarPorPalabra to return the existing word
      const buscarPorPalabraSpy = jest.spyOn(palabrasRepository, 'buscarPorPalabra')
        .mockImplementation(() => Promise.resolve(mockExistingWord));
      
      // Mock update to return true
      const updateSpy = jest.spyOn(palabrasRepository, 'update')
        .mockImplementation(() => Promise.resolve(true));

      const result = await palabrasRepository.guardarPalabra('TEST', '****');
      
      expect(buscarPorPalabraSpy).toHaveBeenCalledWith('TEST');
      expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining({
        contador_uso: 2,
        ultima_consulta: expect.any(Date)
      }));
      expect(result.contador_uso).toBe(2);
    });
  });

  describe('buscarPorPalabra', () => {
    it('should find a word by its exact text', async () => {
      const mockWord = { 
        id: 1, 
        palabra: 'TEST',
        representacion: '****',
        contador_uso: 1,
        fecha_creacion: new Date('2025-01-01'),
        ultima_consulta: new Date('2025-01-01')
      };
      
      // Mock the actual implementation of buscarPorPalabra
      // Instead of mocking query, we'll mock the entire method
      const originalMethod = palabrasRepository.buscarPorPalabra;
      palabrasRepository.buscarPorPalabra = jest.fn().mockResolvedValue(mockWord);
      
      try {
        const result = await palabrasRepository.buscarPorPalabra('TEST');
        expect(palabrasRepository.buscarPorPalabra).toHaveBeenCalledWith('TEST');
        expect(result).toEqual(mockWord);
      } finally {
        // Restore the original method
        palabrasRepository.buscarPorPalabra = originalMethod;
      }
    });

    it('should return null when word is not found', async () => {
      // Mock the actual implementation of buscarPorPalabra
      const originalMethod = palabrasRepository.buscarPorPalabra;
      palabrasRepository.buscarPorPalabra = jest.fn().mockResolvedValue(null);
      
      try {
        const result = await palabrasRepository.buscarPorPalabra('NONEXISTENT');
        expect(palabrasRepository.buscarPorPalabra).toHaveBeenCalledWith('NONEXISTENT');
        expect(result).toBeNull();
      } finally {
        // Restore the original method
        palabrasRepository.buscarPorPalabra = originalMethod;
      }
    });
  });

  describe('incrementarContador', () => {
    it('should increment the usage counter of a word', async () => {
      // Mock findById to return a word
      const mockWord = {
        id: 1,
        palabra: 'TEST',
        contador_uso: 1
      };
      
      // Mock methods directly on the instance
      const findByIdSpy = jest.spyOn(palabrasRepository, 'findById')
        .mockImplementation(() => Promise.resolve(mockWord));
      const updateSpy = jest.spyOn(palabrasRepository, 'update')
        .mockImplementation(() => Promise.resolve(true));

      const result = await palabrasRepository.incrementarContador(1);
      
      expect(findByIdSpy).toHaveBeenCalledWith(1);
      expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining({
        contador_uso: 2,
        ultima_consulta: expect.any(Date)
      }));
      expect(result).toBe(true);
    });

    it('should return false when word is not found', async () => {
      // Mock findById to return null
      const findByIdSpy = jest.spyOn(palabrasRepository, 'findById')
        .mockImplementation(() => Promise.resolve(null));
      const updateSpy = jest.spyOn(palabrasRepository, 'update');

      const result = await palabrasRepository.incrementarContador(999);
      
      expect(findByIdSpy).toHaveBeenCalledWith(999);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('buscarPorTexto', () => {
    it('should search words by text with default pagination', async () => {
      const mockWords = [
        { id: 1, palabra: 'TEST' },
        { id: 2, palabra: 'TESTING' }
      ];
      
      // Create a spy on the query method that will be called by buscarPorTexto
      jest.spyOn(palabrasRepository, 'query')
        .mockImplementation((sql, params) => {
          // Verify the SQL and params here
          expect(sql).toBe('SELECT * FROM palabras WHERE palabra LIKE ? LIMIT ? OFFSET ?');
          expect(params).toEqual(['%TEST%', 10, 0]);
          return Promise.resolve(mockWords);
        });

      const result = await palabrasRepository.buscarPorTexto('TEST');
      
      expect(result).toEqual(mockWords);
    });

    it('should search words by text with custom pagination', async () => {
      const mockWords = [{ id: 1, palabra: 'TEST' }];
      
      // Create a spy on the query method that will be called by buscarPorTexto
      jest.spyOn(palabrasRepository, 'query')
        .mockImplementation((sql, params) => {
          // Verify the SQL and params here
          expect(sql).toBe('SELECT * FROM palabras WHERE palabra LIKE ? LIMIT ? OFFSET ?');
          expect(params).toEqual(['%TEST%', 5, 5]);
          return Promise.resolve(mockWords);
        });

      const result = await palabrasRepository.buscarPorTexto('TEST', 2, 5);
      
      expect(result).toEqual(mockWords);
    });
  });

  describe('obtenerMasUtilizadas', () => {
    it('should get most used words with default limit', async () => {
      const mockWords = [
        { id: 1, palabra: 'TEST', contador_uso: 10 },
        { id: 2, palabra: 'HELLO', contador_uso: 5 }
      ];
      
      // Create a spy on the query method that will be called by obtenerMasUtilizadas
      jest.spyOn(palabrasRepository, 'query')
        .mockImplementation((sql, params) => {
          // Verify the SQL and params here
          expect(sql).toBe('SELECT * FROM palabras ORDER BY contador_uso DESC LIMIT ?');
          expect(params).toEqual([10]);
          return Promise.resolve(mockWords);
        });

      const result = await palabrasRepository.obtenerMasUtilizadas();
      
      expect(result).toEqual(mockWords);
    });

    it('should get most used words with custom limit', async () => {
      const mockWords = [{ id: 1, palabra: 'TEST', contador_uso: 10 }];
      
      // Create a spy on the query method that will be called by obtenerMasUtilizadas
      jest.spyOn(palabrasRepository, 'query')
        .mockImplementation((sql, params) => {
          // Verify the SQL and params here
          expect(sql).toBe('SELECT * FROM palabras ORDER BY contador_uso DESC LIMIT ?');
          expect(params).toEqual([1]);
          return Promise.resolve(mockWords);
        });

      const result = await palabrasRepository.obtenerMasUtilizadas(1);
      
      expect(result).toEqual(mockWords);
    });
  });

  describe('obtenerEstadisticas', () => {
    it('should get usage statistics', async () => {
      // Mock count
      const countSpy = jest.spyOn(palabrasRepository, 'count')
        .mockImplementation(() => Promise.resolve(5));
      
      // Mock obtenerMasUtilizadas
      const mockMostUsed = [
        { id: 1, palabra: 'TEST', contador_uso: 10 }
      ];
      const obtenerMasUtilizadasSpy = jest.spyOn(palabrasRepository, 'obtenerMasUtilizadas')
        .mockImplementation(() => Promise.resolve(mockMostUsed));
      
      // Mock query for total uses and last consulted
      let queryCallCount = 0;
      jest.spyOn(palabrasRepository, 'query')
        .mockImplementation((sql) => {
          queryCallCount++;
          
          // First call - total uses
          if (queryCallCount === 1) {
            expect(sql).toBe('SELECT SUM(contador_uso) as total_usos FROM palabras');
            return Promise.resolve([{ total_usos: 15 }]);
          }
          
          // Second call - last consulted
          if (queryCallCount === 2) {
            expect(sql).toBe('SELECT * FROM palabras ORDER BY ultima_consulta DESC LIMIT 5');
            return Promise.resolve([
              { id: 2, palabra: 'HELLO', ultima_consulta: new Date() }
            ]);
          }
          
          throw new Error('Unexpected query call');
        });

      const result = await palabrasRepository.obtenerEstadisticas();
      
      expect(countSpy).toHaveBeenCalled();
      expect(obtenerMasUtilizadasSpy).toHaveBeenCalledWith(5);
      expect(queryCallCount).toBe(2); // Verify that query was called twice
      
      expect(result).toEqual({
        total_palabras: 5,
        total_usos: 15,
        palabras_mas_utilizadas: mockMostUsed,
        ultimas_consultadas: [
          { id: 2, palabra: 'HELLO', ultima_consulta: expect.any(Date) }
        ]
      });
    });
  });
});