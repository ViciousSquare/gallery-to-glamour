import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  'Programs',
  'Research',
  'Innovation',
  'Training',
  'Governance',
  'Events',
];

const availableTags = [
  'Program',
  'Federal',
  'Provincial',
  'Featured',
  'Organization',
  'Research',
  'Innovation',
  'Training',
  'Governance',
  'Conference',
  'Annual',
  'Social Impact',
  'Diversity',
  'Indigenous',
];

export default function AddResource() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    url: '',
    eligibility: '',
    deadline: '',
    featured: false,
  });

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.url) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.tags.length === 0) {
      setError('Please select at least one tag');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('resources')
      .insert([{
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        url: formData.url,
        eligibility: formData.eligibility || null,
        deadline: formData.deadline || null,
        featured: formData.featured,
      }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Add New Resource</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Regional AI Initiative (RAII)"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of the resource..."
                  rows={4}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags * (select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={formData.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label
                        htmlFor={tag}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.tags.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.tags.join(', ')}
                  </p>
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              {/* Eligibility */}
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility (optional)</Label>
                <Input
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  placeholder="e.g., SMEs, non-profits"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="e.g., Rolling applications, June 2025"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, featured: checked as boolean })
                  }
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mark as Featured
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Resource'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}