/* 
Represents a set of rows indexed by a key.
Used for calculator presets

*/
export interface DataTable {
  title: string;
  /* A JSON schema properties  */
  columns: {
    [key: string]: any;
  };
  data: {
    [key: string]: {
      [key: string]: any;
    };
  };
}
