import { db } from './db';
import { redis } from '../lib/redis';
import { firebase } from '../lib/firebase';
import { users, raffles, donations, tickets, donationContributions, userRatings, userDevices } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function clearAllDemoData() {
  console.log('Clearing all demo data from database, Redis, and Firebase...');
  
  try {
    // Clear PostgreSQL database
    console.log('Clearing PostgreSQL data...');
    
    // Delete in correct order due to foreign key constraints
    try {
      // Chat table removed
    } catch (e) { console.log('Chat messages cleared or not exist'); }
    
    try {
      await db.delete(userRatings);
    } catch (e) { console.log('User ratings cleared or not exist'); }
    
    try {
      await db.delete(userDevices);
    } catch (e) { console.log('User devices cleared or not exist'); }
    
    await db.delete(donationContributions);
    await db.delete(tickets);
    await db.delete(donations);
    await db.delete(raffles);
    await db.delete(users);
    
    // Reset auto-increment sequences
    await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE raffles_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE donations_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE tickets_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE donation_contributions_id_seq RESTART WITH 1`);
    
    console.log('✅ PostgreSQL data cleared');
    
    // Clear Redis data
    console.log('Clearing Redis data...');
    try {
      // Use the public invalidateCache method to clear all DUXXAN keys
      await redis.invalidateCache('duxxan:*');
      console.log('✅ Redis cleared: all DUXXAN keys deleted');
    } catch (redisError: any) {
      console.warn('Redis clear failed:', redisError.message);
    }
    
    // Clear Firebase collections
    console.log('Clearing Firebase data...');
    try {
      // Clear user activities
      const userActivities = await firebase.db?.collection('duxxan_analytics').get();
      if (userActivities && !userActivities.empty) {
        const batch = firebase.db?.batch();
        userActivities.docs.forEach(doc => {
          batch?.delete(doc.ref);
        });
        await batch?.commit();
      }
      
      // Clear raffle activities
      const raffleActivities = await firebase.db?.collection('raffle_activities').get();
      if (raffleActivities && !raffleActivities.empty) {
        const batch = firebase.db?.batch();
        raffleActivities.docs.forEach(doc => {
          batch?.delete(doc.ref);
        });
        await batch?.commit();
      }
      
      // Clear donation activities
      const donationActivities = await firebase.db?.collection('donation_activities').get();
      if (donationActivities && !donationActivities.empty) {
        const batch = firebase.db?.batch();
        donationActivities.docs.forEach(doc => {
          batch?.delete(doc.ref);
        });
        await batch?.commit();
      }
      
      console.log('✅ Firebase collections cleared');
    } catch (firebaseError) {
      console.warn('Firebase clear failed:', firebaseError.message);
    }
    
    console.log('\n🎉 All demo data successfully cleared!');
    console.log('Platform is now ready for real wallet connections');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to clear demo data:', error);
    return false;
  }
}

clearAllDemoData().then(success => {
  console.log(success ? '\n✅ Demo data cleanup completed' : '\n❌ Demo data cleanup failed');
  process.exit(success ? 0 : 1);
});