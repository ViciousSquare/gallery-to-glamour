import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function EditCoach() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    linkedin_url: '',
    image_url: '',
    display_order: 0,
    active: true,
  });

  useEffect(() => {
    fetchCoach();
  }, [id]);

  const fetchCoach = async () => {
    if (!id) return;
    
    setLoadingCoach(true);
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Coach not found');
      setLoadingCoach(false);
    } else if (data) {
      setFormData({
        name: data.name,
        bio: data.bio || '',
        linkedin_url: data.linkedin_url || '',
        image_url: data.image_url || '',
        display_order: data.display_order,
        active: data.active,
      });
      setImagePreview(data.image_url);
      setLoadingCoach(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('coach-images')
      .upload(filePath, file);

    if (uploadError) {
      setError(`Error uploading image: ${uploadError.message}`);
      setUploadingImage(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('coach-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setImagePreview(publicUrl);
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name) {
      setError('Please enter a name');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('coaches')
      .update({
        name: formData.name,
        bio: formData.bio || null,
        linkedin_url: formData.linkedin_url || null,
        image_url: formData.image_url || null,
        display_order: formData.display_order,
        active: formData.active,
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  if (loadingCoach) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-lg">Loading coach...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Edit Coach</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Coach Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    {imagePreview && <AvatarImage src={imagePreview} />}
                    <AvatarFallback>
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadingImage ? 'Uploading...' : 'JPG, PNG, or WEBP. Max 2MB.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Patrick Farrar"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="A brief professional bio that will appear on hover..."
                  rows={4}
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first (0, 1, 2, ...)
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Active (show on website)
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
                  disabled={loading || uploadingImage}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}