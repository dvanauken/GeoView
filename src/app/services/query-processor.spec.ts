import { processAndSortData } from './queryProcessor';

describe('Query Processor', () => {
  const mockData = [
    { al: 'DL', base: 'ATL', ref: 'JFK' },
    { al: 'AA', base: 'LAX', ref: 'DFW' },
    { al: 'DL', base: 'SLC', ref: 'SEA' },
    { al: 'DL', base: 'MSP', ref: 'ORD' },
    { al: 'UA', base: 'DEN', ref: 'IAH' }
  ];

  it('should filter data with a simple "eq" condition', () => {
    const query = {
      and: [{ field: 'al', operator: 'eq', value: 'DL' }]
    };
    const result = processAndSortData(mockData, query);
    expect(result).toEqual([
      { al: 'DL', base: 'ATL', ref: 'JFK' },
      { al: 'DL', base: 'SLC', ref: 'SEA' },
      { al: 'DL', base: 'MSP', ref: 'ORD' }
    ]);
  });

  it('should filter data with "not_in" condition', () => {
    const query = {
      and: [{ field: 'base', operator: 'not_in', value: ['ATL', 'MSP'] }]
    };
    const result = processAndSortData(mockData, query);
    expect(result).toEqual([
      { al: 'AA', base: 'LAX', ref: 'DFW' },
      { al: 'DL', base: 'SLC', ref: 'SEA' },
      { al: 'UA', base: 'DEN', ref: 'IAH' }
    ]);
  });

  it('should filter data with nested "or" and "and" conditions', () => {
    const query = {
      or: [
        { field: 'al', operator: 'eq', value: 'UA' },
        {
          and: [
            { field: 'al', operator: 'eq', value: 'DL' },
            { field: 'ref', operator: 'in', value: ['SEA', 'ORD'] }
          ]
        }
      ]
    };
    const result = processAndSortData(mockData, query);
    expect(result).toEqual([
      { al: 'DL', base: 'SLC', ref: 'SEA' },
      { al: 'DL', base: 'MSP', ref: 'ORD' },
      { al: 'UA', base: 'DEN', ref: 'IAH' }
    ]);
  });

  it('should sort data based on the "base" field in ascending order', () => {
    const query = {
      sort: { field: 'base', order: 'asc' }
    };
    const result = processAndSortData(mockData, query);
    expect(result).toEqual([
      { al: 'DL', base: 'ATL', ref: 'JFK' },
      { al: 'UA', base: 'DEN', ref: 'IAH' },
      { al: 'AA', base: 'LAX', ref: 'DFW' },
      { al: 'DL', base: 'MSP', ref: 'ORD' },
      { al: 'DL', base: 'SLC', ref: 'SEA' }
    ]);
  });
});
