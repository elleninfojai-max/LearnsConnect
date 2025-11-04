import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Building2, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface InstitutionProfile {
  id: string;
  user_id: string;
  institution_name: string;
  description: string;
  type: string;
  established_year: number;
  student_count: number;
  verified: boolean;
  created_at: string;
  profile: {
    full_name: string;
    city: string;
    area: string;
  };
  subjects?: string[];
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      
      // NEW STRATEGY: Start with verification_requests (this table is more accessible)
      // Find all verified institutions from verification_requests first
      console.log('🔍 Step 1: Fetching ALL verified institutions from verification_requests...');
      
      // First, get ALL verification_requests (for debugging)
      const { data: allVerificationRequestsDebug, error: allVerificationErrorDebug } = await supabase
        .from('verification_requests')
        .select('user_id, status, user_type')
        .in('user_type', ['institute', 'institution']);
      
      if (!allVerificationErrorDebug) {
        console.log('📊 Total verification_requests (all statuses):', allVerificationRequestsDebug?.length || 0);
        allVerificationRequestsDebug?.forEach(req => {
          console.log(`  - user_id: ${req.user_id}, status: ${req.status}, user_type: ${req.user_type}`);
        });
      }
      
      // Now get only verified ones
      const { data: allVerificationRequests, error: allVerificationError } = await supabase
        .from('verification_requests')
        .select('user_id, status, user_type')
        .in('user_type', ['institute', 'institution'])
        .eq('status', 'verified'); // Only get verified ones

      if (allVerificationError) {
        console.error('❌ Error fetching verification requests:', allVerificationError);
      } else {
        console.log('✅ Found verified institutions in verification_requests:', allVerificationRequests?.length || 0);
        allVerificationRequests?.forEach(req => {
          console.log(`  - user_id: ${req.user_id}, user_type: ${req.user_type}`);
        });
      }

      // Get user_ids from verification_requests
      const verifiedUserIdsFromRequests = allVerificationRequests?.map(req => req.user_id) || [];
      console.log('📋 Verified user IDs from verification_requests:', verifiedUserIdsFromRequests);

      // Step 2: Also fetch institutions with verified=true in institution_profiles (in case RLS allows it)
      console.log('🔍 Step 2: Fetching institutions with verified=true in institution_profiles...');
      const { data: verifiedInProfileData, error: verifiedInProfileError } = await supabase
        .from('institution_profiles')
        .select('id, user_id, institution_name, verified, status, created_at')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (verifiedInProfileError) {
        console.warn('⚠️ Error fetching verified institutions from profiles:', verifiedInProfileError);
      } else {
        console.log('✅ Found institutions with verified=true:', verifiedInProfileData?.length || 0);
        verifiedInProfileData?.forEach(inst => {
          console.log(`  - ${inst.institution_name || 'Unknown'}: user_id=${inst.user_id}, verified=${inst.verified}, status=${inst.status}`);
        });
      }

      // Also try fetching ALL institution_profiles (for debugging) to see what RLS allows
      console.log('🔍 Step 2b: Attempting to fetch ALL institution_profiles (for debugging)...');
      const { data: allInstitutionProfiles, error: allProfilesError } = await supabase
        .from('institution_profiles')
        .select('*') // Fetch ALL columns to get complete data
        .order('created_at', { ascending: false });

      if (allProfilesError) {
        console.warn('⚠️ Error fetching ALL institution_profiles:', allProfilesError);
        console.log('⚠️ RLS might be blocking access. Will rely on verified=true query only.');
      } else {
        console.log('📊 Total institution_profiles in database (RLS allowing):', allInstitutionProfiles?.length || 0);
        allInstitutionProfiles?.forEach(inst => {
          const verified = inst.verified === true || inst.verified === 'true' || inst.verified === 1 || inst.verified === '1';
          const approved = inst.status === 'approved';
          console.log(`  - ${inst.institution_name || 'Unknown'}: user_id=${inst.user_id}, verified=${verified}, status=${inst.status || 'null'}`);
        });
        
        // Check if there are verified institutions that weren't in the first query
        const verifiedButNotInFirstQuery = allInstitutionProfiles?.filter(inst => {
          const verified = inst.verified === true || inst.verified === 'true' || inst.verified === 1 || inst.verified === '1';
          const approved = inst.status === 'approved';
          return (verified || approved) && !verifiedInProfileData?.some(v => v.user_id === inst.user_id);
        }) || [];
        
        if (verifiedButNotInFirstQuery.length > 0) {
          console.log(`⚠️ Found ${verifiedButNotInFirstQuery.length} additional verified institutions in full query:`);
          verifiedButNotInFirstQuery.forEach(inst => {
            console.log(`  - ${inst.institution_name || 'Unknown'}: user_id=${inst.user_id}, verified=${inst.verified}, status=${inst.status}`);
          });
        }
      }

      // Step 3: Fetch institution_profiles for user_ids from verification_requests
      // This is the key - even if verified=false in institution_profiles, if it's verified in verification_requests, we should show it
      let institutionsFromRequests: any[] = [];
      if (verifiedUserIdsFromRequests.length > 0) {
        console.log('🔍 Step 3: Fetching institution_profiles for verified user_ids...');
        const { data: instData, error: instError } = await supabase
          .from('institution_profiles')
          .select('*')
          .in('user_id', verifiedUserIdsFromRequests)
          .order('created_at', { ascending: false });

        if (instError) {
          console.error('❌ Error fetching institution_profiles for verified user_ids:', instError);
          console.log('⚠️ This might be due to RLS blocking access. Institution might still be verified via verification_requests.');
        } else {
          institutionsFromRequests = instData || [];
          console.log('✅ Found institution_profiles for verified user_ids:', institutionsFromRequests.length);
          institutionsFromRequests.forEach(inst => {
            console.log(`  - ${inst.institution_name || 'Unknown'}: verified=${inst.verified}, user_id=${inst.user_id}`);
          });
        }
      }

      // Step 4: Combine both sources and remove duplicates
      const allVerifiedInstitutions: any[] = [];
      const addedUserIds = new Set<string>();

      // PRIORITY 1: Add ALL institutions with verified=true OR status=approved in institution_profiles
      // Use allInstitutionProfiles if available (has all data), otherwise use verifiedInProfileData
      const allVerifiedInProfiles = allInstitutionProfiles?.filter(inst => {
        const verified = inst.verified === true || inst.verified === 'true' || inst.verified === 1 || inst.verified === '1';
        const approved = inst.status === 'approved';
        return verified || approved;
      }) || [];
      
      // If we got full data from allInstitutionProfiles, use it directly
      // Otherwise, fetch full data for verified institutions
      if (allInstitutionProfiles && allInstitutionProfiles.length > 0) {
        // We already have full data from allInstitutionProfiles query
        console.log('📋 Using full data from allInstitutionProfiles query');
        allVerifiedInProfiles.forEach(inst => {
          if (!addedUserIds.has(inst.user_id)) {
            inst.verified = true; // Ensure verified is true
            allVerifiedInstitutions.push(inst);
            addedUserIds.add(inst.user_id);
            console.log(`  ✅ Added from institution_profiles: ${inst.institution_name || inst.user_id}`);
          }
        });
      } else {
        // Fallback: fetch full data for verified institutions
        const verifiedInstitutionsToAdd = verifiedInProfileData || [];
        console.log('📋 Institutions to add from institution_profiles (verified=true):', verifiedInstitutionsToAdd.length);
        
        const verifiedUserIdsToFetch = verifiedInstitutionsToAdd.map(inst => inst.user_id).filter((id, index, self) => self.indexOf(id) === index);
        
        if (verifiedUserIdsToFetch.length > 0) {
          console.log('🔍 Fetching full data for verified institutions...');
          const { data: fullData, error: fullDataError } = await supabase
            .from('institution_profiles')
            .select('*')
            .in('user_id', verifiedUserIdsToFetch);
          
          if (!fullDataError && fullData) {
            console.log(`✅ Fetched full data for ${fullData.length} institutions`);
            fullData.forEach(fullInst => {
              if (!addedUserIds.has(fullInst.user_id)) {
                fullInst.verified = true;
                allVerifiedInstitutions.push(fullInst);
                addedUserIds.add(fullInst.user_id);
                console.log(`  ✅ Added from institution_profiles: ${fullInst.institution_name || fullInst.user_id}`);
              }
            });
          } else {
            console.warn('⚠️ Error fetching full data, using partial data:', fullDataError);
            verifiedInstitutionsToAdd.forEach(inst => {
              if (!addedUserIds.has(inst.user_id)) {
                const partialInst = { ...inst, verified: true };
                allVerifiedInstitutions.push(partialInst);
                addedUserIds.add(inst.user_id);
                console.log(`  ✅ Added (partial data): ${inst.institution_name || inst.user_id}`);
              }
            });
          }
        }
      }

      // Add institutions from verification_requests (even if verified=false in institution_profiles)
      institutionsFromRequests.forEach(inst => {
        if (!addedUserIds.has(inst.user_id)) {
          // Mark as verified since verification_requests says so
          inst.verified = true;
          allVerifiedInstitutions.push(inst);
          addedUserIds.add(inst.user_id);
        }
      });

      // Step 5: If we have verified user_ids but couldn't fetch their institution_profiles,
      // try to get basic info from the profiles table and create minimal entries
      const missingUserIds = verifiedUserIdsFromRequests.filter(userId => !addedUserIds.has(userId));
      if (missingUserIds.length > 0) {
        console.log(`⚠️ Found ${missingUserIds.length} verified institutions without institution_profiles. Fetching from profiles table...`);
        
        // Fetch basic profile data from profiles table for these user_ids
        // CRITICAL: verification_requests.user_id = auth.users.id = profiles.user_id (NOT profiles.id)
        console.log('🔍 Fetching profiles for missing user_ids:', missingUserIds);
        let { data: missingProfiles, error: missingProfilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, city, area, role')
          .in('user_id', missingUserIds) // FIXED: profiles.user_id = auth.users.id = verification_requests.user_id
          .eq('role', 'institution');

        if (missingProfilesError) {
          console.error('❌ Error fetching missing profiles:', missingProfilesError);
          console.log('⚠️ Will try to fetch by profiles.id as fallback...');
          // Fallback: try fetching by profiles.id (in case user_id doesn't match)
          const { data: fallbackProfiles, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, city, area, role')
            .in('id', missingUserIds)
            .eq('role', 'institution');
          
          if (!fallbackError && fallbackProfiles && fallbackProfiles.length > 0) {
            console.log(`✅ Found ${fallbackProfiles.length} profiles using fallback (by id)`);
            missingProfiles = fallbackProfiles;
            missingProfilesError = null;
          }
        }
        
        if (!missingProfilesError && missingProfiles && missingProfiles.length > 0) {
          console.log(`✅ Found ${missingProfiles.length} profiles for verified institutions`);
          
          // Create minimal institution_profiles entries from profiles data
          missingProfiles.forEach(profile => {
            // Use profiles.user_id (which matches auth.users.id and verification_requests.user_id)
            const profileUserId = profile.user_id || profile.id; // Prefer user_id, fallback to id
            if (profileUserId && !addedUserIds.has(profileUserId)) {
              const minimalInstitution = {
                id: profile.id || crypto.randomUUID(),
                user_id: profileUserId, // This matches verification_requests.user_id
                institution_name: profile.full_name || 'Institution',
                institution_type: 'Educational Institution',
                verified: true, // Verified via verification_requests
                status: 'approved', // Also set status to approved
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Add location data from profiles
                city: profile.city || 'Various Locations',
                area: profile.area || 'Online & In-Person',
                state: profile.area || '',
                description: 'Verified educational institution',
                // Default values for required fields
                established_year: new Date().getFullYear(),
                registration_number: null,
                student_count: 0
              };
              
              allVerifiedInstitutions.push(minimalInstitution);
              addedUserIds.add(profileUserId);
              console.log(`✅ Created minimal institution entry for ${profile.full_name || profileUserId} (user_id: ${profileUserId})`);
            } else {
              console.log(`⚠️ Skipping profile ${profile.full_name || profile.id} - already added or missing user_id`);
            }
          });
        } else {
          console.warn(`⚠️ No profiles found for missing user_ids: ${missingUserIds.join(', ')}`);
        }
      }

      console.log('✅ Combined verified institutions count:', allVerifiedInstitutions.length);
      console.log('✅ Verified institutions:', allVerifiedInstitutions.map(i => i.institution_name || i.user_id));
      const institutionData = allVerifiedInstitutions;

      if (!institutionData || institutionData.length === 0) {
        console.log('No verified institution profiles found');
        setInstitutions([]);
        return;
      }

      console.log('✅ Final institution profiles count:', institutionData.length);

      // All institutions in institutionData are already verified (from either source)
      const verifiedInstitutions = institutionData;

      // Fetch the corresponding user profiles (optional - don't fail if some don't exist)
      const verifiedUserIds = verifiedInstitutions.map(institution => institution.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, city, area')
        .in('id', verifiedUserIds);

      if (profileError) {
        console.warn('⚠️ Error fetching profiles (continuing anyway):', profileError);
        // Don't return - continue even if profiles fetch fails
      }

      // Create a map of user_id to profile data
      const profileMap = new Map(profileData?.map(profile => [profile.id, profile]) || []);
      console.log('Found profiles:', profileData?.length || 0);

      // Transform the data to match our interface
      const transformedInstitutions = verifiedInstitutions.map(institution => {
        const profile = profileMap.get(institution.user_id);
        
        // Use location from institution_profiles if profile doesn't have it
        const city = profile?.city || institution.city || 'Various Locations';
        const area = profile?.area || institution.area || 'Online & In-Person';
        
        return {
          ...institution,
          verified: true, // Ensure verified is set to true for display
          profile: profile || {
            full_name: institution.institution_name || 'Partner Institution',
            city: city,
            area: area
          },
          // Extract subjects if available
          subjects: institution.subjects || []
        };
      });

      console.log('✅ Final transformed institutions count:', transformedInstitutions.length);
      setInstitutions(transformedInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionType = (type: string) => {
    if (!type) return 'Educational Institution';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getSubjects = (institution: InstitutionProfile) => {
    if (institution.subjects && institution.subjects.length > 0) {
      return institution.subjects.join(', ');
    }
    return 'Multiple Subjects';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading institutions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Partner with Leading
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Institutions
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified educational institutions committed to academic excellence
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{institutions.length} verified institutions available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {institutions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Building2 className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No institutions available</h3>
                <p>Check back later for available institutions or become one yourself!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <Card key={institution.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Institution Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-lg">
                          {institution.institution_name?.split(' ').map(n => n[0]).join('') || 'PI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {institution.institution_name || 'Partner Institution'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{getInstitutionType(institution.type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{institution.profile.city}, {institution.profile.area}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {institution.description || 'Committed to providing quality education and fostering academic excellence'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Est. {institution.established_year || '2020'}</span>
                        <span>•</span>
                        <span className="text-sm font-medium text-primary">
                          {institution.student_count || '500'}+ students
                        </span>
                      </div>
                    </div>

                    {/* Institution Type */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {getInstitutionType(institution.type)}
                      </Badge>
                      {institution.verified && (
                        <Badge variant="default" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link to="/signup-choice">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signup CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Partner with Top Institutions?
            </h2>
            <p className="text-xl text-muted-foreground">
              Sign up now to access complete institution profiles, explore partnership opportunities, and start your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg"
                  className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-lg px-8 py-3 h-auto"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-lg px-8 py-3 h-auto"
                >
                  Already have an account? Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
