const BaseRepository = require('../../../src/repositories/baseRepository');

// Mock the database pool
jest.mock('../../../src/config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../../src/config/database');

describe('BaseRepository', () => {
  let repository;
  const tableName = 'test_table';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    repository = new BaseRepository(tableName);
  });

  describe('query', () => {
    it('should execute a query successfully', async () => {
      const mockResults = [{ id: 1, name: 'Test' }];
      pool.query.mockResolvedValue([mockResults]);

      const result = await repository.query('SELECT * FROM test_table');
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM test_table', []);
      expect(result).toEqual(mockResults);
    });

    it('should throw an error when query fails', async () => {
      const mockError = new Error('Database error');
      pool.query.mockRejectedValue(mockError);

      await expect(repository.query('SELECT * FROM test_table')).rejects.toThrow('Error en la base de datos: Database error');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM test_table', []);
    });
  });

  describe('findById', () => {
    it('should find a record by id', async () => {
      const mockRecord = { id: 1, name: 'Test' };
      pool.query.mockResolvedValue([[mockRecord]]);

      const result = await repository.findById(1);
      
      expect(pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} WHERE id = ?`, [1]);
      expect(result).toEqual(mockRecord);
    });

    it('should return null when no record is found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await repository.findById(999);
      
      expect(pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} WHERE id = ?`, [999]);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all records with default pagination', async () => {
      const mockRecords = [{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }];
      pool.query.mockResolvedValue([mockRecords]);

      const result = await repository.findAll();
      
      expect(pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [10, 0]);
      expect(result).toEqual(mockRecords);
    });

    it('should find all records with custom pagination', async () => {
      const mockRecords = [{ id: 1, name: 'Test1' }];
      pool.query.mockResolvedValue([mockRecords]);

      const result = await repository.findAll(2, 5);
      
      expect(pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [5, 5]);
      expect(result).toEqual(mockRecords);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const newRecord = { name: 'New Test', value: 123 };
      pool.query.mockResolvedValue([{ insertId: 1 }]);

      const result = await repository.create(newRecord);
      
      expect(pool.query).toHaveBeenCalledWith(
        `INSERT INTO ${tableName} (name, value) VALUES (?, ?)`,
        ['New Test', 123]
      );
      expect(result).toEqual({ id: 1, ...newRecord });
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const updateData = { name: 'Updated Test', value: 456 };
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await repository.update(1, updateData);
      
      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE ${tableName} SET name = ?, value = ? WHERE id = ?`,
        ['Updated Test', 456, 1]
      );
      expect(result).toBe(true);
    });

    it('should return false when no record is updated', async () => {
      const updateData = { name: 'Updated Test' };
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await repository.update(999, updateData);
      
      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE ${tableName} SET name = ? WHERE id = ?`,
        ['Updated Test', 999]
      );
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a record', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await repository.delete(1);
      
      expect(pool.query).toHaveBeenCalledWith(`DELETE FROM ${tableName} WHERE id = ?`, [1]);
      expect(result).toBe(true);
    });

    it('should return false when no record is deleted', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await repository.delete(999);
      
      expect(pool.query).toHaveBeenCalledWith(`DELETE FROM ${tableName} WHERE id = ?`, [999]);
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count all records', async () => {
      pool.query.mockResolvedValue([[{ total: 10 }]]);

      const result = await repository.count();
      
      expect(pool.query).toHaveBeenCalledWith(`SELECT COUNT(*) as total FROM ${tableName}`, []);
      expect(result).toBe(10);
    });
  });

  describe('findByCriteria', () => {
    it('should find records by criteria', async () => {
      const criteria = { name: 'Test', active: true };
      const mockRecords = [{ id: 1, name: 'Test', active: true }];
      pool.query.mockResolvedValue([mockRecords]);

      const result = await repository.findByCriteria(criteria);
      
      expect(pool.query).toHaveBeenCalledWith(
        `SELECT * FROM ${tableName} WHERE name = ? AND active = ?`,
        ['Test', true]
      );
      expect(result).toEqual(mockRecords);
    });
  });
});