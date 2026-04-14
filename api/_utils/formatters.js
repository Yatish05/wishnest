export const serializeUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.role === 'guest' ? '' : user.email,
  role: user.role,
  isGuest: user.role === 'guest',
  createdAt: user.created_at || user.createdAt,
  preferences: {
    theme: user.preferences?.theme || 'light',
    notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
    defaultVisibility: user.preferences?.defaultVisibility || 'public',
  },
});

export const formatItem = (item) => ({
  ...item,
  _id: item.id,
  isPurchased: item.is_purchased,
  purchasedAt: item.purchased_at,
  purchasedBy: item.purchased_by,
  hiddenFromOwner: item.hidden_from_owner,
});

export const formatWishlist = (wishlist, isOwner = false) => {
  if (!wishlist) return null;
  const items = (wishlist.items || []).map(item => {
    const formatted = formatItem(item);
    if (isOwner && formatted.hiddenFromOwner) {
      return { ...formatted, isPurchased: false, status: "Available" };
    }
    return { ...formatted, status: formatted.isPurchased ? "Purchased" : "Available" };
  });

  return {
    ...wishlist,
    _id: wishlist.id,
    userId: wishlist.user_id,
    isPublic: wishlist.is_public,
    sharedWith: wishlist.shared_with,
    items
  };
};
