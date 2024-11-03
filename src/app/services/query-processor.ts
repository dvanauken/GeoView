// export type QueryCondition = {
//     field: string;
//     operator: 'eq' | 'in' | 'not_in';
//     value: any;
//   };
  
//   export type Query = {
//     and?: QueryCondition[] | Query[];
//     or?: QueryCondition[] | Query[];
//     sort?: { field: string; order: 'asc' | 'desc' };
//   };
  
//   // Function to evaluate a single condition
//   function evaluateCondition(item: any, condition: QueryCondition): boolean {
//     switch (condition.operator) {
//       case 'eq':
//         return item[condition.field] === condition.value;
//       case 'in':
//         return Array.isArray(condition.value) && condition.value.includes(item[condition.field]);
//       case 'not_in':
//         return Array.isArray(condition.value) && !condition.value.includes(item[condition.field]);
//       default:
//         throw new Error(`Unsupported operator: ${condition.operator}`);
//     }
//   }
  
//   // Function to process a query with nested logic
//   export function processQuery(data: any[], query: Query): any[] {
//     if (query.and) {
//       return data.filter(item => query.and!.every(subQuery => Array.isArray(subQuery) ? processQuery([item], subQuery).length > 0 : evaluateCondition(item, subQuery)));
//     }
//     if (query.or) {
//       return data.filter(item => query.or!.some(subQuery => Array.isArray(subQuery) ? processQuery([item], subQuery).length > 0 : evaluateCondition(item, subQuery)));
//     }
//     return data;
//   }
  
//   // Function to apply sorting
//   export function sortData(data: any[], sort: { field: string; order: 'asc' | 'desc' }): any[] {
//     return data.sort((a, b) => {
//       if (sort.order === 'asc') return a[sort.field] > b[sort.field] ? 1 : -1;
//       return a[sort.field] < b[sort.field] ? 1 : -1;
//     });
//   }
  
//   // Main function to process and sort data based on query
//   export function processAndSortData(data: any[], query: Query): any[] {
//     let filteredData = processQuery(data, query);
//     if (query.sort) {
//       filteredData = sortData(filteredData, query.sort);
//     }
//     return filteredData;
//   }
  