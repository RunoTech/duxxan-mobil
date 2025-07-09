import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { db } from '../db';
import { upcomingRaffles, users, categories } from '../../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { insertUpcomingRaffleSchema } from '../../shared/schema';

export class UpcomingRaffleController extends BaseController {
  // Get all upcoming raffles
  async getUpcomingRaffles(req: Request, res: Response) {
    try {
      const raffles = await db
        .select({
          id: upcomingRaffles.id,
          title: upcomingRaffles.title,
          description: upcomingRaffles.description,
          prizeValue: upcomingRaffles.prizeValue,
          ticketPrice: upcomingRaffles.ticketPrice,
          maxTickets: upcomingRaffles.maxTickets,
          startDate: upcomingRaffles.startDate,
          categoryId: upcomingRaffles.categoryId,
          creatorId: upcomingRaffles.creatorId,
          isActive: upcomingRaffles.isActive,
          createdAt: upcomingRaffles.createdAt,
          creator: {
            id: users.id,
            username: users.username,
            walletAddress: users.walletAddress,
            name: users.name
          },
          category: {
            id: categories.id,
            name: categories.name
          }
        })
        .from(upcomingRaffles)
        .leftJoin(users, eq(upcomingRaffles.creatorId, users.id))
        .leftJoin(categories, eq(upcomingRaffles.categoryId, categories.id))
        .where(eq(upcomingRaffles.isActive, true))
        .orderBy(desc(upcomingRaffles.createdAt));

      return this.success(res, raffles);
    } catch (error) {
      console.error('Error fetching upcoming raffles:', error);
      return this.error(res, 'Failed to fetch upcoming raffles', 500);
    }
  }

  // Create new upcoming raffle
  async createUpcomingRaffle(req: Request, res: Response) {
    try {
      // Get user ID from session/auth
      const userId = req.session?.user?.id;
      if (!userId) {
        return this.error(res, 'Authentication required', 401);
      }

      // Validate request body
      const validationResult = insertUpcomingRaffleSchema.safeParse({
        ...req.body,
        creatorId: userId
      });

      if (!validationResult.success) {
        return this.error(res, 'Invalid input data', 400, validationResult.error.errors);
      }

      const raffleData = validationResult.data;

      // Insert the upcoming raffle
      const [newRaffle] = await db
        .insert(upcomingRaffles)
        .values(raffleData)
        .returning();

      // Fetch the complete raffle with creator and category info
      const [completeRaffle] = await db
        .select({
          id: upcomingRaffles.id,
          title: upcomingRaffles.title,
          description: upcomingRaffles.description,
          prizeValue: upcomingRaffles.prizeValue,
          ticketPrice: upcomingRaffles.ticketPrice,
          maxTickets: upcomingRaffles.maxTickets,
          startDate: upcomingRaffles.startDate,
          categoryId: upcomingRaffles.categoryId,
          creatorId: upcomingRaffles.creatorId,
          isActive: upcomingRaffles.isActive,
          createdAt: upcomingRaffles.createdAt,
          creator: {
            id: users.id,
            username: users.username,
            walletAddress: users.walletAddress,
            name: users.name
          },
          category: {
            id: categories.id,
            name: categories.name
          }
        })
        .from(upcomingRaffles)
        .leftJoin(users, eq(upcomingRaffles.creatorId, users.id))
        .leftJoin(categories, eq(upcomingRaffles.categoryId, categories.id))
        .where(eq(upcomingRaffles.id, newRaffle.id));

      return this.success(res, completeRaffle, 'Upcoming raffle created successfully', 201);
    } catch (error) {
      console.error('Error creating upcoming raffle:', error);
      return this.error(res, 'Failed to create upcoming raffle', 500);
    }
  }

  // Toggle reminder for upcoming raffle
  async toggleReminder(req: Request, res: Response) {
    try {
      const raffleId = parseInt(req.params.id);
      const { action } = req.body;
      
      if (isNaN(raffleId)) {
        return this.error(res, 'Invalid raffle ID', 400);
      }

      if (!action || !['add', 'remove'].includes(action)) {
        return this.error(res, 'Invalid action. Must be "add" or "remove"', 400);
      }

      // Update interested count based on action
      const increment = action === 'add' ? 1 : -1;
      
      const result = await db
        .update(upcomingRaffles)
        .set({ 
          interestedCount: sql`GREATEST(0, COALESCE(${upcomingRaffles.interestedCount}, 0) + ${increment})`
        })
        .where(eq(upcomingRaffles.id, raffleId))
        .returning({
          id: upcomingRaffles.id,
          interestedCount: upcomingRaffles.interestedCount
        });

      if (result.length === 0) {
        return this.error(res, 'Raffle not found', 404);
      }

      console.log(`Raffle ${raffleId} interested count updated to: ${result[0].interestedCount}`);

      return this.success(res, { 
        success: true, 
        interestedCount: result[0].interestedCount,
        action,
        raffleId 
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
      return this.error(res, 'Failed to toggle reminder', 500);
    }
  }

  // Delete upcoming raffle
  async deleteUpcomingRaffle(req: Request, res: Response) {
    try {
      const raffleId = parseInt(req.params.id);
      const userId = req.session?.user?.id;

      if (!userId) {
        return this.error(res, 'Authentication required', 401);
      }

      // Check if the raffle exists and belongs to the user
      const [raffle] = await db
        .select()
        .from(upcomingRaffles)
        .where(eq(upcomingRaffles.id, raffleId));

      if (!raffle) {
        return this.error(res, 'Upcoming raffle not found', 404);
      }

      if (raffle.creatorId !== userId) {
        return this.error(res, 'Unauthorized to delete this raffle', 403);
      }

      // Soft delete by setting isActive to false
      await db
        .update(upcomingRaffles)
        .set({ isActive: false })
        .where(eq(upcomingRaffles.id, raffleId));

      return this.success(res, null, 'Upcoming raffle deleted successfully');
    } catch (error) {
      console.error('Error deleting upcoming raffle:', error);
      return this.error(res, 'Failed to delete upcoming raffle', 500);
    }
  }
}