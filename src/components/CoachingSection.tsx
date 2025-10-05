import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useScrollAnimationMultiple } from "@/hooks/useScrollAnimation";

interface Coach {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
  display_order: number;
}

const CoachingSection = () => {
  useScrollAnimationMultiple();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching coaches:', error);
    } else {
      setCoaches(data || []);
    }
    setLoading(false);
  };

  return (
    <section id="coaching" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 scroll-fade">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Personalized AI Navigation for Canadian Leaders
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto mb-12">
            Get expert guidance tailored to your business needs. Our experienced navigators and coaches 
            understand the Canadian market and regulatory landscape.
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="mb-16 scroll-fade">
          <h3 className="text-2xl font-bold text-navy text-center mb-8">Expert Navigators and Coaches</h3>
          
          {loading ? (
            <div className="text-center py-8">Loading coaches...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {coaches.map((coach) => (
                <HoverCard key={coach.id}>
                  <HoverCardTrigger asChild>
                    <div className="text-center cursor-pointer">
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        {coach.image_url && (
                          <AvatarImage src={coach.image_url} alt={coach.name} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="text-sm font-semibold text-navy">
                        {coach.name}
                      </h4>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{coach.name}</h4>
                      {coach.bio && (
                        <p className="text-sm text-muted-foreground">
                          {coach.bio}
                        </p>
                      )}
                      {coach.linkedin_url && (
                        <a
                          href={coach.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View LinkedIn Profile →
                        </a>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground/50">+</span>
                </div>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  More to come
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* Apply to be an expert button */}
        <div className="text-center mb-16">
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <a href="?interest=coach#contact">
              Apply to be an expert
            </a>
          </Button>
        </div>


      </div>
    </section>
  );
};

export default CoachingSection;