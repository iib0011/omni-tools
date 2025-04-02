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
    Copper: {
      resistivity_20c: 1.68e-8
    },
    Aluminum: {
      resistivity_20c: 2.82e-8
    }
  }
};
