import React from 'react';

// Error Boundary for API-related components
class APIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('[APIErrorBoundary] Caught error:', error);
    console.error('[APIErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Track error in metrics if available
    try {
      const usage = JSON.parse(localStorage.getItem('apiUsage') || '{}');
      const today = new Date().toDateString();
      
      if (!usage[today]) {
        usage[today] = { vietqr: 0, mockapi: 0, demo: 0, error: 0, requests: 0 };
      }
      
      usage[today].error++;
      localStorage.setItem('apiUsage', JSON.stringify(usage));
    } catch (e) {
      console.warn('Failed to track error in metrics:', e);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Lỗi tính năng ngân hàng
              </h3>
              <p className="text-red-700">
                Có lỗi xảy ra với tính năng API ngân hàng, nhưng hệ thống vẫn hoạt động bình thường.
              </p>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded p-4 mb-4">
            <h4 className="font-medium text-red-900 mb-2">Tình trạng hệ thống:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>✅ Tạo VietQR: Vẫn hoạt động (dùng dữ liệu demo)</li>
              <li>✅ Validation: Hoạt động bình thường</li>
              <li>✅ Lưu cài đặt: Hoạt động bình thường</li>
              <li>⚠️ Lấy tên từ API: Tạm thời gặp lỗi</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={this.handleRetry}
              className="btn btn-primary text-sm"
              disabled={this.state.retryCount >= 3}
            >
              {this.state.retryCount >= 3 ? '❌ Quá số lần thử' : '🔄 Thử lại'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary text-sm"
            >
              🔄 Tải lại trang
            </button>
            
            <span className="text-xs text-red-600">
              Lần thử: {this.state.retryCount}/3
            </span>
          </div>

          {isDevelopment && this.state.error && (
            <details className="mt-4 bg-red-100 rounded p-3">
              <summary className="cursor-pointer font-medium text-red-900 mb-2">
                🔧 Chi tiết lỗi (Development)
              </summary>
              <div className="text-xs font-mono text-red-800 whitespace-pre-wrap">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong> {this.state.error.stack}
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC để wrap components với error boundary
export const withAPIErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <APIErrorBoundary>
        <Component {...props} />
      </APIErrorBoundary>
    );
  };
};

export default APIErrorBoundary; 