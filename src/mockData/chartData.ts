export const CHART_DATA = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    compliance: Math.floor(70 + Math.random() * 20),
    risk: Math.floor(10 + Math.random() * 30),
  };
});
