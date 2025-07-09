import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
    trustWallet?: any;
  }
}

export interface WalletConnection {
  address: string;
  provider?: BrowserProvider;
  signer?: JsonRpcSigner;
  chainId: string;
  walletType: 'metamask' | 'trustwallet';
  isConnected: boolean;
}

export class WalletManager {
  private static instance: WalletManager;
  private connection: WalletConnection | null = null;
  private listeners: Set<(connected: boolean, address?: string) => void> = new Set();
  private lastNotificationTime: number = 0;
  private lastNotificationData: string = '';

  private constructor() {}

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  addListener(listener: (connected: boolean, address?: string) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (connected: boolean, address?: string) => void): void {
    this.listeners.delete(listener);
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return !!this.connection;
  }

  // BSC Network Configuration
  private BSC_NETWORK = {
    chainId: '0x38', // 56 in hexadecimal
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  };

  async connectWallet(walletType?: 'metamask' | 'trustwallet'): Promise<WalletConnection> {
    if (walletType === 'trustwallet') {
      return this.connectTrustWallet();
    }
    return this.connectMetaMask();
  }

  private getMetaMaskProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check if we're in a restricted frame context
      try {
        if (window.top !== window.self) {
          console.warn('Wallet connection may be restricted in iframe context');
        }
      } catch (e) {
        console.warn('Frame access restricted, wallet connection may fail');
      }

      // Ensure we don't return Trust Wallet for MetaMask requests
      if (window.ethereum.isMetaMask && !window.ethereum.isTrust) {
        return window.ethereum;
      }
      // Handle multiple wallet providers
      if (window.ethereum.providers) {
        return window.ethereum.providers.find((provider: any) => provider.isMetaMask && !provider.isTrust);
      }
    }
    return null;
  }

  private getTrustWalletProvider() {
    if (typeof window !== 'undefined') {
      // Try multiple ways Trust Wallet might be available
      if (window.ethereum?.isTrust) return window.ethereum;
      if ((window as any).trustwallet?.ethereum) return (window as any).trustwallet.ethereum;
      if ((window as any).TrustWallet) return (window as any).TrustWallet;
      if (window.trustWallet) return window.trustWallet;
      if (window.ethereum?.isTrustWallet) return window.ethereum;
      
      // Check user agent as last resort
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('trust') && window.ethereum) {
        return window.ethereum;
      }
    }
    return null;
  }

  checkAvailableWallets() {
    const hasEthereum = typeof window !== 'undefined' && !!window.ethereum;
    const isMetaMask = hasEthereum && window.ethereum.isMetaMask;
    const providers = hasEthereum && window.ethereum.providers ? window.ethereum.providers.length : 0;
    
    // Trust Wallet detection
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const trustWalletGlobal = typeof window !== 'undefined' && !!window.trustWallet;
    const trustwallet = typeof window !== 'undefined' && !!(window as any).trustwallet;  
    const TrustWallet = typeof window !== 'undefined' && !!(window as any).TrustWallet;
    const trust = typeof window !== 'undefined' && !!(window as any).trust;
    const isTrustUserAgent = userAgent.includes('trust');
    
    const metamaskFound = isMetaMask || (hasEthereum && window.ethereum.providers?.some((p: any) => p.isMetaMask));
    const trustwalletFound = trustWalletGlobal || trustwallet || TrustWallet || trust || isTrustUserAgent ||
                           (hasEthereum && (window.ethereum.isTrust || window.ethereum.isTrustWallet));

    const availableGlobals = [];
    if (typeof window !== 'undefined') {
      const globalKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('trust') || 
        key.toLowerCase().includes('metamask') ||
        key.toLowerCase().includes('wallet')
      );
      availableGlobals.push(...globalKeys);
    }

    console.log('Wallet Detection Debug:', {
      hasEthereum,
      isMetaMask,
      providers,
      userAgent: userAgent.includes('trust'),
      trustWalletGlobal,
      trustwallet,
      TrustWallet,
      trust,
      metamaskFound,
      trustwalletFound,
      availableGlobals
    });

    return {
      metamask: metamaskFound,
      trustwallet: trustwalletFound,
      ethereum: hasEthereum
    };
  }

  async connectMetaMask(): Promise<WalletConnection> {
    console.log('Attempting metamask wallet connection...');
    
    // Check for frame restrictions first
    try {
      if (window.top !== window.self) {
        console.warn('Running in iframe context - MetaMask popup may be blocked');
      }
    } catch (e) {
      console.warn('Frame context check failed, proceeding with caution');
    }
    
    const ethereum = this.getMetaMaskProvider();
    if (!ethereum) {
      // More specific error messages for different scenarios
      if (typeof window === 'undefined') {
        throw new Error('MetaMask can only be used in a browser environment.');
      }
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask extension from metamask.io');
      }
      throw new Error('MetaMask not detected. Please ensure MetaMask is properly installed and enabled.');
    }

    try {
      console.log('Checking for existing MetaMask accounts...');
      
      // First check if accounts are already available
      const existingAccounts = await ethereum.request({
        method: 'eth_accounts',
      }) as string[];
      
      let accounts: string[];
      
      if (existingAccounts && existingAccounts.length > 0) {
        console.log('Using existing MetaMask accounts:', existingAccounts.length, 'accounts found');
        accounts = existingAccounts;
        
        // Even if accounts exist, we should still show the connection popup for user confirmation
        // unless they've already granted permission for this specific dapp
        try {
          console.log('Requesting explicit permission from MetaMask...');
          accounts = await ethereum.request({
            method: 'eth_requestAccounts',
          }) as string[];
          console.log('MetaMask permission granted');
        } catch (permissionError) {
          console.log('Using existing accounts as fallback');
          accounts = existingAccounts;
        }
      } else {
        console.log('No existing accounts found, requesting new connection...');
        // Request account access with timeout
        accounts = await Promise.race([
          ethereum.request({
            method: 'eth_requestAccounts',
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 30000)
          )
        ]) as string[];
        console.log('MetaMask connection approved, accounts received:', accounts.length);
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet and try again.');
      }

      // Create provider and signer
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Check and switch to BSC network
      await this.switchToBSC(ethereum);
      
      // Get chain ID after network switch
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const connection: WalletConnection = {
        address,
        provider,
        signer,
        chainId: chainId.toString(),
        walletType: 'metamask',
        isConnected: true
      };

      this.connection = connection;
      this.setupEventListeners();
      
      // Store connection for persistence
      localStorage.setItem('wallet_connection', JSON.stringify({
        address,
        walletType: 'metamask',
        isConnected: true,
        chainId: chainId.toString()
      }));
      
      // Single notification to reduce memory usage
      this.notifyListeners(true, address);
      console.log('MetaMask connected successfully:', address);
      return connection;
    } catch (error: any) {
      console.error('MetaMask connection failed:', error);
      
      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
      }
      if (error.code === -32002) {
        throw new Error('Connection request pending. Please check your MetaMask extension.');
      }
      if (error.message?.includes('timeout')) {
        throw new Error('Connection timeout. Please try again and ensure MetaMask is responding.');
      }
      
      throw new Error(`MetaMask connection failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  async connectTrustWallet(): Promise<WalletConnection> {
    console.log('Attempting trustwallet wallet connection...');
    
    // Check for frame restrictions first
    try {
      if (window.top !== window.self) {
        throw new Error('Wallet connections are not allowed in iframe context. Please open this page directly in your browser.');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('iframe')) {
        throw e;
      }
      // Frame access check failed, might be in restricted context
      console.warn('Frame context check failed, proceeding with caution');
    }
    
    // Force Trust Wallet provider selection
    let ethereum = null;
    
    // Try Trust Wallet specific providers first
    if (window.ethereum?.isTrust) {
      ethereum = window.ethereum;
      console.log('Using Trust Wallet via isTrust flag');
    } else if ((window as any).trustwallet?.ethereum) {
      ethereum = (window as any).trustwallet.ethereum;
      console.log('Using Trust Wallet via trustwallet.ethereum');
    } else if ((window as any).trustwallet) {
      ethereum = (window as any).trustwallet;
      console.log('Using Trust Wallet via trustwallet global');
    } else if (navigator.userAgent.toLowerCase().includes('trust') && window.ethereum) {
      ethereum = window.ethereum;
      console.log('Using Trust Wallet via user agent detection');
    } else {
      // Don't fallback to MetaMask for Trust Wallet connections
      throw new Error('Trust Wallet not found. Please install Trust Wallet app or use Trust Wallet browser.');
    }
    if (!ethereum) {
      if (typeof window === 'undefined') {
        throw new Error('Trust Wallet can only be used in a browser environment.');
      }
      throw new Error('Trust Wallet not found. Please install Trust Wallet app or use Trust Wallet browser.');
    }

    try {
      // Request account access with timeout
      const accounts = await Promise.race([
        ethereum.request({
          method: 'eth_requestAccounts',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 30000)
        )
      ]) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your Trust Wallet and try again.');
      }

      // Create provider and signer
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Check and switch to BSC network
      await this.switchToBSC(ethereum);
      
      // Get chain ID after network switch
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const connection: WalletConnection = {
        address,
        provider,
        signer,
        chainId: chainId.toString(),
        walletType: 'trustwallet',
        isConnected: true
      };

      this.connection = connection;
      this.setupEventListeners();
      
      // Store connection for persistence
      localStorage.setItem('wallet_connection', JSON.stringify({
        address,
        walletType: 'trustwallet',
        isConnected: true,
        chainId: chainId.toString()
      }));
      
      // Single notification to reduce memory usage
      this.notifyListeners(true, address);
      console.log('Trust Wallet connected successfully:', address);
      return connection;
    } catch (error: any) {
      console.error('Trust Wallet connection failed:', error);
      
      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in Trust Wallet.');
      }
      if (error.code === -32002) {
        throw new Error('Connection request pending. Please check your Trust Wallet app.');
      }
      if (error.message?.includes('timeout')) {
        throw new Error('Connection timeout. Please try again and ensure Trust Wallet is responding.');
      }
      
      throw new Error(`Trust Wallet connection failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  async switchToBSC(ethereum?: any): Promise<void> {
    const provider = ethereum || window.ethereum;
    if (!provider) return;

    try {
      // First check current network
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      
      // If already on BSC, no need to switch
      if (currentChainId === this.BSC_NETWORK.chainId) {
        console.log('Already on BSC network');
        return;
      }
      
      console.log('Switching to BSC network...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.BSC_NETWORK.chainId }],
      });
      console.log('Successfully switched to BSC network');
    } catch (switchError: any) {
      console.error('Network switch error:', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        console.log('BSC network not found, adding...');
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [this.BSC_NETWORK],
          });
          console.log('BSC network added successfully');
        } catch (addError: any) {
          console.error('Failed to add BSC network:', addError);
          throw new Error(`BSC ağı eklenemedi: ${addError.message || 'Bilinmeyen hata'}`);
        }
      } else if (switchError.code === 4001) {
        throw new Error('Ağ değişimi kullanıcı tarafından reddedildi. BSC ağına geçmeniz gerekiyor.');
      } else {
        console.error('Network switch failed:', switchError);
        throw new Error(`BSC ağına geçiş başarısız: ${switchError.message || 'Bilinmeyen hata'}`);
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connection = null;
    this.notifyListeners(false);
  }

  async disconnect(): Promise<void> {
    await this.disconnectWallet();
  }

  getAddress(): string | null {
    return this.connection?.address || null;
  }

  onConnectionChange(callback: (connected: boolean, address?: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(connected: boolean, address?: string): void {
    const now = Date.now();
    const notificationKey = `${connected}-${address || ''}`;
    
    // Throttle notifications: Only allow one notification per second for same data
    if (now - this.lastNotificationTime < 1000 && this.lastNotificationData === notificationKey) {
      return;
    }
    
    this.lastNotificationTime = now;
    this.lastNotificationData = notificationKey;
    
    this.listeners.forEach(listener => listener(connected, address));
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection || !this.connection.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.connection.signer.signMessage(message);
  }

  async getBalance(): Promise<string> {
    if (!this.connection || !this.connection.provider) {
      throw new Error('Wallet not connected');
    }
    const balance = await this.connection.provider.getBalance(this.connection.address);
    return balance.toString();
  }

  async autoConnect(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      
      // First check if we already have a valid connection
      if (this.connection && this.connection.isConnected) {
        return true;
      }
      
      const ethereum = this.getMetaMaskProvider() || this.getTrustWalletProvider();
      if (!ethereum) return false;

      // Check if already connected
      const accounts = await ethereum.request({
        method: 'eth_accounts',
      }) as string[];

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        
        // Only switch network if current connection doesn't exist
        if (!this.connection) {
          await this.switchToBSC(ethereum);
        }
        
        const walletType = ethereum.isMetaMask ? 'metamask' : 'trustwallet';
        this.connection = {
          address,
          walletType,
          isConnected: true,
          chainId: '0x38', // BSC
        };
        
        // Store connection in localStorage for persistence
        localStorage.setItem('wallet_connection', JSON.stringify({
          address: address,
          walletType: walletType,
          isConnected: true,
          chainId: '0x38'
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
      // Clear stored connection on error
      localStorage.removeItem('wallet_connection');
    }
    return false;
  }

  setupEventListeners(): void {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    // Listen for account changes
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else if (accounts[0] !== this.connection?.address) {
        // Only reconnect if address actually changed
        this.connectMetaMask().catch(console.error);
      }
    });

    // Listen for chain changes
    ethereum.on('chainChanged', (chainId: string) => {
      // Reload the page to reset the dapp state
      window.location.reload();
    });

    // Listen for connection
    ethereum.on('connect', (connectInfo: { chainId: string }) => {
      console.log('Wallet connected:', connectInfo);
    });

    // Listen for disconnection
    ethereum.on('disconnect', (error: { code: number; message: string }) => {
      console.log('Wallet disconnected:', error);
      this.disconnectWallet();
    });
  }
}

export const walletManager = WalletManager.getInstance();