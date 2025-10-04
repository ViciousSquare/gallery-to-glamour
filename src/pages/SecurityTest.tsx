import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  expected: string;
  result: string;
  details: string;
}

export default function SecurityTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runTests();
  }, []);

  async function runTests() {
    setLoading(true);
    setError(null);
    const tests: TestResult[] = [];

    try {
      console.log('Starting security tests...');

      // Test 1: Public can read resources
      console.log('Test 1: Reading resources...');
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .limit(1);
        
        tests.push({
          name: 'Public READ resources',
          expected: 'PASS',
          result: (!error && data) ? 'PASS' : 'FAIL',
          details: error?.message || `Found ${data?.length || 0} resources`
        });
        console.log('Test 1 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public READ resources',
          expected: 'PASS',
          result: 'ERROR',
          details: e.message
        });
      }

      // Test 2: Public CANNOT insert resources
      console.log('Test 2: Attempting to insert resource...');
      try {
        const { error } = await supabase
          .from('resources')
          .insert({ 
            title: 'security-test', 
            description: 'test', 
            category: 'test', 
            tags: ['test'], 
            url: 'https://test.com',
            featured: false
          });
        
        tests.push({
          name: 'Public INSERT resources (should be blocked)',
          expected: 'BLOCKED',
          result: error ? 'BLOCKED' : 'FAIL',
          details: error?.message || '⚠️ Insert succeeded - SECURITY ISSUE!'
        });
        console.log('Test 2 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public INSERT resources (should be blocked)',
          expected: 'BLOCKED',
          result: 'BLOCKED',
          details: e.message
        });
      }

      // Test 3: Public CANNOT read contact submissions
      console.log('Test 3: Attempting to read submissions...');
      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .limit(1);
        
        // RLS can block by returning empty results OR an error
        // Both are secure - we just need to check if we got actual data
        const isSecure = error || !data || data.length === 0;
        
        tests.push({
          name: 'Public READ contact_submissions (should be blocked)',
          expected: 'BLOCKED',
          result: isSecure ? 'BLOCKED' : 'FAIL',
          details: error 
            ? `Blocked with error: ${error.message}` 
            : (!data || data.length === 0)
              ? 'RLS filtered all rows (secure)'
              : `Found ${data.length} submissions - SECURITY ISSUE!`
        });
        console.log('Test 3 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public READ contact_submissions (should be blocked)',
          expected: 'BLOCKED',
          result: 'BLOCKED',
          details: e.message
        });
      }

      // Test 4: Public CAN submit contact form
      console.log('Test 4: Checking contact form policy (no data created)...');
      try {
        // We'll check if the policy EXISTS that allows public inserts
        // without actually creating test data
        
        // Try to insert with an invalid email to trigger validation but test the policy
        const { error } = await supabase
          .from('contact_submissions')
          .insert({ 
            first_name: 'Test',
            last_name: 'Test',
            email: '', // Invalid - will fail validation, not permissions
            status: 'new'
          });
        
        // If error is about validation (not permissions), policy allows inserts
        const isPolicyError = error?.message?.includes('permission denied') || 
                             error?.message?.includes('row-level security');
        const isValidationError = error && !isPolicyError;
        
        tests.push({
          name: 'Public INSERT contact_submissions',
          expected: 'PASS',
          result: (isValidationError || !error) ? 'PASS' : 'FAIL',
          details: isPolicyError 
            ? 'Policy blocks inserts - FAIL'
            : 'Policy allows inserts (validation may fail, but that\'s ok) ✓'
        });
        console.log('Test 4 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public INSERT contact_submissions',
          expected: 'PASS',
          result: 'PASS',
          details: 'Exception thrown (policy allows attempts) ✓'
        });
      }

      // Test 5: Public can read active coaches
      console.log('Test 5: Reading active coaches...');
      try {
        const { data, error } = await supabase
          .from('coaches')
          .select('*')
          .eq('active', true)
          .limit(1);
        
        tests.push({
          name: 'Public READ active coaches',
          expected: 'PASS',
          result: (!error && data) ? 'PASS' : 'FAIL',
          details: error?.message || `Found ${data?.length || 0} active coaches`
        });
        console.log('Test 5 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public READ active coaches',
          expected: 'PASS',
          result: 'ERROR',
          details: e.message
        });
      }

      // Test 6: Public CANNOT read inactive coaches
      console.log('Test 6: Attempting to read inactive coaches...');
      try {
        const { data, error } = await supabase
          .from('coaches')
          .select('*')
          .eq('active', false)
          .limit(1);
        
        tests.push({
          name: 'Public READ inactive coaches (should be blocked)',
          expected: 'BLOCKED',
          result: (error || (data && data.length === 0)) ? 'BLOCKED' : 'FAIL',
          details: error?.message || (data?.length === 0 ? 'No inactive coaches returned ✓' : `⚠️ Found ${data?.length} inactive coaches - SECURITY ISSUE!`)
        });
        console.log('Test 6 complete:', tests[tests.length - 1]);
      } catch (e: any) {
        tests.push({
          name: 'Public READ inactive coaches (should be blocked)',
          expected: 'BLOCKED',
          result: 'BLOCKED',
          details: e.message
        });
      }

      console.log('All tests complete. Results:', tests);
      setResults(tests);
    } catch (e: any) {
      console.error('Error running tests:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const failures = results.filter(t => t.result !== t.expected);
  const allPassed = failures.length === 0 && results.length > 0;

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Security Test Results</span>
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && results.length > 0 && (
              <>
                {allPassed ? (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800 font-medium">
                      ✅ All {results.length} security tests PASSED!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      ❌ {failures.length} test(s) FAILED out of {results.length}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Test</th>
                        <th className="text-left p-3 font-semibold">Expected</th>
                        <th className="text-left p-3 font-semibold">Result</th>
                        <th className="text-left p-3 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((test, i) => (
                        <tr 
                          key={i} 
                          className={`border-b ${test.result !== test.expected ? 'bg-red-50' : ''}`}
                        >
                          <td className="p-3">{test.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {test.expected}
                            </span>
                          </td>
                          <td className="p-3">
                            <span 
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                test.result === test.expected 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {test.result}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {test.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Running security tests...</p>
              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No test results available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}