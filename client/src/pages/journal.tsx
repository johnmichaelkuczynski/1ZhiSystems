import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { toRomanNumeral, formatJournalUrl } from "@/lib/journal-utils";
import type { JournalIssue } from "@shared/schema";

export default function JournalPage() {
  const { data: issues, isLoading, error } = useQuery<JournalIssue[]>({
    queryKey: ["/api/journal"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading journal issues...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error loading journal issues</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Zhi Systems
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Zhi Systems Journal
          </h1>
          <p className="text-xl text-gray-700">
            Insights and analysis from the Zhi Systems team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!issues || issues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No journal issues published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              All Issues
            </h2>
            
            <div className="space-y-6">
              {issues.map((issue) => (
                <article 
                  key={issue.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Vol. {toRomanNumeral(issue.volume)}, No. {issue.issue} ({issue.year})
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">
                    {issue.title}
                  </h3>
                  
                  <div className="text-gray-600 mb-4 line-clamp-3">
                    {issue.body.replace(/^# .*$/gm, '').substring(0, 200)}...
                  </div>
                  
                  <Link 
                    href={formatJournalUrl(issue.volume, issue.issue)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read full issue →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
        
        {/* Admin Link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link 
            href="/journal/admin"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}