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

  console.log('Component render - loading:', loading, 'resources:', resources.length);
  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    console.log('Fetching resources...')
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

        console.log('Supabase response:', { data, error });

      if (error) throw error;
      setResources(data || []);
      console.log('Resources set:', data?.length)
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  }


  const filteredResources = activeCategory === "All Resources" 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);
  console.log('Filtered resources:', filteredResources.length)
  const displayedResources = showAll ? filteredResources : filteredResources.slice(0, 6);
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
        <div className="flex flex-wrap justify-center gap-2 mb-12">
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

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedResources.map((resource, index) => (
            <Card
              key={index}
              className={`group hover:shadow-lg transition-all duration-300 ${
                resource.featured ? "border-primary border-2" : "border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-navy group-hover:text-primary transition-colors mb-2">
                    {resource.title}
                  </h3>
                  {resource.eligibility && (
                    <p className="text-sm text-muted-foreground mb-1">
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
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {resource.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-muted-foreground text-muted-foreground hover:bg-muted group-hover:border-primary group-hover:text-primary"
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