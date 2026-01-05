export const ADMIN_CATEGORY_TREE = [
  {
    label: 'Kujdesi per fytyren',
    children: [],
  },
  {
    label: 'Kujdesi per trupin & floke',
    children: [
      {
        label: 'Per trupin',
        children: ['Scrub trupi'],
      },
      {
        label: 'Per floke',
        children: ['Skalp i thate', 'Skalp i yndyrshem', 'Skalp sensitive', 'Renia e flokut', 'Aksesore'],
      },
    ],
  },
  {
    label: 'Higjene',
    children: [],
  },
  {
    label: 'Nena & femije',
    children: [
      {
        label: 'Kujdesi per nenen',
        children: ['Shtatezania', 'Pas lindjes', 'Ushqyerja me gji'],
      },
      {
        label: 'Kujdesi per femije',
        children: ['Ushqim per femije', 'Pelena', 'Aksesore'],
      },
    ],
  },
  {
    label: 'Suplemente & vitamina',
    children: [],
  },
  {
    label: 'Monitoruesit e shendetit',
    children: [],
  },
];

export const flattenCategoryTree = (tree = ADMIN_CATEGORY_TREE) => {
  const results = [];
  for (const main of tree) {
    const mainLabel = main.label;
    const children = Array.isArray(main.children) ? main.children : [];

    if (children.length === 0) {
      results.push([mainLabel]);
      continue;
    }

    for (const sub of children) {
      if (typeof sub === 'string') {
        results.push([mainLabel, sub]);
        continue;
      }

      const subLabel = sub.label;
      const options = Array.isArray(sub.children) ? sub.children : [];
      if (options.length === 0) {
        results.push([mainLabel, subLabel]);
        continue;
      }
      for (const opt of options) {
        results.push([mainLabel, subLabel, opt]);
      }
    }
  }
  return results;
};
