export const decimalTransformer = {
  to: (value?: number | null): number | null => {
    if (value === undefined || value === null) {
      return null;
    }
    return Number(value);
  },
  from: (value?: string | null): number => {
    if (value === undefined || value === null) {
      return 0;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  },
};
