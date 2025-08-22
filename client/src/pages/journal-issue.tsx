import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { formatJournalHeader, parseMarkdown } from "@/lib/journal-utils";
import type { JournalIssue } from "@shared/schema";
import InteractiveJournal from "@/components/InteractiveJournal";

export default function JournalIssuePage() {
  const params = useParams();
  // Extract Roman numeral from vol-i format and convert to number
  const volumeParam = params.volume?.replace('vol-', '');
  const issueParam = params.issue?.replace('no-', '');
  
  // Convert Roman to number (simple conversion for common cases)
  const romanToNumber = (roman: string): number => {
    const romanNumerals: { [key: string]: number } = {
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
    };
    return romanNumerals[roman.toLowerCase()] || parseInt(roman) || 0;
  };
  
  const volume = volumeParam ? romanToNumber(volumeParam) : null;
  const issue = issueParam ? parseInt(issueParam) : null;

  const { data: journalIssue, isLoading, error } = useQuery<JournalIssue>({
    queryKey: ["/api/journal", volume, issue],
    queryFn: async () => {
      const response = await fetch(`/api/journal/${volume}/${issue}`);
      if (!response.ok) {
        throw new Error("Failed to fetch journal issue");
      }
      return response.json();
    },
    enabled: volume !== null && issue !== null,
  });

  if (volume === null || issue === null) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Invalid journal issue URL</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading journal issue...</div>
        </div>
      </div>
    );
  }

  if (error || !journalIssue) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/journal" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Journal
          </Link>
          <div className="text-center text-red-600">Journal issue not found</div>
        </div>
      </div>
    );
  }

  // Format the publication date
  const publishedDate = new Date(journalIssue.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedHeader = formatJournalHeader(
    journalIssue.volume,
    journalIssue.issue,
    journalIssue.year,
    publishedDate
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Zhi Systems
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/journal" className="text-blue-600 hover:text-blue-800">
              Journal
            </Link>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <pre className="font-serif text-lg leading-relaxed text-gray-900 whitespace-pre-line">
            {formattedHeader}
          </pre>
        </header>

        {/* Interactive Article Body */}
        <div className="prose prose-lg max-w-none">
          <InteractiveJournal 
            content={journalIssue.body}
            issueId={journalIssue.id}
            title={journalIssue.title}
          />
        </div>

        {/* Individual AI Function Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Functions for Full Article</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
              onClick={() => {
                // Trigger rewrite for entire article
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'rewrite' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-blue-700 text-center">Create Full Rewrite</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'study-guide' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-green-700 text-center">Create Full Study Guide</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'test-me' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-700 text-center">Create Full Test Me</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'podcast' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-medium text-orange-700 text-center">Create Full Podcast</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
              onClick={() => {
                console.log('Cognitive Map button clicked - dispatching event');
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'cognitive-map' } 
                });
                console.log('Event created:', event);
                window.dispatchEvent(event);
                console.log('Event dispatched');
              }}
            >
              <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium text-purple-700 text-center">Create Full Cognitive Map</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'summary-thesis' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-indigo-700 text-center">Create Full Summary + Thesis</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'thesis-deep-dive' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium text-yellow-700 text-center">Create Full Thesis Deep Dive</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
              onClick={() => {
                const event = new CustomEvent('triggerFullArticleAI', { 
                  detail: { action: 'suggested-readings' } 
                });
                window.dispatchEvent(event);
              }}
            >
              <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-teal-700 text-center">Create Full Suggested Readings</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {journalIssue.tags && journalIssue.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {journalIssue.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link 
            href="/journal"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Journal
          </Link>
        </div>
      </article>
    </div>
  );
}