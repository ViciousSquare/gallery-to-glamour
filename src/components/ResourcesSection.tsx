import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const ResourcesSection = () => {
  const categories = [
    { name: "All Resources", active: true },
    { name: "Research", active: false },
    { name: "Innovation", active: false },
    { name: "Small Business", active: false },
    { name: "Governance", active: false },
  ];

  const resources = [
    {
      title: "Vector Institute",
      description: "Canada's national institute for artificial intelligence research and education, based in Toronto with partnerships across the country.",
      tags: ["Organization", "Research", "Featured"],
      featured: true,
    },
    {
      title: "Mila - Quebec AI Institute",
      description: "World-renowned research institute led by Yoshua Bengio, offering cutting-edge AI research and collaboration opportunities in Montreal.",
      tags: ["Organization", "Research"],
      featured: false,
    },
    {
      title: "AI for Good Lab - Microsoft",
      description: "Microsoft's AI for Good Lab in Vancouver focuses on using AI to address global challenges and societal issues.",
      tags: ["Organization", "Innovation"],
      featured: false,
    },
    {
      title: "CIFAR AI Program",
      description: "Canadian Institute for Advanced Research's AI program connecting researchers, industry, and policy makers across Canada.",
      tags: ["Program", "Research"],
      featured: false,
    },
    {
      title: "Digital Main Street",
      description: "Government-funded program helping Canadian small businesses adopt digital technologies including AI tools and automation.",
      tags: ["Program", "Small Business"],
      featured: false,
    },
    {
      title: "Canadian AI and Data Commissioner",
      description: "Government office providing guidance on AI governance, privacy, and ethical implementation for Canadian organizations.",
      tags: ["Organization", "Governance"],
      featured: false,
    },
  ];

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
              variant={category.active ? "default" : "outline"}
              className={
                category.active
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground hover:bg-muted"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className={`group hover:shadow-lg transition-all duration-300 ${
                resource.featured ? "border-primary border-2" : "border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-navy group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
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
                >
                  Learn More
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;