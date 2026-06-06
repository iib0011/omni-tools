export interface QueryParam {
  key: string;
  value: string;
}

export interface ParsedUrl {
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  params: QueryParam[];
}
