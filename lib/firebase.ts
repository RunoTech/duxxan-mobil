import admin from 'firebase-admin';

class FirebaseService {
  private app?: admin.app.App;
  private db?: admin.firestore.Firestore;
  private auth?: admin.auth.Auth;
  private messaging?: admin.messaging.Messaging;
  private initialized: boolean = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      try {
        // Check if required environment variables exist
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
          console.log('Firebase credentials not provided, skipping Firebase initialization');
          return;
        }

        // Clean and format the private key
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Remove quotes if present
        privateKey = privateKey.replace(/^["']|["']$/g, '');
        
        // Always convert escaped newlines to actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Clean up whitespace and normalize line endings
        privateKey = privateKey.trim();
        
        // Ensure proper PEM format
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('Private key must start with -----BEGIN PRIVATE KEY-----');
        }
        
        if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
          throw new Error('Private key must end with -----END PRIVATE KEY-----');
        }

        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'dummy-key-id',
          private_key: privateKey,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID || '0',
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL || '')}`
        };

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        this.db = admin.firestore();
        this.auth = admin.auth();
        this.messaging = admin.messaging();
        this.initialized = true;

        console.log('Firebase Admin initialized successfully');
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        console.log('Continuing without Firebase...');
        this.initialized = false;
        return;
      }
    } else {
      this.app = admin.apps[0] as admin.app.App;
      this.db = admin.firestore();
      this.auth = admin.auth();
      this.messaging = admin.messaging();
      this.initialized = true;
    }
  }

  private checkInitialized(): boolean {
    if (!this.initialized) {
      console.warn('Firebase not initialized, skipping operation');
      return false;
    }
    return true;
  }

  // Authentication methods
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.checkInitialized() || !this.auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      return await this.auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new Error('Invalid Firebase token');
    }
  }

  async createUser(userData: {
    email?: string;
    phoneNumber?: string;
    displayName?: string;
    uid?: string;
  }): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.createUser(userData);
    } catch (error) {
      console.error('Firebase user creation failed:', error);
      throw error;
    }
  }

  async updateUser(uid: string, userData: {
    email?: string;
    displayName?: string;
    disabled?: boolean;
  }): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.updateUser(uid, userData);
    } catch (error) {
      console.error('Firebase user update failed:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.auth.deleteUser(uid);
    } catch (error) {
      console.error('Firebase user deletion failed:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error) {
      console.error('Firebase get user by email failed:', error);
      throw error;
    }
  }

  // Notification methods
  async sendNotification(token: string, notification: {
    title: string;
    body: string;
    imageUrl?: string;
  }, data?: Record<string, string>): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data,
        android: {
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            color: '#FFC929',
            icon: 'ic_notification',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  async sendMulticastNotification(tokens: string[], notification: {
    title: string;
    body: string;
    imageUrl?: string;
  }, data?: Record<string, string>): Promise<admin.messaging.BatchResponse> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data,
        android: {
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            color: '#FFC929',
            icon: 'ic_notification',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            }
          }
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log(`Multicast notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
      return response;
    } catch (error) {
      console.error('Failed to send multicast notification:', error);
      throw error;
    }
  }

  async sendTopicNotification(topic: string, notification: {
    title: string;
    body: string;
    imageUrl?: string;
  }, data?: Record<string, string>): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data,
        android: {
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            color: '#FFC929',
            icon: 'ic_notification',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Topic notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send topic notification:', error);
      throw error;
    }
  }

  // Firestore methods
  async saveDocument(collection: string, docId: string, data: any): Promise<void> {
    try {
      if (!this.checkInitialized()) {
        console.log('Firebase not initialized, skipping document save');
        return;
      }
      await this.db!.collection(collection).doc(docId).set(data, { merge: true });
    } catch (error) {
      console.error('Firestore save document failed:', error);
      // Don't throw error to avoid breaking the flow when Firebase is not configured
    }
  }

  async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    try {
      const doc = await this.db.collection(collection).doc(docId).get();
      return doc.exists ? (doc.data() as T) : null;
    } catch (error) {
      console.error('Firestore get document failed:', error);
      throw error;
    }
  }

  async updateDocument(collection: string, docId: string, data: any): Promise<void> {
    try {
      await this.db.collection(collection).doc(docId).update(data);
    } catch (error) {
      console.error('Firestore update document failed:', error);
      throw error;
    }
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    try {
      await this.db.collection(collection).doc(docId).delete();
    } catch (error) {
      console.error('Firestore delete document failed:', error);
      throw error;
    }
  }

  async queryDocuments<T>(
    collection: string, 
    field: string, 
    operator: FirebaseFirestore.WhereFilterOp, 
    value: any,
    limit?: number
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = this.db.collection(collection).where(field, operator, value);
      
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error('Firestore query documents failed:', error);
      throw error;
    }
  }

  async addDocument(collection: string, data: any): Promise<string> {
    try {
      const docRef = await this.db.collection(collection).add(data);
      return docRef.id;
    } catch (error) {
      console.error('Firestore add document failed:', error);
      throw error;
    }
  }

  // Real-time listeners
  listenToDocument(
    collection: string, 
    docId: string, 
    callback: (data: any) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const unsubscribe = this.db.collection(collection).doc(docId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Firestore document listener error:', error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe;
  }

  listenToCollection<T>(
    collection: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void,
    field?: string,
    operator?: FirebaseFirestore.WhereFilterOp,
    value?: any
  ): () => void {
    let query: FirebaseFirestore.Query = this.db.collection(collection);
    
    if (field && operator && value !== undefined) {
      query = query.where(field, operator, value);
    }

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as T));
        callback(documents);
      },
      (error) => {
        console.error('Firestore collection listener error:', error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe;
  }

  // DUXXAN-specific methods
  async saveRaffleEvent(raffleId: number, eventType: string, data: any): Promise<void> {
    const eventData = {
      raffleId,
      eventType,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    await this.saveDocument('raffle_events', `${raffleId}_${Date.now()}`, eventData);
  }

  async saveDonationEvent(donationId: number, eventType: string, data: any): Promise<void> {
    const eventData = {
      donationId,
      eventType,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    await this.saveDocument('donation_events', `${donationId}_${Date.now()}`, eventData);
  }

  async saveUserActivity(userId: number, activity: string, metadata: any): Promise<void> {
    try {
      if (!this.checkInitialized()) {
        return;
      }
      const activityData = {
        userId,
        activity,
        metadata,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      await this.saveDocument('user_activities', `${userId}_${Date.now()}`, activityData);
    } catch (error) {
      console.error('Failed to save user activity:', error);
    }
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [raffleEvents, donationEvents, userActivities] = await Promise.all([
        this.queryDocuments('raffle_events', 'timestamp', '>=', startDate),
        this.queryDocuments('donation_events', 'timestamp', '>=', endDate),
        this.queryDocuments('user_activities', 'timestamp', '>=', startDate)
      ]);

      return {
        raffleEvents: raffleEvents.length,
        donationEvents: donationEvents.length,
        userActivities: userActivities.length,
        totalEvents: raffleEvents.length + donationEvents.length + userActivities.length
      };
    } catch (error) {
      console.error('Firebase analytics query failed:', error);
      throw error;
    }
  }

  // Push notification helpers for DUXXAN
  async notifyRaffleWinner(winnerId: number, raffleTitle: string, deviceTokens: string[]): Promise<void> {
    if (deviceTokens.length === 0) return;

    await this.sendMulticastNotification(
      deviceTokens,
      {
        title: '🎉 Tebrikler!',
        body: `"${raffleTitle}" çekilişini kazandınız!`,
        imageUrl: 'https://duxxan.com/images/winner-notification.png'
      },
      {
        type: 'raffle_winner',
        raffleTitle,
        winnerId: winnerId.toString()
      }
    );
  }

  async notifyDonationUpdate(donationTitle: string, currentAmount: string, deviceTokens: string[]): Promise<void> {
    if (deviceTokens.length === 0) return;

    await this.sendMulticastNotification(
      deviceTokens,
      {
        title: '💝 Bağış Güncellemesi',
        body: `"${donationTitle}" kampanyasına yeni bağış! Toplanan: ${currentAmount} USDT`,
        imageUrl: 'https://duxxan.com/images/donation-update.png'
      },
      {
        type: 'donation_update',
        donationTitle,
        currentAmount
      }
    );
  }

  async notifyRaffleEnd(raffleTitle: string, deviceTokens: string[]): Promise<void> {
    if (deviceTokens.length === 0) return;

    await this.sendTopicNotification(
      'raffle_updates',
      {
        title: '⏰ Çekiliş Sona Erdi',
        body: `"${raffleTitle}" çekilişi tamamlandı. Kazananı öğrenmek için uygulamayı kontrol edin!`,
        imageUrl: 'https://duxxan.com/images/raffle-end.png'
      },
      {
        type: 'raffle_end',
        raffleTitle
      }
    );
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.checkInitialized() || !this.db || !this.auth) {
      return false;
    }
    
    try {
      // Test Firestore connection
      await this.db.collection('health_check').doc('test').set({ 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
      
      // Test Auth connection
      await this.auth.listUsers(1);
      
      return true;
    } catch (error) {
      console.error('Firebase health check failed:', error);
      return false;
    }
  }
}

export const firebase = new FirebaseService();
export default firebase;