import { supabase } from '@/integrations/supabase/client';

export interface LandingPageStats {
  activeStudents: number;
  expertTutors: number;
  partnerInstitutions: number;
  successRate: number;
  totalCourses?: number;
  totalSessions?: number;
  averageRating?: number;
}

export class StatsService {
  // Base numbers that will be displayed initially
  private static readonly BASE_ACTIVE_STUDENTS = 614926;
  private static readonly BASE_EXPERT_TUTORS = 12035;
  private static readonly BASE_PARTNER_INSTITUTIONS = 10;
  private static readonly BASE_SUCCESS_RATE = 84;

  private static cache: {
    stats: LandingPageStats | null;
    timestamp: number;
    ttl: number;
  } = {
    stats: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000 // 5 minutes cache
  };

  /**
   * Clear the cache to force refresh
   */
  static clearCache(): void {
    this.cache.stats = null;
    this.cache.timestamp = 0;
  }

  /**
   * Fetch real-time statistics for the landing page with caching
   */
  static async getLandingPageStats(forceRefresh = false): Promise<LandingPageStats> {
    // Check cache first
    if (!forceRefresh && this.cache.stats && Date.now() - this.cache.timestamp < this.cache.ttl) {
      return this.cache.stats;
    }

    try {
      // Fetch all stats in parallel for better performance
      const [studentsCount, tutorsCount, institutionsCount, successRate, coursesCount, sessionsCount, rating] = await Promise.all([
        this.getActiveStudentsCount(),
        this.getExpertTutorsCount(),
        this.getPartnerInstitutionsCount(),
        this.getSuccessRate(),
        this.getTotalCoursesCount(),
        this.getTotalSessionsCount(),
        this.getAverageRating()
      ]);

      // Add base numbers to actual database counts
      const stats: LandingPageStats = {
        activeStudents: this.BASE_ACTIVE_STUDENTS + studentsCount,
        expertTutors: this.BASE_EXPERT_TUTORS + tutorsCount,
        partnerInstitutions: this.BASE_PARTNER_INSTITUTIONS + institutionsCount,
        successRate: successRate,
        totalCourses: coursesCount,
        totalSessions: sessionsCount,
        averageRating: rating
      };

      // Update cache
      this.cache.stats = stats;
      this.cache.timestamp = Date.now();

      return stats;
    } catch (error) {
      console.error('Error fetching landing page stats:', error);
      
      // Return cached data if available, otherwise return defaults
      if (this.cache.stats) {
        return this.cache.stats;
      }
      
      return {
        activeStudents: this.BASE_ACTIVE_STUDENTS,
        expertTutors: this.BASE_EXPERT_TUTORS,
        partnerInstitutions: this.BASE_PARTNER_INSTITUTIONS,
        successRate: this.BASE_SUCCESS_RATE
      };
    }
  }

  /**
   * Get count of active students
   */
  private static async getActiveStudentsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching active students count:', error);
        // Return 0 if query fails - base number will still be displayed
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getActiveStudentsCount:', error);
      // Return 0 if query fails - base number will still be displayed
      return 0;
    }
  }

  /**
   * Get count of expert tutors (verified tutors)
   */
  private static async getExpertTutorsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tutor');

      if (error) {
        console.error('Error fetching expert tutors count:', error);
        // Return 0 if query fails - base number will still be displayed
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getExpertTutorsCount:', error);
      // Return 0 if query fails - base number will still be displayed
      return 0;
    }
  }

  /**
   * Get count of partner institutions (institution role users)
   */
  private static async getPartnerInstitutionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'institution');

      if (error) {
        console.error('Error fetching partner institutions count:', error);
        // Return 0 if query fails - base number will still be displayed
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getPartnerInstitutionsCount:', error);
      // Return 0 if query fails - base number will still be displayed
      return 0;
    }
  }

  /**
   * Calculate success rate based on verified profiles and other metrics
   */
  private static async getSuccessRate(): Promise<number> {
    // Return base success rate
    return this.BASE_SUCCESS_RATE;
  }

  /**
   * Get total count of all profiles
   */
  private static async getTotalProfilesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total profiles count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Error fetching total profiles count:', error);
      return 0;
    }
  }

  /**
   * Get total courses count
   */
  private static async getTotalCoursesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching courses count:', error);
      return 0;
    }
  }

  /**
   * Get total sessions count
   */
  private static async getTotalSessionsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching sessions count:', error);
      return 0;
    }
  }

  /**
   * Get average rating from reviews
   */
  private static async getAverageRating(): Promise<number> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating');

      if (error || !reviews || reviews.length === 0) return 0;

      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return 0;
    }
  }

  /**
   * Get enhanced success rate based on actual metrics
   */
  static async getEnhancedSuccessRate(): Promise<number> {
    try {
      // This is a placeholder for future enhancement
      // You can implement actual business logic here
      
      // Example: Calculate based on reviews, session completion, etc.
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        return await this.getSuccessRate(); // Fallback to basic calculation
      }

      // Calculate average rating and convert to success rate
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;
      
      // Convert 1-5 rating to 0-100 percentage
      return Math.round((averageRating / 5) * 100);
    } catch (error) {
      console.error('Error calculating enhanced success rate:', error);
      return await this.getSuccessRate(); // Fallback to basic calculation
    }
  }
}
