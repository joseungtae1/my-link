import React from "react";

export default function Home() {
  const links = [
    { name: "GitHub", url: "https://github.com/joseungtae1", icon: <GithubIcon />, bgColor: "bg-blue-400" },
    { name: "Blog", url: "#", icon: <BlogIcon />, bgColor: "bg-pink-400" },
    { name: "Resume", url: "#", icon: <ResumeIcon />, bgColor: "bg-yellow-400" },
    { name: "Contact", url: "mailto:joseungtae1@example.com", icon: <MailIcon />, bgColor: "bg-green-400" },
  ];

  const projects = [
    { title: "Vibe Coding Platform", description: "A platform for learning how to vibe code.", link: "#", color: "bg-purple-400" },
    { title: "Awesome UI Kit", description: "Beautiful UI components built with React and Tailwind.", link: "#", color: "bg-red-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 lg:p-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Navigation / Header Area */}
      <nav className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8 md:mb-16">
        <div className="neo-border bg-white px-4 py-2 font-black text-xl md:text-3xl uppercase tracking-tighter neo-shadow text-black">
          ST.
        </div>
        <a 
          href="mailto:joseungtae1@example.com" 
          className="neo-border bg-yellow-400 text-black px-6 py-3 font-black text-sm md:text-lg uppercase transition-all duration-200 neo-shadow neo-shadow-hover"
        >
          Let's Talk
        </a>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-10 items-stretch">
        
        {/* Hero Section - Spans full width on mobile, 7 cols on tablet/desktop */}
        <section className="md:col-span-12 lg:col-span-7 flex flex-col justify-center gap-6">
          <div className="neo-border bg-purple-300 p-8 md:p-12 neo-shadow h-full flex flex-col justify-center text-black">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-6">
              Hi, I'm <br /> 
              <span className="text-white custom-text-shadow">Jo</span><br />
              <span className="text-white custom-text-shadow">Seungtae.</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold max-w-xl text-black leading-tight border-l-8 border-black pl-4">
              Student developer learning vibe coding. <br />
              I love creating bold, beautiful, and interactive UIs. 🚀
            </p>
          </div>
        </section>

        {/* Links Column - 5 cols */}
        <section className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="neo-border bg-white p-6 md:p-8 neo-shadow flex-1 flex flex-col text-black">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-6 flex items-center gap-2">
              <span className="bg-black text-white px-2 py-1">Connect</span>
              With Me
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`neo-border ${link.bgColor} p-4 flex items-center gap-4 transition-all duration-200 neo-shadow neo-shadow-hover group text-black`}
                >
                  <div className="w-12 h-12 bg-white neo-border flex items-center justify-center group-hover:-rotate-12 transition-transform duration-300">
                    {link.icon}
                  </div>
                  <span className="font-bold text-xl uppercase tracking-wide">
                    {link.name}
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    <ArrowUpRightIcon />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Projects / Highlights - Spans full width */}
        <section className="md:col-span-12 neo-border bg-white p-6 md:p-10 neo-shadow">
          <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4 text-black">
            <h2 className="text-3xl md:text-5xl font-black uppercase">
              Recent Work
            </h2>
            <span className="hidden md:inline-block font-bold text-xl bg-black text-white px-3 py-1 neo-border border-black">
              (2) Projects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-black">
            {projects.map((project, idx) => (
              <a 
                key={idx}
                href={project.link}
                className={`neo-border ${project.color} p-6 md:p-8 flex flex-col gap-4 neo-shadow neo-shadow-hover transition-all duration-200`}
              >
                <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight line-clamp-2">
                  {project.title}
                </h3>
                <p className="font-bold text-lg md:text-xl leading-snug">
                  {project.description}
                </p>
                <div className="mt-8 pt-4 flex justify-between items-center border-t-4 border-black/20">
                  <span className="font-black underline uppercase text-xl">View Project</span>
                  <ArrowUpRightIcon />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer / Marquee concept */}
        <section className="md:col-span-12 overflow-hidden neo-border bg-green-400 py-6 neo-shadow relative flex items-center">
           <div className="whitespace-nowrap flex animate-marquee text-black">
              {/* Using a duplicate content block for continuous sliding effect */}
              {Array.from({length: 2}).map((_, arrIdx) => (
                <div key={arrIdx} className="flex">
                  <span className="text-2xl md:text-4xl font-black uppercase mx-6">Keep it simple, keep it vibe</span>
                  <span className="text-2xl md:text-4xl font-black mx-6">★</span>
                  <span className="text-2xl md:text-4xl font-black uppercase mx-6">Interactive Design</span>
                  <span className="text-2xl md:text-4xl font-black mx-6">★</span>
                  <span className="text-2xl md:text-4xl font-black uppercase mx-6">Neobrutalism UI</span>
                  <span className="text-2xl md:text-4xl font-black mx-6">★</span>
                </div>
              ))}
           </div>
        </section>

      </main>
    </div>
  );
}

// Icons
function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5 0-1.4-.5-2.5-1.5-3.4.1-.3.4-1.6-.1-3.5 0 0-1-.3-3.3 1.2a11.5 11.5 0 0 0-6 0C5.3 2.7 4.3 3 4.3 3c-.5 1.9-.2 3.2-.1 3.5-.1.9-.5 2-1.5 3.4 0 5 3 6.2 6 6.5-.1.5-.4 1.2-.5 2-.4.2-1.5.5-2.5-.2-.8-.6-1.2-2-1.2-2-.6 0-1.1.2-1.1.2.3.4.7 .9 1.1 1.2.5.5 1.5.8 1.5.8.7.2 1.6.2 2.3.1.2 1 .4 2.1.5 3"></path></svg>
  );
}

function BlogIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  );
}

function ResumeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
  );
}
