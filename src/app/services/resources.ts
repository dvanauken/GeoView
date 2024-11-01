import * as Papa from 'papaparse';

export class Resources {
  static async load(filePaths: string[]): Promise<any[]> {
    try {
      const results = [];
      for (const path of filePaths) {
        let data;
        if (path.endsWith('.json') || path.endsWith('.geojson')) {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`Failed to load ${path}`);
          data = await response.json();
        } else if (path.endsWith('.csv')) {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`Failed to load ${path}`);
          const csvText = await response.text();
          data = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          }).data;
        }
        results.push({ data, path });
      }
      return results;
    } catch (err) {
      console.error('Error during resource loading:', err);
      throw err;
    }
  }
}
