export const buildSearchQuery = (search) => {
  if (!search?.trim()) return {};
  
  const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSearch, 'i');
  
  return {
    $or: [
      { name: regex },
      { description: regex }
    ]
  };
};