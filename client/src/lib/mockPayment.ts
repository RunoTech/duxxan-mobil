// Mock payment system for testing without smart contracts
export class MockPaymentService {
  static async simulatePayment(amount: string, type: 'raffle' | 'donation'): Promise<{
    success: boolean;
    transactionId: string;
    message: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock transaction ID
    const transactionId = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate occasional failures for testing
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      transactionId,
      message: success 
        ? `Mock ${type} payment of ${amount} USDT completed successfully`
        : `Mock payment failed - please try again`
    };
  }
  
  static async verifyPayment(transactionId: string): Promise<boolean> {
    // Mock verification - always return true for mock transactions
    return transactionId.startsWith('mock_tx_');
  }
}