import { useEffect } from 'react';

/**
 * Hook để quản lý page title với format "Title - CRM Apartment"
 * @param {string} title - Tiêu đề trang (không bao gồm " - CRM Apartment")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    // Lưu title gốc để restore khi component unmount
    const originalTitle = document.title;
    
    // Set title mới theo format "Title - CRM Apartment"
    if (title) {
      document.title = `${title} - CRM Apartment`;
    } else {
      document.title = 'CRM Apartment';
    }
    
    // Cleanup function để restore title gốc
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};

export default usePageTitle; 