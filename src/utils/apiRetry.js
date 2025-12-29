// API retry utility for handling cold starts
const apiCall = async (url, options = {}, retries = 3) => {
  const defaultOptions = {
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`Attempt ${attempt}: Request timeout`);
      } else {
        console.log(`Attempt ${attempt}: ${error.message}`);
      }
      
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Usage example for frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiCall;
} else {
  window.apiCall = apiCall;
}
