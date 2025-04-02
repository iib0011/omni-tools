export default {
  title: 'Material Electrical Properties',
  columns: [
    {
      resistivity_20c: {
        title: 'Resistivity at 20°C',
        type: 'number',
        unit: 'Ω/m'
      }
    }
  ],
  data: {
    copper: {
      resistivity: 1.68e-8
    },
    aluminum: {
      resistivity: 2.82e-8
    }
  }
};
