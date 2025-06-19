// Utility function to reset localStorage data
export const resetLocalStorageData = () => {
  // Remove old data
  localStorage.removeItem('apartmentData');
  localStorage.removeItem('currentUser');
  
  // Reload page to use new initial data
  window.location.reload();
};

// You can call this function from browser console:
// resetLocalStorageData() 