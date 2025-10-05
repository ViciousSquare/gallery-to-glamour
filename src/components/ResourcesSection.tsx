import { useState, useEffect } from "react";
import { supabase, type Resource } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown } from "lucide-react";

const ResourcesSection = () => {
  const [activeCategory, setActiveCategory] = useState("Programs");
  const [showAll, setShowAll] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "All Resources" },
    { name: "Programs" },
    { name: "Research" },
    { name: "Innovation" },
    { name: "Training" },
    { name: "Governance" },
    { name: "Events" },
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredResources = activeCategory === "All Resources" 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);
  
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
  
  const displayedResources = showAll ? sortedResources : sortedResources.slice(0, 6);
  const hasMore = filteredResources.length > 6;

  if (loading) {
    return (
      <section id="resources" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-xl text-blue-text">Loading resources...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="resources" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Curated AI Resources for Canadians
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto">
            Discover carefully selected programs, organizations, and educational materials 
            designed specifically for Canadian businesses and professionals.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? "default" : "outline"}
              className={
                activeCategory === category.name
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground hover:bg-muted"
              }
              onClick={() => {
                setActiveCategory(category.name);
                setShowAll(false);
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>

{/* Featured Resource - if any */}
        {displayedResources.filter(r => r.featured).length > 0 && (
          <div className="flex justify-center mb-12">
            {displayedResources.filter(r => r.featured).map((resource, index) => (
              <Card
                key={`featured-${index}`}
                className="group hover:shadow-xl transition-all duration-300 border-primary border-2 w-full max-w-md hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-navy group-hover:text-primary transition-colors mb-3">
                      {resource.title}
                    </h3>
                    {resource.eligibility && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Eligibility:</strong> {resource.eligibility}
                      </p>
                    )}
                    {resource.deadline && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Deadline:</strong> {resource.deadline}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tag === "Featured" ? "default" : "secondary"}
                        className={
                          tag === "Featured"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {resource.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-muted-foreground text-muted-foreground hover:bg-muted group-hover:border-primary group-hover:text-primary transition-colors"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    Learn More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Regular Resources Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {displayedResources.filter(r => !r.featured).map((resource, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-border hover:-translate-y-1 bg-card flex flex-col w-full max-w-sm sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
            >
              <CardHeader className="pb-4">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-navy group-hover:text-primary transition-colors mb-3">
                    {resource.title}
                  </h3>
                  {resource.eligibility && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Eligibility:</strong> {resource.eligibility}
                    </p>
                  )}
                  {resource.deadline && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Deadline:</strong> {resource.deadline}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                  {resource.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-muted-foreground text-muted-foreground hover:bg-muted group-hover:border-primary group-hover:text-primary transition-colors"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  Learn More
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* See More Button */}
        {hasMore && !showAll && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              See More Resources
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResourcesSection;