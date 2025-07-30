export default function Home() {
  const livingBooksByKuczynski = [
    { title: "ETHICS", url: "https://ethics101.xyz" },
    { title: "FREEDOM", url: "https://freedom101.xyz" },
    { title: "CAUSATION", url: "https://causality101.xyz" },
    { title: "EPISTEMOLOGY", url: "https://epistemology101.xyz" },
    { title: "EMPIRICISM AND ITS LIMITS", url: "https://empiricism101.xyz" },
    { title: "DICTIONARY OF ANALYTIC PHILOSOPHY", url: "https://philosophydictionary.xyz" },
    { title: "AI AND PHILOSOPHY", url: "https://aiandphilosophy.com" },
    { title: "SYMBOLIC LOGIC", url: "https://symboliclogic.xyz" },
    { title: "MATHEMATICAL LOGIC", url: "https://mathematicallogic.xyz" },
    { title: "AI LOGIC", url: "https://ailogic101.xyz" },
    { title: "CRITICAL REASONING", url: "https://criticalreasoning.xyz" },
    { title: "WRITING COURSE", url: "https://writing101.xyz" },
    { title: "ON THE CARDINALITY OF PROOF SPACES", url: "https://godel101.xyz" },
    { title: "SEMANTICS", url: "https://semantics101.xyz" },
    { title: "ANALYTIC PHILOSOPHY CHAPTER 1", url: "https://analysisofanalysis.xyz" },
    { title: "WHY WAS SOCRATES EXECUTED?", url: "https://socrates101.xyz" },
    { title: "ANALYTIC PHILOSOPHY CHAPTER 2", url: "https://platonism101.xyz" }
  ];

  const classicsBooks = [
    { title: "ART OF WAR", url: "https://theartofwarbysuntzu.xyz" },
    { title: "BOOK OF MORMON", url: "https://bookofmormon101.xyz" },
    { title: "KING JAMES BIBLE", url: "https://kingjamesbible.xyz" },
    { title: "OUR KNOWLEDGE OF THE EXTERNAL WORLD", url: "https://ourknowledgeoftheexternalworld.xyz" },
    { title: "DREAM PSYCHOLOGY", url: "https://dreampsychology.xyz" },
    { title: "ANARCHISM AND OTHER ESSAYS", url: "https://anarchismandotheressays.xyz" },
    { title: "FRANKENSTEIN", url: "https://frankenstein101.xyz" },
    { title: "DRACULA", url: "https://dracula101.xyz" },
    { title: "A ROOM WITH A VIEW", url: "https://aroomwithaview101.xyz" },
    { title: "SHAKESPEARE COMPLETE WORKS", url: "https://shakespeare101.xyz" },
    { title: "TOTEM AND TABOO", url: "https://totemandtaboo.xyz" },
    { title: "THE COMMUNIST MANIFESTO", url: "https://communistmanifesto.xyz" },
    { title: "INDUSTRIAL SOCIETY AND ITS FUTURE", url: "https://unabombermanifesto.xyz" },
    { title: "THE LAWS", url: "https://thelawsbyplato.xyz" },
    { title: "TRACTATUS LOGICO-PHILOSOPHICUS", url: "https://tractatuslogicophilosophicus.xyz" },
    { title: "DEATH OF IVAN ILYCH", url: "https://ivanilych.xyz" },
    { title: "PRINCIPLES OF PSYCHOLOGY", url: "https://herbertspencer.xyz" },
    { title: "SEVEN SECRETS OF A STRESS FREE LIFE", url: "https://sevensecrets.xyz" },
    { title: "CIVILIZATION AND ITS DISCONTENTS", url: "https://civilizationanditsdiscontents.xyz" }
  ];

  const coreApplications = [
    { title: "Living Book Creator", url: "https://livingbook.xyz/" },
    { title: "EZGrader", url: "https://ezgrader.xyz" },
    { title: "Originality Meter", url: "https://originalitymeter.com" },
    { title: "Intelligence Meter", url: "https://intelligencemeter.biz" },
    { title: "Book Builder", url: "https://bookbuilder.xyz" },
    { title: "Cognitive Profiler", url: "https://cognitiveprofiler.xyz" },
    { title: "Super Cognitive Profiler", url: "https://supercognitiveprofiler.xyz" },
    { title: "Psychological Profiler", url: "https://psychologicalprofiler.xyz" },
    { title: "EZ Reader", url: "https://ezreader.ai" },
    { title: "Reading Pro", url: "https://readingpro.xyz" },
    { title: "Homework Helper", url: "https://homeworkrobot.xyz" },
    { title: "Photo/Video Psychoanalysis", url: "https://videoprofiler.xyz" },
    { title: "Genius Dictation", url: "https://geniusdictation.com" }
  ];

  const BookItem = ({ title, url, note }: { title: string; url: string | null; note?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="font-medium text-gray-900 w-full sm:w-80">{title}</span>
      <span className="text-gray-500 hidden sm:inline">—</span>
      {url ? (
        <a 
          href={url} 
          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      ) : (
        <span className="text-gray-600 italic">{note}</span>
      )}
    </div>
  );

  return (
    <div className="font-sans bg-white text-gray-900 leading-relaxed min-h-screen">
      {/* Contact Us - Top Left */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a 
              href="mailto:contact@zhisystems.ai" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Us
            </a>
            <a
              href="/journal"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Zhi Systems Journal
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Zhi Systems
          </h1>
          <p className="text-xl text-gray-700">
            High-Performance AI Tools for Writers, Thinkers, and Analysts
          </p>
        </header>

        {/* Living Books Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Living Books
          </h2>
          
          {/* What's a Living Book explanation */}
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What's a Living Book?</h3>
            <p className="text-gray-700 mb-3">
              A Living Book is an interactive version of any text, powered by AI. Features include:
            </p>
            <ul className="text-gray-700 space-y-1 list-disc list-inside">
              <li>Ask AI anything about the text (math notation supported)</li>
              <li>Get AI to write about the text (with full math export support)</li>
              <li>Rewrite the text using custom instructions</li>
              <li>Generate tests based on the text</li>
              <li>Take AI-generated tests</li>
              <li>Create study guides</li>
              <li>Generate podcasts from selected passages</li>
              <li>Listen to AI narration</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              By Kuczynski / Zhi Systems
            </h3>
            
            <div className="grid gap-3">
              {livingBooksByKuczynski.map((book) => (
                <BookItem key={book.title} title={book.title} url={book.url} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Classics / Public Domain
            </h3>
            
            <div className="grid gap-3">
              {classicsBooks.map((book) => (
                <BookItem key={book.title} title={book.title} url={book.url} />
              ))}
            </div>
          </div>
        </section>

        {/* Core Applications Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
            Core Applications
          </h2>
          
          <div className="grid gap-3">
            {coreApplications.map((app) => (
              <BookItem key={app.title} title={app.title} url={app.url} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-gray-600 text-center">
            © Zhi Systems 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
return (
  <div>
    <h1>Zhi Systems</h1>
    <p>High-Performance AI Tools for Writers, Thinkers, and Analysts</p>
    <h2>Living Books</h2>
    <ul>
      {livingBooksByKuczynski.map((book, i) => (
        <li key={i}>
          <a href={book.url}>{book.title}</a>
        </li>
      ))}
    </ul>
  </div>
);

