// CSRF protection utility
// Generates and validates CSRF tokens for state-changing operations

class CSRFProtection {
  private static token: string | null = null;
  private static readonly STORAGE_KEY = 'csrf_token';
  
  // Generate a new CSRF token
  static generateToken(): string {
    const token = crypto.randomUUID();
    this.token = token;
    sessionStorage.setItem(this.STORAGE_KEY, token);
    return token;
  }
  
  // Get current CSRF token (generate if none exists)
  static getToken(): string {
    if (!this.token) {
      this.token = sessionStorage.getItem(this.STORAGE_KEY) || this.generateToken();
    }
    return this.token;
  }
  
  // Validate CSRF token
  static validateToken(providedToken: string): boolean {
    const currentToken = this.getToken();
    return providedToken === currentToken && currentToken.length > 0;
  }
  
  // Clear token (e.g., on logout)
  static clearToken(): void {
    this.token = null;
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Add CSRF token to request headers
  static getHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getToken(),
    };
  }
}

export default CSRFProtection;