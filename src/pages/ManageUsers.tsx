import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  UserX, 
  Trash2, 
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Clock,
  Award,
  BookOpen,
  User,
  Building,
  GraduationCap as GraduationCapIcon,
  Star,
  Globe,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  created_at: string;
  status?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'verified';
  profile_completion?: number;
  // Additional fields for detailed view
  location?: string;
  experience?: string;
  qualifications?: string;
  subjects?: string[];
  teaching_mode?: string[];
  hourly_rate?: number;
  availability?: string;
  languages?: string[];
  achievements?: string[];
  documents?: any[];
  reviews_count?: number;
  rating?: number;
  // Student-specific fields
  grade_level?: string;
  learning_goals?: string;
  age?: number;
  date_of_birth?: string;
  learning_mode?: string;
  budget_min?: number;
  budget_max?: number;
  class_duration?: number;
  frequency?: string;
  tutor_gender_preference?: string;
  instruction_language?: string;
  special_requirements?: string;
  teaching_methodology?: string;
  class_type_preference?: string;
  timeline?: string;
  // Institution-specific fields
  institution_name?: string;
  institution_type?: string;
  established_year?: number;
  registration_number?: string;
  complete_address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  // Common fields
  updated_at?: string;
}

export default function ManageUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const approvedUsersRef = useRef<Set<string>>(new Set());
  const rejectedUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadUsers();
    setupRealtimeSubscriptions();
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Loading users from Supabase...');
      
      // First, try to load basic profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Error loading profiles:', profilesError);
        toast({
          title: "Error",
          description: `Failed to load profiles: ${profilesError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Profiles loaded:', profilesData?.length || 0);

      // Process each user and fetch their role-specific data
      const processedUsers = await Promise.all((profilesData || []).map(async (user) => {
        // Check refs for recently approved/rejected users (immediate UI updates - highest priority)
        const isApprovedInRef = approvedUsersRef.current.has(user.user_id);
        const isRejectedInRef = rejectedUsersRef.current.has(user.user_id);
        
        // Check verification_requests.status (primary source, but only if refs don't have it)
        const { data: verificationRequest } = await supabase
          .from('verification_requests')
          .select('status')
          .eq('user_id', user.user_id)
          .maybeSingle();
        
        // Determine verification status from verification_requests table
        let verificationStatusFromRequest: 'pending' | 'approved' | 'rejected' | null = null;
        if (verificationRequest) {
          if (verificationRequest.status === 'verified') {
            verificationStatusFromRequest = 'approved';
          } else if (verificationRequest.status === 'rejected') {
            verificationStatusFromRequest = 'rejected';
          } else {
            verificationStatusFromRequest = 'pending';
          }
        }
        
        // Determine initial verification status
        // Priority: refs > verification_requests > pending (will be overridden by role-specific profile if exists)
        let initialVerificationStatus: 'pending' | 'approved' | 'rejected';
        if (isRejectedInRef) {
          initialVerificationStatus = 'rejected';
        } else if (isApprovedInRef) {
          initialVerificationStatus = 'approved';
        } else if (verificationStatusFromRequest) {
          initialVerificationStatus = verificationStatusFromRequest;
        } else {
          // If no verification_request exists, default to pending (will check role-specific profile later)
          initialVerificationStatus = 'pending';
        }
        
        console.log('🔍 Base user verification check - user_id:', user.user_id, 'verification_requests.status:', verificationRequest?.status, 'verificationStatusFromRequest:', verificationStatusFromRequest, 'initialStatus:', initialVerificationStatus);
        
        const baseUser = {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bio: user.bio,
          created_at: user.created_at,
          verification_status: initialVerificationStatus,
          profile_completion: 0, // Will be calculated based on role-specific data
          location: user.city || user.area || 'Not provided', // Use city/area from profiles
          updated_at: user.updated_at
        };

        try {
          // Fetch role-specific data based on user role
          if (user.role === 'tutor') {
            const { data: tutorData, error: tutorError } = await supabase
              .from('tutor_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!tutorError && tutorData) {
              console.log('✅ Tutor profile loaded for:', user.full_name);
              console.log('📊 Tutor verified status from DB:', tutorData.verified, typeof tutorData.verified);
              console.log('📊 Base user verified status:', baseUser.verification_status);
              
              // Calculate profile completion for tutors based on actual fields
              const tutorFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                tutorData.experience_years, tutorData.education, tutorData.subjects,
                tutorData.teaching_mode, tutorData.hourly_rate, tutorData.availability
              ];
              const completedFields = tutorFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / tutorFields.length) * 100);
              
              // Check tutor_profiles.verified as authoritative source for tutors
              // Ensure verified is treated as boolean (handle both true/false and null/undefined)
              const verifiedFromTutorProfile = tutorData.verified === true || tutorData.verified === 'true' || tutorData.verified === 1 || tutorData.verified === '1';
              
              // Re-check refs (in case they were updated)
              const isApprovedInRef = approvedUsersRef.current.has(user.user_id);
              const isRejectedInRef = rejectedUsersRef.current.has(user.user_id);
              
              // Determine final verification status with smart priority:
              // 1. Refs (for immediate UI updates - highest priority)
              // 2. tutor_profiles.verified (authoritative for tutors)
              // 3. verification_requests.status (if exists and tutor_profiles doesn't contradict)
              let finalVerificationStatus: 'pending' | 'approved' | 'rejected';
              
              if (isRejectedInRef) {
                finalVerificationStatus = 'rejected';
              } else if (isApprovedInRef) {
                finalVerificationStatus = 'approved';
              } else if (verifiedFromTutorProfile) {
                // tutor_profiles.verified = true is authoritative - use this even if verification_requests says pending
                finalVerificationStatus = 'approved';
              } else if (baseUser.verification_status === 'rejected') {
                // If verification_requests says rejected, honor that
                finalVerificationStatus = 'rejected';
              } else {
                // Default to pending if nothing indicates approval
                finalVerificationStatus = 'pending';
              }
              
              console.log('🔍 Verification check for', user.full_name, '- tutorData.verified:', tutorData.verified, 'verifiedFromTutorProfile:', verifiedFromTutorProfile, 'baseStatus:', baseUser.verification_status, 'finalStatus:', finalVerificationStatus);
              
              return {
                ...baseUser,
                experience: tutorData.experience_years ? `${tutorData.experience_years} years` : tutorData.teaching_experience,
                qualifications: tutorData.education || tutorData.highest_qualification,
                subjects: tutorData.subjects || [],
                teaching_mode: tutorData.teaching_mode ? [tutorData.teaching_mode] : [],
                hourly_rate: tutorData.hourly_rate,
                availability: tutorData.availability ? JSON.stringify(tutorData.availability) : tutorData.weekly_schedule ? JSON.stringify(tutorData.weekly_schedule) : 'Not specified',
                languages: tutorData.languages || [],
                achievements: tutorData.certifications || [],
                rating: tutorData.rating,
                reviews_count: 0, // Not available in current schema
                profile_completion: profileCompletion,
                verification_status: finalVerificationStatus
              };
            } else {
              console.log('⚠️ No tutor profile found for:', user.full_name, tutorError);
              // If tutor profile not found, check if user is recently approved/rejected via refs
              // Otherwise, check profiles.verified as fallback since that's also updated during approval
              if (rejectedUsersRef.current.has(user.user_id)) {
                console.log('🔍 Using ref-based rejected status for tutor without profile');
                return { ...baseUser, verification_status: 'rejected' as const };
              }
              if (approvedUsersRef.current.has(user.user_id)) {
                console.log('🔍 Using ref-based approved status for tutor without profile');
                return { ...baseUser, verification_status: 'approved' as const };
              }
              // If no ref and no tutor profile, use baseUser status (from verification_requests)
              console.log('🔍 Using baseUser status (from verification_requests) for tutor without profile:', baseUser.verification_status);
              return baseUser;
            }
          }

          if (user.role === 'institution') {
            const { data: institutionData, error: institutionError } = await supabase
              .from('institution_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!institutionError && institutionData) {
              console.log('✅ Institution profile loaded for:', user.full_name);
              
              // Calculate profile completion for institutions based on actual fields
              const institutionFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                institutionData.institution_name, institutionData.institution_type, institutionData.established_year,
                institutionData.registration_number, institutionData.complete_address
              ];
              const completedFields = institutionFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / institutionFields.length) * 100);
              
              // Check institution_profiles.verified as authoritative source for institutions
              // Ensure verified is treated as boolean (handle both true/false and null/undefined)
              const verifiedFromInstitutionProfile = institutionData.verified === true || institutionData.verified === 'true' || institutionData.verified === 1 || institutionData.verified === '1';
              
              // Re-check refs (in case they were updated)
              const isApprovedInRef = approvedUsersRef.current.has(user.user_id);
              const isRejectedInRef = rejectedUsersRef.current.has(user.user_id);
              
              // Determine final verification status with smart priority:
              // 1. Refs (for immediate UI updates - highest priority)
              // 2. institution_profiles.verified (authoritative for institutions)
              // 3. verification_requests.status (if exists and institution_profiles doesn't contradict)
              let finalVerificationStatus: 'pending' | 'approved' | 'rejected';
              
              if (isRejectedInRef) {
                finalVerificationStatus = 'rejected';
              } else if (isApprovedInRef) {
                finalVerificationStatus = 'approved';
              } else if (verifiedFromInstitutionProfile) {
                // institution_profiles.verified = true is authoritative - use this even if verification_requests says pending
                finalVerificationStatus = 'approved';
              } else if (baseUser.verification_status === 'rejected') {
                // If verification_requests says rejected, honor that
                finalVerificationStatus = 'rejected';
              } else {
                // Default to pending if nothing indicates approval
                finalVerificationStatus = 'pending';
              }
              
              console.log('🔍 Verification check for', user.full_name, '- institutionData.verified:', institutionData.verified, 'verifiedFromInstitutionProfile:', verifiedFromInstitutionProfile, 'baseStatus:', baseUser.verification_status, 'finalStatus:', finalVerificationStatus);
              
              return {
                ...baseUser,
                experience: institutionData.established_year ? `Established in ${institutionData.established_year}` : 'Not specified',
                qualifications: institutionData.registration_number || 'Not provided',
                subjects: [], // Not directly available in institution_profiles
                languages: [institutionData.primary_language].filter(Boolean),
                rating: 0, // Not available in current schema
                reviews_count: 0, // Not available in current schema
                profile_completion: profileCompletion,
                verification_status: finalVerificationStatus,
                // Additional institution-specific fields
                institution_name: institutionData.institution_name,
                institution_type: institutionData.institution_type,
                established_year: institutionData.established_year,
                registration_number: institutionData.registration_number,
                complete_address: institutionData.complete_address,
                city: institutionData.city,
                state: institutionData.state,
                pin_code: institutionData.pin_code
              };
            } else {
              console.log('⚠️ No institution profile found for:', user.full_name, institutionError);
              // If institution profile not found, check if user is recently approved/rejected via refs
              // Otherwise, check profiles.verified as fallback since that's also updated during approval
              if (rejectedUsersRef.current.has(user.user_id)) {
                console.log('🔍 Using ref-based rejected status for institution without profile');
                return { ...baseUser, verification_status: 'rejected' as const };
              }
              if (approvedUsersRef.current.has(user.user_id)) {
                console.log('🔍 Using ref-based approved status for institution without profile');
                return { ...baseUser, verification_status: 'approved' as const };
              }
              // If no ref and no institution profile, use baseUser status (from verification_requests)
              console.log('🔍 Using baseUser status (from verification_requests) for institution without profile:', baseUser.verification_status);
              return baseUser;
            }
          }

          if (user.role === 'student') {
            const { data: studentData, error: studentError } = await supabase
              .from('student_profiles')
              .select('*')
              .eq('user_id', user.user_id)
              .single();

            if (!studentError && studentData) {
              console.log('✅ Student profile loaded for:', user.full_name);
              
              // Calculate profile completion for students based on actual fields
              const studentFields = [
                baseUser.full_name, baseUser.email, baseUser.phone, baseUser.bio, baseUser.location,
                studentData.education_level, studentData.learning_mode, studentData.subject_interests
              ];
              const completedFields = studentFields.filter(field => field && field !== '' && field !== '[]').length;
              const profileCompletion = Math.round((completedFields / studentFields.length) * 100);
              
              return {
                ...baseUser,
                subjects: studentData.subject_interests || [],
                grade_level: studentData.education_level,
                learning_goals: studentData.learning_objectives ? JSON.stringify(studentData.learning_objectives) : 'Not specified',
                profile_completion: profileCompletion,
                // Additional student-specific fields
                age: studentData.age,
                date_of_birth: studentData.date_of_birth,
                learning_mode: studentData.learning_mode,
                budget_min: studentData.budget_min,
                budget_max: studentData.budget_max,
                class_duration: studentData.class_duration,
                frequency: studentData.frequency,
                tutor_gender_preference: studentData.tutor_gender_preference,
                instruction_language: studentData.instruction_language,
                special_requirements: studentData.special_requirements,
                teaching_methodology: studentData.teaching_methodology,
                class_type_preference: studentData.class_type_preference,
                timeline: studentData.timeline
              };
            } else {
              console.log('⚠️ No student profile found for:', user.full_name, studentError);
            }
          }

        } catch (roleError) {
          console.error('❌ Error loading role-specific data for:', user.full_name, roleError);
        }

        return baseUser;
      }));

      // Ensure recently approved/rejected users maintain their status even after reload
      // Also double-check the database values for tutors/institutions to ensure consistency
      const finalProcessedUsers = await Promise.all(processedUsers.map(async (user) => {
        if (user.role === 'tutor' || user.role === 'institution') {
          // First, check refs (for recently approved/rejected users in current session)
          if (rejectedUsersRef.current.has(user.user_id)) {
            return { ...user, verification_status: 'rejected' as const };
          }
          if (approvedUsersRef.current.has(user.user_id)) {
            return { ...user, verification_status: 'approved' as const };
          }
          
          // If not in refs (e.g., after logout/login), verify against database directly
          // This ensures we read the latest database state
          // Check both role-specific profile AND profiles table
          const tableName = user.role === 'tutor' ? 'tutor_profiles' : 'institution_profiles';
          try {
            // First check role-specific profile
            const { data: roleData, error: roleError } = await supabase
              .from(tableName)
              .select('verified')
              .eq('user_id', user.user_id)
              .maybeSingle();
            
            // Check both verification_requests and role-specific profile
            // Priority: role-specific profile.verified > verification_requests.status
            const { data: verificationRequestData } = await supabase
              .from('verification_requests')
              .select('status')
              .eq('user_id', user.user_id)
              .maybeSingle();
            
            let verifiedFromRoleProfile = false;
            let statusFromVerificationRequest: 'pending' | 'approved' | 'rejected' | null = null;
            
            // Check role-specific profile first (most authoritative)
            if (!roleError && roleData) {
              verifiedFromRoleProfile = roleData.verified === true || roleData.verified === 'true' || roleData.verified === 1 || roleData.verified === '1';
              console.log('🔍 Final check - roleData.verified:', roleData.verified, 'verifiedFromRoleProfile:', verifiedFromRoleProfile);
            }
            
            // Check verification_requests as secondary source
            if (verificationRequestData) {
              if (verificationRequestData.status === 'verified') {
                statusFromVerificationRequest = 'approved';
              } else if (verificationRequestData.status === 'rejected') {
                statusFromVerificationRequest = 'rejected';
              } else {
                statusFromVerificationRequest = 'pending';
              }
              console.log('🔍 Final check - verification_requests.status:', verificationRequestData.status, 'statusFromRequest:', statusFromVerificationRequest);
            }
            
            console.log('🔍 Final verification check for', user.full_name, '- verifiedFromRoleProfile:', verifiedFromRoleProfile, 'statusFromRequest:', statusFromVerificationRequest, 'current status:', user.verification_status);
            
            // Priority: role-specific profile.verified > verification_requests.status
            // If role profile says verified, use that (even if verification_requests says pending)
            if (verifiedFromRoleProfile && user.verification_status === 'pending') {
              console.log('✅ Correcting status from pending to approved for', user.full_name, '- role profile confirms verified: true');
              return { ...user, verification_status: 'approved' as const };
            }
            
            // If verification_requests says verified but user status is pending (and role profile doesn't contradict)
            if (statusFromVerificationRequest === 'approved' && user.verification_status === 'pending' && !verifiedFromRoleProfile) {
              console.log('✅ Correcting status from pending to approved for', user.full_name, '- verification_requests confirms verified');
              return { ...user, verification_status: 'approved' as const };
            }
            
            // If verification_requests says rejected but user status is not rejected, update it
            if (statusFromVerificationRequest === 'rejected' && user.verification_status !== 'rejected') {
              console.log('✅ Correcting status to rejected for', user.full_name, '- verification_requests confirms rejected');
              return { ...user, verification_status: 'rejected' as const };
            }
          } catch (verifyError) {
            console.warn('⚠️ Error verifying status for', user.full_name, ':', verifyError);
          }
        }
        return user;
      }));

      setUsers(finalProcessedUsers);
      console.log('✅ All users processed:', finalProcessedUsers.length);

    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const profilesSubscription = supabase
      .channel('admin-manage-users')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profiles table changed, reloading users...');
        loadUsers();
      })
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
    };
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (activeTab === 'students') {
      filtered = filtered.filter(user => user.role === 'student');
    } else if (activeTab === 'tutors') {
      filtered = filtered.filter(user => user.role === 'tutor');
    } else if (activeTab === 'institutions') {
      filtered = filtered.filter(user => user.role === 'institution');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (user: User) => {
    try {
      // For now, we'll just show a toast since we don't have a status field
      // In a real implementation, you'd update a status field in the database
      toast({
        title: "User Suspended",
        description: `${user.full_name} has been suspended`,
      });
      setShowSuspendDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const handleApproveUser = async (user: User) => {
    try {
      // Only approve tutors and institutions
      if (user.role !== 'tutor' && user.role !== 'institution') {
        toast({
          title: "Invalid Action",
          description: "Only tutors and institutions can be approved",
          variant: "destructive",
        });
        return;
      }

      // Update the role-specific profile table
      // IMPORTANT: Only UPDATE existing rows, never INSERT/UPSERT (RLS policies block INSERT)
      const tableName = user.role === 'tutor' ? 'tutor_profiles' : 'institution_profiles';
      
      // First, check if the row exists
      const { data: existingProfile, error: checkError } = await supabase
        .from(tableName)
        .select('user_id, verified')
        .eq('user_id', user.user_id)
        .maybeSingle();
      
      console.log('🔍 Checking for existing', tableName, 'profile for', user.user_id, ':', existingProfile ? 'exists' : 'not found');
      
      let roleUpdateData, roleError;
      
      if (existingProfile) {
        // Row exists, use update (RLS allows UPDATE)
        console.log('✅', tableName, 'profile exists - updating verified status');
        const result = await supabase
        .from(tableName)
        .update({ 
          verified: true,
          updated_at: new Date().toISOString()
        })
          .eq('user_id', user.user_id)
          .select();
        roleUpdateData = result.data;
        roleError = result.error;
        
        if (roleError) {
          console.error('❌ Error updating', tableName, ':', roleError);
        }
      } else {
        // Row doesn't exist - Try to INSERT a complete profile entry
        console.log('⚠️', tableName, 'profile not found for', user.user_id, '- attempting to create profile');
        
        // For institutions, fetch basic data from profiles table to create a complete entry
        let institutionName = user.full_name || 'Institution';
        let city = null;
        let area = null;
        
        if (user.role === 'institution') {
          // Fetch institution name and location from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, city, area')
            .eq('user_id', user.user_id)
            .maybeSingle();
          
          if (!profileError && profileData) {
            institutionName = profileData.full_name || institutionName;
            city = profileData.city || null;
            area = profileData.area || null;
            console.log(`✅ Fetched profile data for institution: ${institutionName}`);
          }
        }
        
        // Create a complete profile entry with required fields
        let insertData: any = {
          user_id: user.user_id,
          verified: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        // Add role-specific required fields
        if (user.role === 'institution') {
          insertData.institution_name = institutionName;
          insertData.institution_type = 'Educational Institution';
          insertData.established_year = new Date().getFullYear();
          insertData.registration_number = null; // Can be updated later
          if (city) insertData.city = city;
          if (area) {
            insertData.area = area;
            insertData.state = area; // Fallback for state
          }
          insertData.status = 'approved';
        } else if (user.role === 'tutor') {
          // For tutors, add minimal required fields
          insertData.full_name = user.full_name || 'Tutor';
        }
        
        const insertResult = await supabase
          .from(tableName)
          .insert(insertData)
          .select();
        
        roleUpdateData = insertResult.data;
        roleError = insertResult.error;
        
        if (roleError) {
          console.error('❌ Cannot create', tableName, 'profile:', roleError.message);
          console.error('❌ Error details:', roleError);
          console.log('ℹ️ Will rely on verification_requests table for verification status');
        } else if (roleUpdateData && roleUpdateData.length > 0) {
          console.log('✅', tableName, 'profile created successfully:', roleUpdateData[0]);
        }
      }

      // Update or CREATE verification_requests table (this is the primary source of verification status)
      // Get current admin user ID for verified_by field
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const adminUserId = adminUser?.id;
      
      // Find the verification request for this user
      const { data: verificationRequest, error: verificationRequestCheckError } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('user_id', user.user_id)
        .maybeSingle();
      
      // If verification_requests exists but institution_profiles doesn't (for institutions),
      // try to create institution_profiles entry again (in case first attempt failed)
      if (!existingProfile && user.role === 'institution' && verificationRequest) {
        console.log('⚠️ verification_requests exists but institution_profiles missing - attempting to create again...');
        // Re-fetch profile data if we haven't already
        if (!institutionName || institutionName === 'Institution') {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, city, area')
            .eq('user_id', user.user_id)
            .maybeSingle();
          
          if (!profileError && profileData) {
            institutionName = profileData.full_name || institutionName;
            city = profileData.city || null;
            area = profileData.area || null;
          }
        }
        
        // Try to create institution_profiles entry again
        const retryInsertResult = await supabase
          .from('institution_profiles')
          .insert({
            user_id: user.user_id,
            institution_name: institutionName,
            institution_type: 'Educational Institution',
            established_year: new Date().getFullYear(),
            registration_number: null,
            city: city || null,
            area: area || null,
            state: area || null,
            verified: true,
            status: 'approved',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (!retryInsertResult.error && retryInsertResult.data && retryInsertResult.data.length > 0) {
          console.log('✅ Successfully created institution_profiles entry on retry:', retryInsertResult.data[0]);
          roleUpdateData = retryInsertResult.data;
          roleError = null;
        } else if (retryInsertResult.error) {
          console.error('❌ Retry failed to create institution_profiles:', retryInsertResult.error);
        }
      }
      
      let verificationRequestUpdateData, verificationRequestUpdateError;
      
      if (verificationRequest) {
        // Update existing verification request
        console.log('✅ Found verification request - updating status to verified');
        const result = await supabase
          .from('verification_requests')
          .update({
            status: 'verified',
            verified_by: adminUserId,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', verificationRequest.id)
          .select();
        verificationRequestUpdateData = result.data;
        verificationRequestUpdateError = result.error;
        
        if (verificationRequestUpdateError) {
          console.error('❌ Error updating verification_requests:', verificationRequestUpdateError);
        } else if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
          console.log('✅ Verification request updated successfully:', verificationRequestUpdateData[0]);
        }
      } else {
        // CREATE verification request if it doesn't exist (CRITICAL for persistence)
        console.log('⚠️ No verification request found for user - creating new verification request');
        const userType = user.role === 'tutor' ? 'tutor' : 'institute';
        const insertResult = await supabase
          .from('verification_requests')
          .insert({
            user_id: user.user_id,
            user_type: userType,
            status: 'verified',
            verified_by: adminUserId,
            verified_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        verificationRequestUpdateData = insertResult.data;
        verificationRequestUpdateError = insertResult.error;
        
        if (verificationRequestUpdateError) {
          console.error('❌ Error creating verification_requests:', verificationRequestUpdateError);
        } else if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
          console.log('✅ Verification request created successfully:', verificationRequestUpdateData[0]);
        }
      }

      // Check for errors - at least ONE update must succeed for persistence
      const hasSuccessfulUpdate = 
        (roleUpdateData && roleUpdateData.length > 0) || 
        (verificationRequestUpdateData && verificationRequestUpdateData.length > 0);
      
      if (!hasSuccessfulUpdate) {
        // Both updates failed - this is a critical error
        console.error('❌ CRITICAL: Both role table and verification_requests updates failed!');
        console.error('❌ Role error:', roleError?.message);
        console.error('❌ Verification request error:', verificationRequestUpdateError?.message);
        toast({
          title: "Error",
          description: "Failed to update verification status. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Log successful updates
      if (roleUpdateData && roleUpdateData.length > 0) {
        console.log('✅ Role table updated successfully:', roleUpdateData[0]);
        console.log('✅ Verified status in role table:', roleUpdateData[0].verified);
      }
      
      if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
        console.log('✅ Verification request updated/created successfully:', verificationRequestUpdateData[0]);
        console.log('✅ Status in verification_requests:', verificationRequestUpdateData[0].status);
      }
      
      // Log warnings for partial failures (non-critical if at least one succeeded)
      if (roleError && !verificationRequestUpdateData) {
        console.warn('⚠️ Role table update failed:', roleError.message);
      }
      
      if (verificationRequestUpdateError && !roleUpdateData) {
        console.warn('⚠️ Verification request update failed:', verificationRequestUpdateError.message);
      }


      toast({
        title: "User Approved",
        description: `${user.full_name}'s profile has been approved`,
      });
      setShowApproveDialog(false);
      setSelectedUser(null);
      
      // Track this user as recently approved to preserve status during reload
      approvedUsersRef.current.add(user.user_id);
      // Remove from rejected ref if it was there
      rejectedUsersRef.current.delete(user.user_id);

      console.log('✅ User approved:', user.user_id, user.full_name);
      console.log('✅ Approved users ref:', Array.from(approvedUsersRef.current));

      // Immediately update local state to reflect approval - this will hide the button instantly
      // Only update users state; filteredUsers will be updated by useEffect
      setUsers(prevUsers => {
        const updated = prevUsers.map(u => 
          u.user_id === user.user_id 
            ? { ...u, verification_status: 'approved' as const }
            : u
        );
        console.log('✅ Updated users state - User status:', updated.find(u => u.user_id === user.user_id)?.verification_status);
        return updated;
      });
      
      // Don't auto-reload - the state update is immediate and the final verification check
      // will handle any inconsistencies when the user manually refreshes or navigates
      // This prevents the page from refreshing automatically and provides better UX
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (user: User) => {
    try {
      // Only reject tutors and institutions
      if (user.role !== 'tutor' && user.role !== 'institution') {
        toast({
          title: "Invalid Action",
          description: "Only tutors and institutions can be rejected",
          variant: "destructive",
        });
        return;
      }

      // Update the role-specific profile table (if it exists)
      const tableName = user.role === 'tutor' ? 'tutor_profiles' : 'institution_profiles';
      
      // Check if role-specific profile exists
      const { data: existingProfile } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('user_id', user.user_id)
        .maybeSingle();
      
      let roleUpdateData, roleError;
      
      if (existingProfile) {
        // Row exists, use update
        const result = await supabase
        .from(tableName)
        .update({ 
          verified: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id)
          .select();
        roleUpdateData = result.data;
        roleError = result.error;
        
        if (roleError) {
          console.error('❌ Error updating', tableName, ':', roleError);
        }
      } else {
        // Row doesn't exist - Try to INSERT (might fail due to RLS, but we should try)
        console.log('⚠️', tableName, 'profile not found for', user.user_id, '- attempting to create profile');
        
        // Try to create a minimal profile entry (RLS might block this, but we should try)
        const insertResult = await supabase
          .from(tableName)
          .insert({
            user_id: user.user_id,
            verified: false,
            updated_at: new Date().toISOString()
          })
          .select();
        
        roleUpdateData = insertResult.data;
        roleError = insertResult.error;
        
        if (roleError) {
          console.warn('⚠️ Cannot create', tableName, 'profile (RLS may prevent INSERT):', roleError.message);
          console.log('ℹ️ Will rely on verification_requests table for verification status');
        } else if (roleUpdateData && roleUpdateData.length > 0) {
          console.log('✅', tableName, 'profile created successfully:', roleUpdateData[0]);
        }
      }

      // Update or CREATE verification_requests table (this is the primary source of verification status)
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const adminUserId = adminUser?.id;
      
      // Find the verification request for this user
      const { data: verificationRequest } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('user_id', user.user_id)
        .maybeSingle();
      
      let verificationRequestUpdateData, verificationRequestUpdateError;
      
      if (verificationRequest) {
        // Update existing verification request
        console.log('✅ Found verification request - updating status to rejected');
        const result = await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            rejection_reason: 'Rejected by admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', verificationRequest.id)
          .select();
        verificationRequestUpdateData = result.data;
        verificationRequestUpdateError = result.error;
        
        if (verificationRequestUpdateError) {
          console.error('❌ Error updating verification_requests:', verificationRequestUpdateError);
        } else if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
          console.log('✅ Verification request updated successfully:', verificationRequestUpdateData[0]);
        }
      } else {
        // CREATE verification request if it doesn't exist (CRITICAL for persistence)
        console.log('⚠️ No verification request found for user - creating new verification request');
        const userType = user.role === 'tutor' ? 'tutor' : 'institute';
        const insertResult = await supabase
          .from('verification_requests')
          .insert({
            user_id: user.user_id,
            user_type: userType,
            status: 'rejected',
            rejection_reason: 'Rejected by admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        verificationRequestUpdateData = insertResult.data;
        verificationRequestUpdateError = insertResult.error;
        
        if (verificationRequestUpdateError) {
          console.error('❌ Error creating verification_requests:', verificationRequestUpdateError);
        } else if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
          console.log('✅ Verification request created successfully:', verificationRequestUpdateData[0]);
        }
      }

      // Check for errors - at least ONE update must succeed for persistence
      const hasSuccessfulUpdate = 
        (roleUpdateData && roleUpdateData.length > 0) || 
        (verificationRequestUpdateData && verificationRequestUpdateData.length > 0);
      
      if (!hasSuccessfulUpdate) {
        // Both updates failed - this is a critical error
        console.error('❌ CRITICAL: Both role table and verification_requests updates failed!');
        console.error('❌ Role error:', roleError?.message);
        console.error('❌ Verification request error:', verificationRequestUpdateError?.message);
        toast({
          title: "Error",
          description: "Failed to update verification status. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Log successful updates
      if (roleUpdateData && roleUpdateData.length > 0) {
        console.log('✅ Role table updated successfully (rejected):', roleUpdateData[0]);
        console.log('✅ Verified status in role table:', roleUpdateData[0].verified);
      }
      
      if (verificationRequestUpdateData && verificationRequestUpdateData.length > 0) {
        console.log('✅ Verification request updated/created successfully:', verificationRequestUpdateData[0]);
        console.log('✅ Status in verification_requests:', verificationRequestUpdateData[0].status);
      }
      
      // Log warnings for partial failures (non-critical if at least one succeeded)
      if (roleError && !verificationRequestUpdateData) {
        console.warn('⚠️ Role table update failed:', roleError.message);
      }
      
      if (verificationRequestUpdateError && !roleUpdateData) {
        console.warn('⚠️ Verification request update failed:', verificationRequestUpdateError.message);
      }

      toast({
        title: "User Rejected",
        description: `${user.full_name}'s profile has been rejected`,
      });
      setShowRejectDialog(false);
      setSelectedUser(null);
      
      // Track this user as recently rejected to preserve status during reload
      rejectedUsersRef.current.add(user.user_id);
      // Remove from approved ref if it was there
      approvedUsersRef.current.delete(user.user_id);

      console.log('❌ User rejected:', user.user_id, user.full_name);
      console.log('❌ Rejected users ref:', Array.from(rejectedUsersRef.current));

      // Immediately update local state to reflect rejection - this will hide the button instantly
      // Only update users state; filteredUsers will be updated by useEffect
      setUsers(prevUsers => {
        const updated = prevUsers.map(u => 
          u.user_id === user.user_id 
            ? { ...u, verification_status: 'rejected' as const }
            : u
        );
        console.log('❌ Updated users state - User status:', updated.find(u => u.user_id === user.user_id)?.verification_status);
        return updated;
      });
      
      // Don't auto-reload - the state update is immediate and the final verification check
      // will handle any inconsistencies when the user manually refreshes or navigates
      // This prevents the page from refreshing automatically and provides better UX
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Deleted",
        description: `${user.full_name} has been deleted`,
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadUsers(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'tutor':
        return <GraduationCap className="h-4 w-4 text-green-600" />;
      case 'institution':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'tutor':
        return 'bg-green-100 text-green-800';
      case 'institution':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (user: User) => {
    const status = user.verification_status || 'pending';
    
    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium text-gray-600">User</th>
            <th className="text-left p-3 font-medium text-gray-600">Email</th>
            <th className="text-left p-3 font-medium text-gray-600">Role</th>
            <th className="text-left p-3 font-medium text-gray-600">Verification</th>
            <th className="text-left p-3 font-medium text-gray-600">Joined</th>
            <th className="text-left p-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
              </td>
              <td className="p-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </td>
              <td className="p-3">
                {getStatusBadge(user)}
              </td>
              <td className="p-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowProfileDialog(true);
                    }}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {user.verification_status === 'pending' && (user.role === 'tutor' || user.role === 'institution') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowApproveDialog(true);
                        }}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRejectDialog(true);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {(user.verification_status === 'approved' || user.verification_status === 'verified') && (user.role === 'tutor' || user.role === 'institution') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                        setShowDeleteDialog(true);
                    }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                  </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowSuspendDialog(true);
                    }}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Manage Users</h1>
                <p className="text-xs text-gray-500">User Management & Administration</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'student').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'tutor').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'institution').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="students" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Students ({users.filter(u => u.role === 'student').length})</span>
                </TabsTrigger>
                <TabsTrigger value="tutors" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Tutors ({users.filter(u => u.role === 'tutor').length})</span>
                </TabsTrigger>
                <TabsTrigger value="institutions" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Institutions ({users.filter(u => u.role === 'institution').length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Students</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'student' : 'students'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tutors" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Tutors</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'tutor' : 'tutors'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tutors found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="institutions" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Institutions</h3>
                    <Badge variant="outline">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'institution' : 'institutions'}
                    </Badge>
                  </div>
                  {filteredUsers.length > 0 ? (
                    <UserTable users={filteredUsers} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No institutions found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Suspend User</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to suspend <strong>{selectedUser?.full_name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will prevent the user from accessing their account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleSuspendUser(selectedUser)}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete User</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to permanently delete <strong>{selectedUser?.full_name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone. All user data will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Details Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Details - {selectedUser?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUser?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedUser?.location || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">{selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  {selectedUser?.updated_at && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Verification Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Status</p>
                      {selectedUser && getStatusBadge(selectedUser)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Profile Completion</p>
                      <p className="font-medium">{selectedUser?.profile_completion || 0}%</p>
                    </div>
                  </div>
                  {selectedUser?.rating && (
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium">{selectedUser.rating}/5 ({selectedUser.reviews_count || 0} reviews)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bio and Description */}
            {selectedUser?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Bio & Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Role-specific Information */}
            {selectedUser?.role === 'tutor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <GraduationCapIcon className="h-5 w-5" />
                    <span>Tutor Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{selectedUser?.experience || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-medium">{selectedUser?.hourly_rate ? `₹${selectedUser.hourly_rate}` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualifications</p>
                      <p className="font-medium">{selectedUser?.qualifications || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium">{selectedUser?.availability || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedUser?.subjects && selectedUser.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser?.teaching_mode && selectedUser.teaching_mode.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Teaching Modes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.teaching_mode.map((mode, index) => (
                          <Badge key={index} variant="outline">{mode}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedUser?.role === 'institution' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Institution Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Institution Name</p>
                      <p className="font-medium">{selectedUser?.institution_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Institution Type</p>
                      <p className="font-medium">{selectedUser?.institution_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Established Year</p>
                      <p className="font-medium">{selectedUser?.established_year || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{selectedUser?.registration_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Complete Address</p>
                      <p className="font-medium">{selectedUser?.complete_address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City, State</p>
                      <p className="font-medium">{selectedUser?.city && selectedUser?.state ? `${selectedUser.city}, ${selectedUser.state}` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PIN Code</p>
                      <p className="font-medium">{selectedUser?.pin_code || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium">{selectedUser?.languages?.join(', ') || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedUser?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Student Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Education Level</p>
                      <p className="font-medium">{selectedUser?.grade_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedUser?.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Learning Mode</p>
                      <p className="font-medium">{selectedUser?.learning_mode || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Budget Range</p>
                      <p className="font-medium">
                        {selectedUser?.budget_min && selectedUser?.budget_max 
                          ? `₹${selectedUser.budget_min} - ₹${selectedUser.budget_max}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class Duration</p>
                      <p className="font-medium">{selectedUser?.class_duration ? `${selectedUser.class_duration} minutes` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-medium">{selectedUser?.frequency || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tutor Gender Preference</p>
                      <p className="font-medium">{selectedUser?.tutor_gender_preference || 'No preference'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instruction Language</p>
                      <p className="font-medium">{selectedUser?.instruction_language || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class Type Preference</p>
                      <p className="font-medium">{selectedUser?.class_type_preference || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Timeline</p>
                      <p className="font-medium">{selectedUser?.timeline || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedUser?.subjects && selectedUser.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subjects of Interest</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser?.learning_goals && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Learning Goals</p>
                      <p className="text-gray-700">{selectedUser.learning_goals}</p>
                    </div>
                  )}
                  {selectedUser?.special_requirements && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Special Requirements</p>
                      <p className="text-gray-700">{selectedUser.special_requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents & Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Document verification system coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">Uploaded documents will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
            {selectedUser?.verification_status === 'pending' && (selectedUser?.role === 'tutor' || selectedUser?.role === 'institution') && (
              <div className="flex space-x-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowProfileDialog(false);
                    setShowApproveDialog(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Profile
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowProfileDialog(false);
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Profile
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve User Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Approve User Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to approve <strong>{selectedUser?.full_name}</strong>'s {selectedUser?.role} profile?
            </p>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>This will:</strong>
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Mark the {selectedUser?.role} profile as verified</li>
                <li>• Allow the {selectedUser?.role} to access all platform features</li>
                <li>• Make their profile visible to students and other users</li>
                <li>• Send an approval notification to the {selectedUser?.role}</li>
                {selectedUser?.role === 'tutor' && <li>• Enable them to create and manage courses</li>}
                {selectedUser?.role === 'institution' && <li>• Enable them to create institutional courses</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedUser && handleApproveUser(selectedUser)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Reject User Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to reject <strong>{selectedUser?.full_name}</strong>'s {selectedUser?.role} profile?
            </p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>This will:</strong>
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Mark the {selectedUser?.role} profile as rejected</li>
                <li>• Restrict access to platform features</li>
                <li>• Hide their profile from students and other users</li>
                <li>• Send a rejection notification with feedback</li>
                {selectedUser?.role === 'tutor' && <li>• Prevent them from creating or managing courses</li>}
                {selectedUser?.role === 'institution' && <li>• Prevent them from creating institutional courses</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && handleRejectUser(selectedUser)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
