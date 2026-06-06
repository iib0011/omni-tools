export interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export interface ParsedUrl {
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  /** True when the input used a trailing slash on an origin-only URL (e.g. https://example.com/) */
  originTrailingSlash: boolean;
  params: QueryParam[];
}
