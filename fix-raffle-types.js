const fs = require('fs');

// Read the RaffleDetail.tsx file
const filePath = './client/src/pages/RaffleDetail.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all raffle. references with safeRaffle.
const replacements = [
  { from: /raffle\.ticketsSold/g, to: 'safeRaffle.ticketsSold' },
  { from: /raffle\.maxTickets/g, to: 'safeRaffle.maxTickets' },
  { from: /raffle\.prizeValue/g, to: 'safeRaffle.prizeValue' },
  { from: /raffle\.description/g, to: 'safeRaffle.description' },
  { from: /raffle\.ticketPrice/g, to: 'safeRaffle.ticketPrice' },
  { from: /raffle\.endDate/g, to: 'safeRaffle.endDate' },
  { from: /raffle\.creator/g, to: 'safeRaffle.creator' },
  { from: /raffle\.winnerId/g, to: 'safeRaffle.winnerId' },
  { from: /raffle\.creatorId/g, to: 'safeRaffle.creatorId' },
  { from: /raffle\.id/g, to: 'safeRaffle.id' },
  { from: /raffle\.title/g, to: 'safeRaffle.title' },
  { from: /raffle\.winner/g, to: 'safeRaffle.winner' }
];

replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Write the file back
fs.writeFileSync(filePath, content);
console.log('Fixed TypeScript errors in RaffleDetail.tsx');