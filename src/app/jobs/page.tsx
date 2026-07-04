'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Briefcase, MapPin, IndianRupee, Upload, Users, Send, ChevronRight } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  dept: string;
  location: string;
  salary: string;
  desc: string;
  requirements: string[];
}

const mockJobs: Job[] = [
  {
    id: 'job_1',
    title: 'Luxury Hardware Designer',
    dept: 'Industrial Design',
    location: 'Metropolis (Hybrid)',
    salary: '₹1,40,000 - ₹1,80,000 / mo',
    desc: 'Shape the next generation of premium smartphones, custom carbon bumpers, and luxury 24K gold accessory lines.',
    requirements: [
      '5+ Years experience in consumer electronic design.',
      'Strong portfolio detailing precious metal molding and polymer structures.',
      'Familiarity with luxury material sourcing (titanium, 24K gold, diamond plating).',
    ],
  },
  {
    id: 'job_2',
    title: 'Lead 3D Web Artist',
    dept: 'Creative Tech',
    location: 'Remote',
    salary: '₹1,20,000 - ₹1,50,000 / mo',
    desc: 'Develop jaw-dropping interactive 3D WebGL scenes using Three.js and custom shader structures to showcase products on the web.',
    requirements: [
      'Expert knowledge of WebGL, Three.js, React Three Fiber, and GSAP.',
      'Ability to write optimized GLSL shaders for metallic surfaces and reflections.',
      'High attention to visual fidelity, lighting rigs, and rendering rates.',
    ],
  },
  {
    id: 'job_3',
    title: 'Custom Plating Technician',
    dept: 'Hardware Engineering',
    location: 'Technopolis (On-Site)',
    salary: '₹95,000 - ₹1,20,000 / mo',
    desc: 'Work inside our gold-plating cleanroom hubs to electroplate, polish, and verify the structural integrity of custom phone bumps.',
    requirements: [
      'Experience in industrial electroplating or jeweler-grade metal polishing.',
      'Extreme precision and attention to micron-level finish thicknesses.',
      'Knowledge of diamond-like carbon (DLC) protective topcoats.',
    ],
  },
];

export default function JobsPage() {
  const { showToast } = useUIStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Apply Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeLoaded) {
      showToast('Please upload a resume audit file.', 'warning');
      return;
    }
    showToast(`Application submitted for ${selectedJob?.title}!`, 'success');
    setName('');
    setEmail('');
    setCoverLetter('');
    setResumeLoaded(false);
    setSelectedJob(null);
  };

  const handleResumeUpload = () => {
    showToast('Simulating resume PDF upload...', 'info');
    setTimeout(() => {
      setResumeLoaded(true);
      showToast('Resume PDF parsed successfully.', 'success');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Join Our Team</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Careers</h1>
        <p className="text-sm text-zinc-500 mt-2">Craft the engineering & design behind the world's most luxurious mobile hardware.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left list of jobs */}
        <div className="lg:col-span-2 space-y-6">
          {mockJobs.map((job) => (
            <div
              key={job.id}
              className="ultra-glass rounded-2xl p-6 md:p-8 space-y-5 text-left border border-white/5 hover:border-primary-gold/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-black text-lg text-white tracking-wide uppercase">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-2.5">
                    <span className="flex items-center space-x-1.5">
                      <Briefcase size={11} className="text-primary-gold" />
                      <span>{job.dept}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <MapPin size={11} className="text-primary-gold" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <IndianRupee size={11} className="text-primary-gold" />
                      <span>{job.salary}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="btn-gold text-xs px-5 py-2.5 flex items-center gap-1 font-bold tracking-wider uppercase shrink-0"
                >
                  Apply <ChevronRight size={13} />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-medium">{job.desc}</p>

              <div className="space-y-2.5 pt-4 border-t border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-primary-gold tracking-widest">Key Qualifications</h4>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary-gold mt-1">✦</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Right application drawer */}
        <div className="lg:col-span-1">
          {selectedJob ? (
            <div className="ultra-glass rounded-2xl border border-primary-gold/20 p-6 space-y-6 text-left">
              <div>
                <span className="text-[9px] text-primary-gold uppercase font-mono font-bold tracking-widest">Application Form</span>
                <h3 className="font-display font-black text-sm text-white uppercase truncate mt-1">
                  {selectedJob.title}
                </h3>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Corporate Email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-450">Upload CV/Resume</label>
                  <div
                    onClick={handleResumeUpload}
                    className="border border-dashed border-white/10 hover:border-primary-gold/50 transition-colors rounded-xl p-5 flex flex-col items-center justify-center space-y-1.5 cursor-pointer bg-white/2"
                  >
                    <Upload size={16} className="text-zinc-500" />
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Click to upload (PDF format)</span>
                    {resumeLoaded && (
                      <span className="text-[10px] text-primary-gold font-bold uppercase tracking-wider">Resume Attached ✦</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-455">Cover Letter</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us about your portfolio or luxury engineering experience..."
                    className="w-full bg-white/3 border border-white/6 text-xs px-4 py-3 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold transition-colors"
                  />
                </div>

                <button type="submit" className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wider">
                  <Send size={12} />
                  <span>Submit Application</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="ultra-glass rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center space-y-4 h-64">
              <Users size={32} className="text-zinc-700 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Select a Position</p>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                  Click 'Apply' on any job posting to unlock the candidacy submission terminal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
