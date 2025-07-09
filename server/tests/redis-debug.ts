console.log('=== Redis Configuration Debug ===');
console.log('REDIS_URL exists:', !!process.env.REDIS_URL);
console.log('REDIS_URL value:', process.env.REDIS_URL);
console.log('REDIS_URL length:', process.env.REDIS_URL?.length || 0);

if (process.env.REDIS_URL) {
  try {
    const url = new URL(process.env.REDIS_URL);
    console.log('Parsed URL components:');
    console.log('  Protocol:', url.protocol);
    console.log('  Hostname:', url.hostname);
    console.log('  Port:', url.port);
    console.log('  Username:', url.username);
    console.log('  Password:', url.password ? '[HIDDEN]' : 'none');
  } catch (error) {
    console.log('URL parsing failed:', error);
  }
} else {
  console.log('REDIS_URL is not set');
}

console.log('=== End Debug ===');