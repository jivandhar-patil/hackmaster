import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Briefcase, 
  Download,
  Loader2,
  ChevronRight,
  Target,
  Trophy,
  Map,
  User,
  Zap,
  Lightbulb,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { extractResumeText } from './services/fileService';
import { analyzeSkillGap, AnalysisResult, generateCareerRoadmap, RoadmapResult } from './services/geminiService';
import { generatePDFReport } from './services/reportService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'resume' | 'roadmap';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  
  // Resume Analysis State
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Roadmap State
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [userGoals, setUserGoals] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [careerTips, setCareerTips] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch('/api/career-tips')
      .then(res => res.json())
      .then(data => setCareerTips(data))
      .catch(err => console.error('Failed to fetch career tips:', err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from file');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeSkillGap(resumeText, jobDescription);
      setAnalysisResult(analysis);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!targetRole.trim() || !currentSkills.trim()) {
      setError('Please provide both target role and current skills.');
      return;
    }

    setIsGeneratingRoadmap(true);
    setError(null);
    try {
      const roadmap = await generateCareerRoadmap(targetRole, currentSkills, experienceLevel, userGoals);
      setRoadmapResult(roadmap);
      setTimeout(() => {
        document.getElementById('roadmap-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const chartData = analysisResult ? [
    { name: 'Matched', value: analysisResult.existingSkills.length },
    { name: 'Gap', value: analysisResult.skillGap.length },
  ] : [];

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-slate-900 py-20 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_50%)]"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <BrainCircuit size={16} />
              AI-Powered Career Guidance
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Career <span className="gradient-text">Accelerator</span>
            </h1>
            
            {/* Tab Switcher */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={() => setActiveTab('resume')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2",
                  activeTab === 'resume' 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <FileText size={18} />
                Resume Analysis
              </button>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2",
                  activeTab === 'roadmap' 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <Map size={18} />
                Career Roadmap
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'resume' ? (
            <motion.div 
              key="resume-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Resume Input Section */}
              <div className="space-y-6">
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Your Resume</h2>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                      uploading ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept=".pdf,.docx,.txt,image/*"
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-slate-600 font-medium">Extracting text...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">Click to upload or drag and drop</p>
                          <p className="text-slate-500 text-sm">PDF, DOCX, Image or TXT</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Or paste resume text</label>
                    <textarea 
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Target size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Target Job Description</h2>
                  </div>

                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job requirements, responsibilities, and skills here..."
                    className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm"
                  />

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !resumeText || !jobDescription}
                    className="w-full mt-6 py-4 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analyzing Skills...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Analyze Skill Gap
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-3 text-sm"
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Resume Results Section */}
              <div id="results" className="space-y-8">
                <AnimatePresence mode="wait">
                  {!analysisResult && !isAnalyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 glass-card border-dashed"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                        <Briefcase size={40} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Analyze</h3>
                      <p className="text-slate-500 max-w-xs">
                        Upload your details on the left to see your personalized skill gap analysis and recommendations.
                      </p>
                    </motion.div>
                  )}

                  {isAnalyzing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 glass-card"
                    >
                      <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                          <BrainCircuit size={32} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">AI is Thinking...</h3>
                      <p className="text-slate-500 animate-pulse">Comparing your profile with the job requirements</p>
                    </motion.div>
                  )}

                  {analysisResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      {/* Score Dashboard */}
                      <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold">Analysis Dashboard</h2>
                          <button 
                            onClick={() => generatePDFReport(analysisResult)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <Download size={18} />
                            Report
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center">
                          <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-4xl font-bold text-slate-900">{analysisResult.matchScore}%</span>
                              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Match Score</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-emerald-700">Existing Skills</span>
                                <span className="text-lg font-bold text-emerald-700">{analysisResult.existingSkills.length}</span>
                              </div>
                              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${(analysisResult.existingSkills.length / analysisResult.jobSkills.length) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-rose-700">Skill Gap</span>
                                <span className="text-lg font-bold text-rose-700">{analysisResult.skillGap.length}</span>
                              </div>
                              <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-rose-500" 
                                  style={{ width: `${(analysisResult.skillGap.length / analysisResult.jobSkills.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills Lists */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 size={20} />
                            Matched Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.existingSkills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="glass-card p-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600">
                            <AlertCircle size={20} />
                            Missing Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.skillGap.map((skill, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Course Recommendations */}
                      <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <BookOpen className="text-indigo-600" size={24} />
                          Recommended Learning
                        </h3>
                        <div className="space-y-4">
                          {analysisResult.courseRecommendations.map((course, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Trophy size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-slate-900">{course.title}</h4>
                                  <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                                    {course.platform}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Loader2 size={14} className="animate-spin-slow" />
                                    {course.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target size={14} />
                                    Skill: {course.skill}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="text-slate-300 group-hover:text-indigo-400" size={20} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="roadmap-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Roadmap Input Section */}
              <div className="space-y-6">
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <Map size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Roadmap Planner</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Briefcase size={16} />
                        Target Role
                      </label>
                      <input 
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Developer, Data Scientist"
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Zap size={16} />
                        Current Skills
                      </label>
                      <textarea 
                        value={currentSkills}
                        onChange={(e) => setCurrentSkills(e.target.value)}
                        placeholder="List your current skills (e.g. HTML, CSS, Basic JS, Python)"
                        className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <User size={16} />
                        Experience Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setExperienceLevel(level)}
                            className={cn(
                              "py-2 rounded-lg text-sm font-medium border transition-all",
                              experienceLevel === level 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Lightbulb size={16} />
                        Goals & Preferences (Optional)
                      </label>
                      <textarea 
                        value={userGoals}
                        onChange={(e) => setUserGoals(e.target.value)}
                        placeholder="e.g. Want to work in Fintech, prefer remote roles, interested in AI"
                        className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleGenerateRoadmap}
                      disabled={isGeneratingRoadmap || !targetRole || !currentSkills}
                      className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
                    >
                      {isGeneratingRoadmap ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <Map size={20} />
                          Generate Roadmap
                        </>
                      )}
                    </button>
                    
                    {error && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roadmap Results Section */}
              <div id="roadmap-results" className="space-y-8">
                <AnimatePresence mode="wait">
                  {!roadmapResult && !isGeneratingRoadmap && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 glass-card border-dashed"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                        <Map size={40} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Plan Your Career</h3>
                      <p className="text-slate-500 max-w-xs">
                        Enter your target role and current skills to get a step-by-step learning roadmap.
                      </p>
                    </motion.div>
                  )}

                  {isGeneratingRoadmap && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12 glass-card"
                    >
                      <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                          <Map size={32} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">Mapping Your Path...</h3>
                      <p className="text-slate-500 animate-pulse">Analyzing industry standards for {targetRole}</p>
                    </motion.div>
                  )}

                  {roadmapResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      {/* Role Header */}
                      <div className="glass-card p-8 bg-indigo-600 text-white">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Briefcase size={32} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold">{roadmapResult.targetRole}</h2>
                            <p className="text-indigo-100">Career Roadmap & Skill Analysis</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-6">
                          {roadmapResult.currentSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skill Gaps */}
                      <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Layers className="text-indigo-600" size={24} />
                          Skill Gaps Identified
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3">Critical Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {roadmapResult.gaps.critical.map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium border border-rose-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3">Important Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {roadmapResult.gaps.important.map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Optional / Advanced</h4>
                            <div className="flex flex-wrap gap-2">
                              {roadmapResult.gaps.optional.map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Learning Roadmap Steps */}
                      <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                          <Map className="text-indigo-600" size={24} />
                          Learning Roadmap
                        </h3>
                        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-indigo-100">
                          {roadmapResult.roadmap.map((item, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                {i + 1}
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-1">{item.step}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resources & Advice */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="text-indigo-600" size={20} />
                            Recommended Resources
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Courses</p>
                              <ul className="space-y-1">
                                {roadmapResult.resources.courses.map((c, i) => (
                                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Projects to Build</p>
                              <ul className="space-y-1">
                                {roadmapResult.resources.projects.map((p, i) => (
                                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card p-6 bg-indigo-50 border-indigo-100">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900">
                            <Zap className="text-indigo-600" size={20} />
                            Actionable Advice
                          </h3>
                          <p className="text-indigo-800 text-sm leading-relaxed italic">
                            "{roadmapResult.advice}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Career Tips Section (Backend Data) */}
        {careerTips.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Lightbulb size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Expert Career Tips</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerTips.map((tip, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 border-emerald-100/50 hover:border-emerald-200 transition-all"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2026 Career Accelerator. Powered by Google Gemini AI.</p>
      </footer>
    </div>
  );
}

