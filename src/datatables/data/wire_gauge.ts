import type { DataTable } from '../types';

const data: DataTable = {
  title: 'American Wire Gauge',
  columns: {
    diameter: {
      title: 'Diameter',
      type: 'number',
      unit: 'mm'
    },
    area: {
      title: 'Area',
      type: 'number',
      unit: 'mm2'
    }
  },
  data: {
    '0000 AWG': { diameter: 11.684 },
    '000 AWG': { diameter: 10.405 },
    '00 AWG': { diameter: 9.266 },
    '0 AWG': { diameter: 8.251 },
    '(4/0) AWG': { diameter: 11.684 },
    '(3/0) AWG': { diameter: 10.405 },
    '(2/0) AWG': { diameter: 9.266 },
    '(1/0) AWG': { diameter: 8.251 },
    '1 AWG': { diameter: 7.348 },
    '2 AWG': { diameter: 6.544 },
    '3 AWG': { diameter: 5.827 },
    '4 AWG': { diameter: 5.189 },
    '5 AWG': { diameter: 4.621 },
    '6 AWG': { diameter: 4.115 },
    '7 AWG': { diameter: 3.665 },
    '8 AWG': { diameter: 3.264 },
    '9 AWG': { diameter: 2.906 },
    '10 AWG': { diameter: 2.588 },
    '11 AWG': { diameter: 2.305 },
    '12 AWG': { diameter: 2.053 },
    '13 AWG': { diameter: 1.828 },
    '14 AWG': { diameter: 1.628 },
    '15 AWG': { diameter: 1.45 },
    '16 AWG': { diameter: 1.291 },
    '17 AWG': { diameter: 1.15 },
    '18 AWG': { diameter: 1.024 },
    '19 AWG': { diameter: 0.912 },
    '20 AWG': { diameter: 0.812 },
    '21 AWG': { diameter: 0.723 },
    '22 AWG': { diameter: 0.644 },
    '23 AWG': { diameter: 0.573 },
    '24 AWG': { diameter: 0.511 },
    '25 AWG': { diameter: 0.455 },
    '26 AWG': { diameter: 0.405 },
    '27 AWG': { diameter: 0.361 },
    '28 AWG': { diameter: 0.321 },
    '29 AWG': { diameter: 0.286 },
    '30 AWG': { diameter: 0.255 },
    '31 AWG': { diameter: 0.227 },
    '32 AWG': { diameter: 0.202 },
    '33 AWG': { diameter: 0.18 },
    '34 AWG': { diameter: 0.16 },
    '35 AWG': { diameter: 0.143 },
    '36 AWG': { diameter: 0.127 },
    '37 AWG': { diameter: 0.113 },
    '38 AWG': { diameter: 0.101 },
    '39 AWG': { diameter: 0.0897 },
    '40 AWG': { diameter: 0.0799 }
  }
};

for (const key in data.data) {
  data.data[key].area = Math.PI * (data.data[key].diameter / 2) ** 2;
}

export default data;
