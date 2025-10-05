import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ParsedResource {
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  eligibility?: string;
  deadline?: string;
  featured: boolean;
  rowNumber: number;
  errors: string[];
}

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

export default function BulkImportResources() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResource[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const parseCSV = (csvText: string): ParsedResource[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const requiredHeaders = ['title', 'description', 'category', 'tags', 'url'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: ParsedResource[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const rowErrors: string[] = [];

      const resource: ParsedResource = {
        title: values[headers.indexOf('title')] || '',
        description: values[headers.indexOf('description')] || '',
        category: values[headers.indexOf('category')] || '',
        tags: (values[headers.indexOf('tags')] || '').split(';').map(t => t.trim()).filter(t => t),
        url: values[headers.indexOf('url')] || '',
        eligibility: values[headers.indexOf('eligibility')] || undefined,
        deadline: values[headers.indexOf('deadline')] || undefined,
        featured: (values[headers.indexOf('featured')] || '').toLowerCase() === 'true',
        rowNumber: i + 1,
        errors: rowErrors,
      };

      // Validation
      if (!resource.title) rowErrors.push('Title is required');
      if (!resource.description) rowErrors.push('Description is required');
      if (!resource.category) rowErrors.push('Category is required');
      else if (!categories.includes(resource.category)) rowErrors.push(`Invalid category. Must be one of: ${categories.join(', ')}`);
      if (resource.tags.length === 0) rowErrors.push('At least one tag is required');
      else {
        const invalidTags = resource.tags.filter(t => !availableTags.includes(t));
        if (invalidTags.length > 0) rowErrors.push(`Invalid tags: ${invalidTags.join(', ')}. Valid tags: ${availableTags.join(', ')}`);
      }
      if (!resource.url) rowErrors.push('URL is required');
      else {
        try {
          new URL(resource.url);
        } catch {
          rowErrors.push('URL must be a valid URL');
        }
      }

      data.push(resource);
    }

    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrors(['Please select a CSV file']);
      return;
    }

    setFile(file);
    setErrors([]);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsed = parseCSV(csvText);
        setParsedData(parsed);
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Failed to parse CSV']);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validResources = parsedData.filter(r => r.errors.length === 0);
    if (validResources.length === 0) {
      toast.error('No valid resources to import');
      return;
    }

    setLoading(true);
    try {
      const resourcesToInsert = validResources.map(r => ({
        title: r.title,
        description: r.description,
        category: r.category,
        tags: r.tags,
        url: r.url,
        eligibility: r.eligibility || null,
        deadline: r.deadline || null,
        featured: r.featured,
      }));

      const { data, error } = await supabase
        .from('resources')
        .insert(resourcesToInsert)
        .select();

      if (error) throw error;

      toast.success(`Successfully imported ${data.length} resources`);
      navigate('/admin');
    } catch (error: any) {
      toast.error('Import failed', {
        description: error.message,
      });
    }
    setLoading(false);
  };

  const hasErrors = parsedData.some(r => r.errors.length > 0);
  const validCount = parsedData.filter(r => r.errors.length === 0).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin?tab=resources')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Bulk Import Resources</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with the following columns. All columns are case-insensitive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Required Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>title</strong> - Resource title</li>
                  <li><strong>description</strong> - Detailed description</li>
                  <li><strong>category</strong> - One of: {categories.join(', ')}</li>
                  <li><strong>tags</strong> - Semicolon-separated list (e.g., "Program;Federal")</li>
                  <li><strong>url</strong> - Valid URL to the resource</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Optional Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>eligibility</strong> - Eligibility requirements</li>
                  <li><strong>deadline</strong> - Application deadline</li>
                  <li><strong>featured</strong> - "true" or "false" (default: false)</li>
                </ul>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Tags must be from this list: {availableTags.join(', ')}.
                Use semicolons (;) to separate multiple tags in the CSV.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {parsedData.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Preview ({validCount} valid, {parsedData.length - validCount} with errors)
              </CardTitle>
              <Button
                onClick={handleImport}
                disabled={loading || hasErrors || validCount === 0}
              >
                {loading ? 'Importing...' : `Import ${validCount} Resources`}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((resource) => (
                      <TableRow key={resource.rowNumber}>
                        <TableCell>{resource.rowNumber}</TableCell>
                        <TableCell className="max-w-xs truncate" title={resource.title}>
                          {resource.title}
                        </TableCell>
                        <TableCell>{resource.category}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={resource.url}>
                          {resource.url}
                        </TableCell>
                        <TableCell>
                          {resource.featured ? <Badge>Featured</Badge> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {resource.errors.length > 0 ? (
                            <div className="text-red-600 text-sm">
                              {resource.errors.join('; ')}
                            </div>
                          ) : (
                            <span className="text-green-600">✓ Valid</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}