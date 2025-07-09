import { Router } from 'express';
import { body, param } from 'express-validator';
import { storage } from '../storage';
import { insertChannelSchema, insertUpcomingRaffleSchema } from '@shared/schema';
import { validationMiddleware } from '../middleware/security';

const router = Router();

// Get all channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await storage.getChannels();
    res.json({
      success: true,
      message: 'Channels retrieved successfully',
      data: channels
    });
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      message: 'Kanallar alınırken bir hata oluştu',
      error: error.message
    });
  }
});

// Create a new channel
router.post('/channels', [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Kanal adı 3-50 karakter arası olmalıdır'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Açıklama 10-500 karakter arası olmalıdır'),
  body('category').isIn(['general', 'crypto', 'gaming', 'community', 'news', 'trading']).withMessage('Geçersiz kategori'),
  validationMiddleware
], async (req, res) => {
  try {
    const validatedData = insertChannelSchema.parse(req.body);
    const userId = 1; // This should come from authenticated user
    
    const channel = await storage.createChannel({
      ...validatedData,
      creatorId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Kanal başarıyla oluşturuldu',
      data: channel
    });
  } catch (error: any) {
    console.error('Error creating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Kanal oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

// Get individual channel details
router.get('/channels/:id', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    
    const channel = await storage.getChannelById(channelId);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Kanal bulunamadı'
      });
    }

    // Get creator information
    let creator = null;
    if (channel.creatorId) {
      creator = await storage.getUser(channel.creatorId);
    }

    // Get subscriber count
    const subscriberCount = await storage.getChannelSubscriptionCount(channelId);

    // Get upcoming raffles for this channel
    const upcomingRaffles = await storage.getUpcomingRafflesByChannel(channelId);
    const totalPrizes = upcomingRaffles.reduce((sum, raffle) => {
      return sum + parseFloat(raffle.prizeValue || '0');
    }, 0);

    const channelWithDetails = {
      ...channel,
      creator: creator?.username || 'Anonymous',
      subscriberCount,
      totalPrizes,
      upcomingRaffles: upcomingRaffles.length
    };

    res.json({
      success: true,
      data: channelWithDetails
    });
  } catch (error: any) {
    console.error('Error fetching channel details:', error);
    res.status(500).json({
      success: false,
      message: 'Kanal detayları alınırken hata oluştu',
      error: error.message
    });
  }
});

// Get raffles for a specific channel
router.get('/channels/:id/raffles', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    
    const raffles = await storage.getUpcomingRafflesByChannel(channelId);

    res.json({
      success: true,
      data: raffles
    });
  } catch (error: any) {
    console.error('Error fetching channel raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Kanal çekilişleri alınırken hata oluştu',
      error: error.message
    });
  }
});

// Update a channel (only creator can edit)
router.put('/channels/:id', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  body('name').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Kanal adı 3-50 karakter arası olmalıdır'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Açıklama 10-500 karakter arası olmalıdır'),
  body('categoryId').optional().isInt().withMessage('Geçersiz kategori ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    // Check if the user is the channel creator
    const isCreator = await storage.isChannelCreator(channelId, userId);
    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Bu kanalı düzenleme yetkiniz yok. Sadece kanal yaratıcısı düzenleyebilir.',
        error: 'PERMISSION_DENIED'
      });
    }

    // Validate the update data
    const updateData = insertChannelSchema.partial().parse(req.body);
    
    const updatedChannel = await storage.updateChannel(channelId, updateData);
    
    if (!updatedChannel) {
      return res.status(404).json({
        success: false,
        message: 'Kanal bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Kanal başarıyla güncellendi',
      data: updatedChannel
    });
  } catch (error: any) {
    console.error('Error updating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Kanal güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Subscribe to a channel
router.post('/channels/:id/subscribe', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    await storage.subscribeToChannel(userId, channelId);
    
    res.json({
      success: true,
      message: 'Kanala başarıyla abone oldunuz'
    });
  } catch (error: any) {
    console.error('Error subscribing to channel:', error);
    res.status(500).json({
      success: false,
      message: 'Abonelik sırasında hata oluştu',
      error: error.message
    });
  }
});

// Unsubscribe from a channel
router.delete('/channels/:id/subscribe', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    await storage.unsubscribeFromChannel(userId, channelId);
    
    res.json({
      success: true,
      message: 'Kanal aboneliği başarıyla iptal edildi'
    });
  } catch (error: any) {
    console.error('Error unsubscribing from channel:', error);
    res.status(500).json({
      success: false,
      message: 'Abonelik iptali sırasında hata oluştu',
      error: error.message
    });
  }
});

// Get all upcoming raffles
router.get('/upcoming-raffles', async (req, res) => {
  try {
    const upcomingRaffles = await storage.getUpcomingRaffles();
    res.json({
      success: true,
      message: 'Upcoming raffles retrieved successfully',
      data: upcomingRaffles
    });
  } catch (error: any) {
    console.error('Error fetching upcoming raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Gelecek çekilişler alınırken bir hata oluştu',
      error: error.message
    });
  }
});

// Create a new upcoming raffle announcement
router.post('/upcoming-raffles', [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Başlık 5-100 karakter arası olmalıdır'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Açıklama 20-1000 karakter arası olmalıdır'),
  body('prizeValue').isNumeric().withMessage('Ödül değeri sayısal olmalıdır'),
  body('expectedDate').isISO8601().withMessage('Geçersiz tarih formatı'),
  validationMiddleware
], async (req, res) => {
  try {
    const validatedData = insertUpcomingRaffleSchema.parse(req.body);
    const userId = 1; // This should come from authenticated user
    
    const upcomingRaffle = await storage.createUpcomingRaffle({
      ...validatedData,
      creatorId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Çekiliş duyurusu başarıyla oluşturuldu',
      data: upcomingRaffle
    });
  } catch (error: any) {
    console.error('Error creating upcoming raffle:', error);
    res.status(500).json({
      success: false,
      message: 'Çekiliş duyurusu oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

// Express interest in an upcoming raffle
router.post('/upcoming-raffles/:id/interest', [
  param('id').isInt().withMessage('Geçersiz çekiliş ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    // For now, just return success - interest tracking can be enhanced later
    res.json({
      success: true,
      message: 'İlginiz başarıyla kaydedildi'
    });
  } catch (error: any) {
    console.error('Error expressing interest:', error);
    res.status(500).json({
      success: false,
      message: 'İlgi bildirme sırasında hata oluştu',
      error: error.message
    });
  }
});

export default router;