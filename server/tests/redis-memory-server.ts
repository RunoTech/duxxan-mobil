import { createServer } from 'net';
import { EventEmitter } from 'events';

class RedisMemoryServer extends EventEmitter {
  private server: any;
  private port: number;
  private data: Map<string, any> = new Map();
  private hashes: Map<string, Map<string, string>> = new Map();

  constructor(port: number = 6380) {
    super();
    this.port = port;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        console.log('Redis client connected');
        
        socket.on('data', (data) => {
          const command = data.toString().trim();
          const response = this.processCommand(command);
          socket.write(response);
        });

        socket.on('end', () => {
          console.log('Redis client disconnected');
        });
      });

      this.server.listen(this.port, () => {
        console.log(`Redis memory server running on port ${this.port}`);
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  private processCommand(command: string): string {
    const parts = command.split(' ');
    const cmd = parts[0].toUpperCase();

    switch (cmd) {
      case 'PING':
        return '+PONG\r\n';
      
      case 'HSET':
        if (parts.length >= 4) {
          const key = parts[1];
          const field = parts[2];
          const value = parts.slice(3).join(' ');
          
          if (!this.hashes.has(key)) {
            this.hashes.set(key, new Map());
          }
          
          const hash = this.hashes.get(key)!;
          const isNew = !hash.has(field);
          hash.set(field, value);
          
          console.log(`HSET ${key} ${field} "${value}"`);
          return `:${isNew ? 1 : 0}\r\n`;
        }
        return '-ERR wrong number of arguments\r\n';

      case 'HGET':
        if (parts.length === 3) {
          const key = parts[1];
          const field = parts[2];
          const hash = this.hashes.get(key);
          const value = hash?.get(field);
          
          if (value !== undefined) {
            console.log(`HGET ${key} ${field} => "${value}"`);
            return `$${value.length}\r\n${value}\r\n`;
          }
          return '$-1\r\n';
        }
        return '-ERR wrong number of arguments\r\n';

      case 'HGETALL':
        if (parts.length === 2) {
          const key = parts[1];
          const hash = this.hashes.get(key);
          
          if (hash) {
            const fields: string[] = [];
            hash.forEach((value, field) => {
              fields.push(`$${field.length}\r\n${field}\r\n`);
              fields.push(`$${value.length}\r\n${value}\r\n`);
            });
            console.log(`HGETALL ${key} => ${hash.size} fields`);
            return `*${hash.size * 2}\r\n${fields.join('')}`;
          }
          return '*0\r\n';
        }
        return '-ERR wrong number of arguments\r\n';

      case 'HDEL':
        if (parts.length === 3) {
          const key = parts[1];
          const field = parts[2];
          const hash = this.hashes.get(key);
          
          if (hash && hash.has(field)) {
            hash.delete(field);
            console.log(`HDEL ${key} ${field} => 1`);
            return ':1\r\n';
          }
          return ':0\r\n';
        }
        return '-ERR wrong number of arguments\r\n';

      case 'EXISTS':
        if (parts.length === 2) {
          const key = parts[1];
          const exists = this.hashes.has(key);
          console.log(`EXISTS ${key} => ${exists}`);
          return `:${exists ? 1 : 0}\r\n`;
        }
        return '-ERR wrong number of arguments\r\n';

      default:
        return `-ERR unknown command '${cmd}'\r\n`;
    }
  }

  getStats() {
    return {
      totalHashes: this.hashes.size,
      totalFields: Array.from(this.hashes.values()).reduce((sum, hash) => sum + hash.size, 0)
    };
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Redis memory server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start the server
const redisServer = new RedisMemoryServer(6380);

async function startTestServer() {
  try {
    await redisServer.start();
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('Shutting down Redis memory server...');
      await redisServer.stop();
      process.exit(0);
    });
    
    console.log('Redis memory server ready for testing');
    console.log('Connect using: redis://localhost:6380');
    
  } catch (error) {
    console.error('Failed to start Redis memory server:', error);
    process.exit(1);
  }
}

startTestServer();