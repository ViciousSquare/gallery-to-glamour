import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown } from "lucide-react";

const ResourcesSection = () => {
  const [activeCategory, setActiveCategory] = useState("Programs");
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { name: "All Resources" },
    { name: "Programs" },
    { name: "Research" },
    { name: "Innovation" },
    { name: "Training" },
    { name: "Governance" },
    { name: "Events" },
  ];

  const resources = [
    // Federal Programs
    {
      title: "Regional AI Initiative (RAII) - FedDev Ontario",
      description: "$200M federal initiative supporting SMEs and non-profits in Southern Ontario with AI adoption and development projects.",
      tags: ["Program", "Federal", "Featured"],
      category: "Programs",
      url: "https://feddev-ontario.canada.ca/en/funding-southern-ontario/regional-artificial-intelligence-initiative",
      eligibility: "SMEs, not-for-profits",
      deadline: "Oct 22–Dec 20, 2024",
      featured: true,
    },
    {
      title: "Canada Digital Adoption Program (CDAP)",
      description: "Government program helping Canadian SMEs adopt digital technologies including AI tools and automation solutions.",
      tags: ["Program", "Federal"],
      category: "Programs",
      url: "https://cdaprogram.ca/",
      eligibility: "SMEs",
      deadline: "Rolling applications",
      featured: false,
    },
    {
      title: "AI Compute Access Fund",
      description: "Funding for SMEs and researchers to access high-performance computing resources for AI development and deployment.",
      tags: ["Program", "Federal"],
      category: "Programs",
      url: "https://ised-isde.canada.ca/site/ised/en/canadian-sovereign-ai-compute-strategy/ai-compute-access-fund",
      eligibility: "SMEs, researchers",
      deadline: "Check program updates",
      featured: false,
    },
    {
      title: "NRC IRAP - AI Stream",
      description: "National Research Council's Industrial Research Assistance Program providing funding and advisory services for AI innovation.",
      tags: ["Program", "Federal"],
      category: "Programs",
      url: "https://nrc.canada.ca/en/support-technology-innovation",
      eligibility: "Selected organizations",
      deadline: "Call for proposals",
      featured: false,
    },
    {
      title: "RAISE - Responsible AI Adoption",
      description: "Program supporting non-profits in adopting AI technologies responsibly and ethically for social impact.",
      tags: ["Program", "Social Impact"],
      category: "Programs",
      url: "https://dais.ca/raise/",
      eligibility: "Non-profits",
      deadline: "June 2025",
      featured: false,
    },
    {
      title: "Google.org Opportunity Fund (Canada)",
      description: "$13M commitment to help build Canada's AI workforce through partnerships with non-profit organizations.",
      tags: ["Program", "Training"],
      category: "Training",
      url: "https://blog.google/intl/en-ca/company-news/outreach-initiatives/helping-build-canadas-ai-workforce-with-a-13-million-commitment/",
      eligibility: "Non-profits",
      deadline: "June 2025",
      featured: false,
    },

    // Research Organizations
    {
      title: "Vector Institute",
      description: "Canada's national institute for artificial intelligence research and education, offering industry partnerships and talent development.",
      tags: ["Organization", "Research", "Featured"],
      category: "Research",
      url: "https://vectorinstitute.ai/programs/",
      eligibility: "SME-oriented programs",
      deadline: "Various programs",
      featured: true,
    },
    {
      title: "Mila - Quebec AI Institute",
      description: "World-renowned research institute led by Yoshua Bengio, offering cutting-edge AI research and industry collaboration.",
      tags: ["Organization", "Research"],
      category: "Research",
      url: "https://mila.quebec/",
      eligibility: "Various partnerships",
      deadline: "Check program schedules",
      featured: false,
    },
    {
      title: "Alberta Machine Intelligence Institute (Amii)",
      description: "Leading AI research institute offering AI Pathways program and sector-specific AI solutions, particularly in energy.",
      tags: ["Organization", "Research"],
      category: "Research",
      url: "https://www.amii.ca/ai-pathways-energy",
      eligibility: "Sector-specific programs",
      deadline: "Various intakes",
      featured: false,
    },
    {
      title: "CIFAR - Inclusive AI Scholarships",
      description: "Canadian Institute for Advanced Research offering next-generation AI programs with focus on Black and Indigenous students.",
      tags: ["Organization", "Research", "Diversity"],
      category: "Research",
      url: "https://cifar.ca/ai/next-generation-ai-programs/",
      eligibility: "Black and Indigenous students",
      deadline: "Annual applications",
      featured: false,
    },

    // Innovation & Industry
    {
      title: "Scale AI (Canadian AI Supercluster)",
      description: "National industry consortium connecting companies across sectors to accelerate AI adoption and develop AI supply chains.",
      tags: ["Organization", "Innovation"],
      category: "Innovation",
      url: "https://www.scaleai.ca/",
      eligibility: "Industry consortium members",
      deadline: "Project-based applications",
      featured: true,
    },
    {
      title: "Creative Destruction Lab",
      description: "Seed-stage program for massively scalable, science-based companies, with dedicated AI stream and mentorship network.",
      tags: ["Program", "Innovation"],
      category: "Innovation",
      url: "https://creativedestructionlab.com/programs/",
      eligibility: "Enterprise-level startups",
      deadline: "Seasonal applications",
      featured: false,
    },
    {
      title: "MaRS Discovery District - Impact AI",
      description: "Toronto-based innovation hub providing startup support, mentorship, and connections for AI companies.",
      tags: ["Organization", "Innovation"],
      category: "Innovation",
      url: "https://impactai.marsdd.com/",
      eligibility: "AI startups",
      deadline: "Rolling applications",
      featured: false,
    },
    {
      title: "Communitech",
      description: "Waterloo-based tech hub supporting AI and tech startups with mentorship, networking, and growth programs.",
      tags: ["Organization", "Innovation"],
      category: "Innovation",
      url: "https://www.communitech.ca/",
      eligibility: "Tech startups",
      deadline: "Various programs",
      featured: false,
    },
    {
      title: "Volta (Halifax)",
      description: "Atlantic Canada's largest startup hub supporting AI and tech companies with workspace, mentorship, and connections.",
      tags: ["Organization", "Innovation"],
      category: "Innovation",
      url: "https://www.voltaeffect.com/",
      eligibility: "Startup hub members",
      deadline: "Rolling membership",
      featured: false,
    },

    // Training & Education
    {
      title: "Digital Nova Scotia - AI Microcredentials",
      description: "Professional development program offering AI microcredentials for working professionals in Atlantic Canada.",
      tags: ["Program", "Training"],
      category: "Training",
      url: "https://digitalnovascotia.com/programs/microcredentials/",
      eligibility: "Working professionals",
      deadline: "Seasonal cohorts",
      featured: false,
    },
    {
      title: "Toronto Region Board of Trade - AI Business Catalyst",
      description: "Business-focused AI training and networking program for SMEs in the Greater Toronto Area.",
      tags: ["Program", "Training"],
      category: "Training",
      url: "https://bot.com/AI-Business-Catalyst",
      eligibility: "SMEs in Toronto region",
      deadline: "Rolling applications",
      featured: false,
    },
    {
      title: "Institute of Corporate Directors - AI Board Oversight",
      description: "Executive education program for board directors on AI governance, risk management, and strategic oversight.",
      tags: ["Program", "Training", "Governance"],
      category: "Training",
      url: "https://www.icd.ca/en/education/executive/director-level-courses/issues-oversight/board-oversight-of-ai",
      eligibility: "Corporate directors",
      deadline: "Course schedules",
      featured: false,
    },

    // Governance & Policy
    {
      title: "Canadian AI and Data Commissioner",
      description: "Government office providing guidance on AI governance, privacy compliance, and ethical AI implementation.",
      tags: ["Organization", "Governance"],
      category: "Governance",
      url: "https://www.priv.gc.ca/en/about-the-opc/",
      eligibility: "All organizations",
      deadline: "Ongoing guidance",
      featured: false,
    },
    {
      title: "Ontario's Trustworthy AI Framework",
      description: "Provincial framework providing guidelines for responsible AI development and deployment in public sector.",
      tags: ["Framework", "Governance"],
      category: "Governance",
      url: "https://www.ontario.ca/page/ontarios-trustworthy-ai-framework",
      eligibility: "Public sector organizations",
      deadline: "Published framework",
      featured: false,
    },
    {
      title: "First Nations Technology Council (FNTC)",
      description: "Indigenous-led organization promoting responsible AI adoption and digital sovereignty in First Nations communities.",
      tags: ["Organization", "Indigenous", "Governance"],
      category: "Governance",
      url: "https://technologycouncil.ca/",
      eligibility: "Indigenous-led initiatives",
      deadline: "Community-based programs",
      featured: false,
    },

    // Events & Conferences
    {
      title: "AI North Conference",
      description: "Canada's premier AI conference bringing together industry leaders, researchers, and practitioners to discuss the latest in artificial intelligence.",
      tags: ["Conference", "Annual"],
      category: "Events",
      url: "https://ainorth.ca/",
      eligibility: "Open registration",
      deadline: "Annual - Fall",
      featured: true,
    },
    {
      title: "Vector Institute AI Symposium",
      description: "Annual symposium showcasing cutting-edge AI research and industry applications, featuring keynotes from leading AI researchers.",
      tags: ["Symposium", "Research"],
      category: "Events",
      url: "https://vectorinstitute.ai/events/",
      eligibility: "Open registration",
      deadline: "Annual - Spring",
      featured: false,
    },
    {
      title: "Montreal AI Symposium (MAIS)",
      description: "Student-run conference at McGill University focusing on AI research, applications, and career development in artificial intelligence.",
      tags: ["Conference", "Student-led"],
      category: "Events",
      url: "https://montrealaisymposium.com/",
      eligibility: "Students and professionals",
      deadline: "Annual - Winter",
      featured: false,
    },
    {
      title: "Toronto Machine Learning Society (TMLS)",
      description: "Regular meetups and annual conference for machine learning practitioners, researchers, and enthusiasts in the Toronto area.",
      tags: ["Meetup", "Conference"],
      category: "Events",
      url: "https://www.torontomachinelearning.com/",
      eligibility: "Open membership",
      deadline: "Monthly meetups",
      featured: false,
    },
    {
      title: "AI for Good Global Summit (Canadian Participation)",
      description: "UN-hosted summit with strong Canadian participation, focusing on AI applications for sustainable development and social good.",
      tags: ["Summit", "Global", "Social Impact"],
      category: "Events",
      url: "https://aiforgood.itu.int/",
      eligibility: "International participation",
      deadline: "Annual - Spring",
      featured: false,
    },
    {
      title: "Canadian AI Conference (CAIAC)",
      description: "National conference bringing together Canadian AI researchers, industry professionals, and policymakers to discuss AI advancement.",
      tags: ["Conference", "National"],
      category: "Events",
      url: "https://caiac.ca/",
      eligibility: "Open registration",
      deadline: "Annual - Summer",
      featured: false,
    },
    {
      title: "Waterloo AI Summit",
      description: "Regional summit hosted by University of Waterloo, focusing on AI research, entrepreneurship, and industry collaboration.",
      tags: ["Summit", "Regional"],
      category: "Events",
      url: "https://uwaterloo.ca/artificial-intelligence-institute/events",
      eligibility: "Open registration",
      deadline: "Annual - Fall",
      featured: false,
    },
    {
      title: "Women in AI Canada Meetups",
      description: "Regular networking events and workshops promoting diversity and inclusion in AI across major Canadian cities.",
      tags: ["Meetup", "Diversity", "Women in Tech"],
      category: "Events",
      url: "https://www.womeninai.co/",
      eligibility: "Open to all",
      deadline: "Monthly events",
      featured: false,
    },
  ];

  const filteredResources = activeCategory === "All Resources" 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);
  
  const displayedResources = showAll ? filteredResources : filteredResources.slice(0, 6);
  const hasMore = filteredResources.length > 6;

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