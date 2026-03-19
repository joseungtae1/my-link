import React from "react";

export default function Home() {
  const links = [
    { name: "GitHub", url: "https://github.com/joseungtae1", icon: <GithubIcon /> },
    { name: "Blog", url: "#", icon: <BlogIcon /> },
    { name: "Resume", url: "#", icon: <ResumeIcon /> },
    { name: "Contact", url: "mailto:joseungtae1@example.com", icon: <MailIcon /> },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950 font-sans selection:bg-purple-500/30 overflow-hidden relative">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob dark:bg-purple-900/40 dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 dark:bg-pink-900/40 dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 dark:bg-indigo-900/40 dark:mix-blend-screen pointer-events-none"></div>

      <main className="relative z-10 max-w-md w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/50 dark:border-zinc-700/50 shadow-2xl rounded-3xl p-8 space-y-8">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-5 pt-2">
          {/* Avatar */}
          <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                ST
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              조승태
            </h1>
            <p className="text-sm font-semibold tracking-wide text-purple-600 dark:text-purple-400 uppercase">
              Student & Developer
            </p>
          </div>
          
          <p className="text-center text-[15px] text-zinc-600 dark:text-zinc-300 max-w-xs leading-relaxed">
            안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다. 새로운 기술과 예쁜 UI를 좋아해요. 🚀
          </p>
        </div>
        
        {/* Links Section */}
        <div className="space-y-3 w-full">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center w-full p-4 UI-link rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-white/60 dark:border-zinc-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></div>
              
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:border-purple-200 dark:group-hover:border-purple-900/50 transition-colors z-10">
                {link.icon}
              </div>
              <div className="ml-4 font-semibold text-zinc-800 dark:text-zinc-100 z-10">
                {link.name}
              </div>
              <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-500 transition-colors z-10">
                <ChevronRightIcon />
              </div>
            </a>
          ))}
        </div>

        {/* Quote / Footer */}
        <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-700/60 text-center">
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide font-mono">
            &quot;Keep it simple, keep it vibe.&quot;
          </p>
        </div>
      </main>
    </div>
  );
}

// Icons
function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5 0-1.4-.5-2.5-1.5-3.4.1-.3.4-1.6-.1-3.5 0 0-1-.3-3.3 1.2a11.5 11.5 0 0 0-6 0C5.3 2.7 4.3 3 4.3 3c-.5 1.9-.2 3.2-.1 3.5-.1.9-.5 2-1.5 3.4 0 5 3 6.2 6 6.5-.1.5-.4 1.2-.5 2-.4.2-1.5.5-2.5-.2-.8-.6-1.2-2-1.2-2-.6 0-1.1.2-1.1.2.3.4.7 .9 1.1 1.2.5.5 1.5.8 1.5.8.7.2 1.6.2 2.3.1.2 1 .4 2.1.5 3"></path></svg>
  );
}

function BlogIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  );
}

function ResumeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
