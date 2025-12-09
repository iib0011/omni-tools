declare module 'units-converter' {
  export type UnitDescription = {
    unit: string;
    system: string;
    singular: string;
    plural: string;
  };
  export type Converter = (value?: number) => {
    from: (unit: string) => {
      to: (unit: string) => {
        value: number;
        unit: string;
        system: string;
        singular: string;
        plural: string;
      };
      toBest: (opts?: { exclude?: string[] }) => {
        value: number;
        unit: string;
        system: string;
        singular: string;
        plural: string;
      };
      possibilities: () => string[];
    };
    list: () => UnitDescription[];
    describe: (unit: string) => UnitDescription;
  };
  export const length: Converter;
  export const mass: Converter;
  export const volume: Converter;
  export const area: Converter;
  export const current: Converter;
  export const power: Converter;
  export const energy: Converter;
  export const digital: Converter;
  export const temperature: Converter;
  export const speed: Converter;
  export const voltage: Converter;
}
