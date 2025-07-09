export function debugFirebaseKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  console.log('=== Firebase Private Key Debug ===');
  console.log('Key exists:', !!privateKey);
  console.log('Key length:', privateKey?.length || 0);
  console.log('Starts with BEGIN:', privateKey?.startsWith('-----BEGIN PRIVATE KEY-----') || false);
  console.log('Ends with END:', privateKey?.endsWith('-----END PRIVATE KEY-----') || false);
  console.log('Contains newlines:', privateKey?.includes('\n') || false);
  console.log('Contains \\n escaped:', privateKey?.includes('\\n') || false);
  
  if (privateKey) {
    // Show first and last 50 characters for debugging
    console.log('First 50 chars:', privateKey.substring(0, 50));
    console.log('Last 50 chars:', privateKey.substring(privateKey.length - 50));
  }
  
  console.log('Project ID:', process.env.FIREBASE_PROJECT_ID || 'MISSING');
  console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL || 'MISSING');
  console.log('=== End Debug Info ===');
}