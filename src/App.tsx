import React, { useState, useEffect } from 'react';
import { 
  Plus, ClipboardList, PenTool, CheckCircle, X, 
  HelpCircle, UserCheck, BookOpen, Clock, School, 
  UserPlus, User, AlertCircle, Sparkles, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exam, StudentSubmission, Teacher } from './types';
import { DEFAULT_EXAMS, DEFAULT_TEACHERS, DEFAULT_SUBMISSIONS } from './data/defaultExams';

import TeacherDashboard from './components/TeacherDashboard';
import StudentExamRoom from './components/StudentExamRoom';

const LOCAL_STORAGE_EXAMS_KEY = 'online_exams_data_v1';
const LOCAL_STORAGE_TEACHERS_KEY = 'online_exams_teachers_v1';
const LOCAL_STORAGE_SUBMISSIONS_KEY = 'online_exams_submissions_v1';

export default function App() {
  // Database States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Navigation States
  const [activeRole, setActiveRole] = useState<'landing' | 'teacher_form' | 'student_form' | 'teacher_dashboard' | 'student_exam'>('landing');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  
  // Student Input state
  const [studentExamCode, setStudentExamCode] = useState('');
  const [activeStudentExam, setActiveStudentExam] = useState<Exam | null>(null);

  // Teacher Form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState(''); // Pin-code simulation
  
  // App initial loading & Syncing
  useEffect(() => {
    // 1. Teachers
    const savedTeachers = localStorage.getItem(LOCAL_STORAGE_TEACHERS_KEY);
    if (savedTeachers) {
      try {
        setTeachers(JSON.parse(savedTeachers));
      } catch (e) {
        setTeachers(DEFAULT_TEACHERS);
      }
    } else {
      setTeachers(DEFAULT_TEACHERS);
      localStorage.setItem(LOCAL_STORAGE_TEACHERS_KEY, JSON.stringify(DEFAULT_TEACHERS));
    }

    // 2. Exams
    const savedExams = localStorage.getItem(LOCAL_STORAGE_EXAMS_KEY);
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (e) {
        setExams(DEFAULT_EXAMS);
      }
    } else {
      setExams(DEFAULT_EXAMS);
      localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(DEFAULT_EXAMS));
    }

    // 3. Submissions
    const savedSubmissions = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (e) {
        setSubmissions(DEFAULT_SUBMISSIONS);
      }
    } else {
      setSubmissions(DEFAULT_SUBMISSIONS);
      localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(DEFAULT_SUBMISSIONS));
    }
  }, []);

  // URL Query Parameters Link Detection
  useEffect(() => {
    if (exams.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('examCode');
      if (code) {
        const matchedExam = exams.find(e => e.id === code);
        if (matchedExam) {
          setActiveStudentExam(matchedExam);
          setActiveRole('student_exam');
          // Clear query param to avoid reload loops
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [exams]);

  // Sync helpers
  const saveExamsToStorage = (updatedExams: Exam[]) => {
    setExams(updatedExams);
    localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(updatedExams));
  };

  const saveSubmissionsToStorage = (updatedSubs: StudentSubmission[]) => {
    setSubmissions(updatedSubs);
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updatedSubs));
  };

  const saveTeachersToStorage = (updatedTeachers: Teacher[]) => {
    setTeachers(updatedTeachers);
    localStorage.setItem(LOCAL_STORAGE_TEACHERS_KEY, JSON.stringify(updatedTeachers));
  };


  // Teacher Auth Actions
  const handleTeacherSubmitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherUsername.trim()) {
      alert('لطفاً نام کاربری را وارد کنید');
      return;
    }

    if (isRegistering) {
      // REGISTER
      if (!teacherFullName.trim()) {
        alert('لطفاً نام و نام خانوادگی خود را بنویسید');
        return;
      }
      
      const exists = teachers.some(t => t.username.toLowerCase() === teacherUsername.trim().toLowerCase());
      if (exists) {
        alert('این نام کاربری از قبل وجود دارد. لطفا نام کاربری دیگری انتخاب کنید.');
        return;
      }

      const newTeacher: Teacher = {
        id: `t-custom-${Date.now()}`,
        username: teacherUsername.trim().toLowerCase(),
        fullName: teacherFullName.trim()
      };

      const updated = [...teachers, newTeacher];
      saveTeachersToStorage(updated);
      setCurrentTeacher(newTeacher);
      setActiveRole('teacher_dashboard');
      
      // Reset forms
      setTeacherUsername('');
      setTeacherFullName('');
      setTeacherPassword('');
    } else {
      // LOGIN
      const matched = teachers.find(t => t.username.toLowerCase() === teacherUsername.trim().toLowerCase());
      if (matched) {
        setCurrentTeacher(matched);
        setActiveRole('teacher_dashboard');
        
        // Reset forms
        setTeacherUsername('');
        setTeacherFullName('');
        setTeacherPassword('');
      } else {
        alert('نام کاربری یافت نشد! لطفاً ابتدا ثبت‌نام کنید.');
      }
    }
  };


  // Student Access Code Action
  const handleStudentAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentExamCode.trim()) {
      alert('لطفاً کد آزمون را وارد کنید');
      return;
    }

    const matched = exams.find(e => e.id.trim() === studentExamCode.trim());
    if (matched) {
      if (!matched.active) {
        alert('این آزمون توسط دبیر غیرفعال شده است');
        return;
      }
      setActiveStudentExam(matched);
      setActiveRole('student_exam');
    } else {
      alert('کد آزمون نامعتبر است! لطفاً مجدداً از معلم خود سوال کنید.');
    }
  };


  // Create Exam Trigger (called from Teacher Dashboard)
  const handleCreateExam = (newExamData: Omit<Exam, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => {
    if (!currentTeacher) return;

    // generate simple 6-digit access code for the quiz
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newExam: Exam = {
      ...newExamData,
      id: generatedCode,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullName,
      createdAt: new Date().toISOString()
    };

    const updated = [newExam, ...exams];
    saveExamsToStorage(updated);
  };

  // Delete Exam Trigger
  const handleDeleteExam = (examId: string) => {
    const updated = exams.filter(e => e.id !== examId);
    saveExamsToStorage(updated);
    
    // clean submissions for that exam too
    const filteredSubs = submissions.filter(s => s.examId !== examId);
    saveSubmissionsToStorage(filteredSubs);
  };


  // Student Submit Exam Trigger (called from StudentExamRoom)
  const handleStudentSubmitExam = (newSubmissionData: Omit<StudentSubmission, 'id' | 'submittedAt'>) => {
    const newSubmission: StudentSubmission = {
      ...newSubmissionData,
      id: `sub-custom-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };

    const updated = [newSubmission, ...submissions];
    saveSubmissionsToStorage(updated);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F0F7FF] text-slate-800 pb-16 pt-3 px-3 sm:px-6 relative overflow-hidden select-none">
      
      {/* Decorative Background Bubbles */}
      <div className="absolute top-12 left-5 w-24 h-10 bg-white/70 rounded-full blur-[1px] opacity-40 z-0 animate-pulse"></div>
      <div className="absolute top-36 right-10 w-32 h-12 bg-white/70 rounded-full blur-[1px] opacity-40 z-0"></div>
      <div className="absolute bottom-16 left-12 w-28 h-10 bg-white/70 rounded-full blur-[1px] opacity-40 z-0 animate-pulse"></div>

      {/* Main Layout Wrap */}
      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Core Elegant Banner Header */}
        <header className="bg-white comic-border rounded-3xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-405 text-slate-900 rounded-2xl flex items-center justify-center text-3xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform bg-yellow-300">
              ⚡
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>سامانه آزمون هوشمند دانا لند</span>
                <span className="text-[10px] font-black text-emerald-850 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-250">نسخه دبیرستان+دبستان</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-extrabold">طراحی آزمون آنلاین تستی، تشریحی، جاخالی و کوتاه پاسخ کلاسی</p>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-400">
            امروز: {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Content routing view areas */}
        <div className="transition-all duration-300">
          
          {/* ==================== STATE 1: LANDING OVERVIEW ==================== */}
          {activeRole === 'landing' && (
            <div className="space-y-6">
              
              {/* Introduction Banner card */}
              <div className="bg-amber-100 comic-border p-5 rounded-3xl text-right flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="text-3xl animate-bounce">🎓✨</div>
                  <div>
                    <h3 className="font-black text-amber-950 text-sm">برگزاری سریع و بدون دردسر ارزشیابی‌های درسی!</h3>
                    <p className="text-[11px] text-amber-900 font-bold mt-1">
                      دبیران محترم می‌توانند به راحتی در چند ثانیه بدون نیاز به فرایندهای پیچیده و ایمیل، ثبت‌نام کنند و آزمون‌های کلاسی پیشرفته طراحی نمایند. دانش‌آموزان نیز با کد اختصاصی یک‌راست سر جلسه آزمون حاظر می‌شوند.
                    </p>
                  </div>
                </div>
              </div>

              {/* Entrance Gates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* GATE 1: TEACHER GATEBOARD */}
                <div 
                  className="bg-white rounded-3xl comic-border p-6 text-center flex flex-col justify-between h-[340px] hover:scale-[1.01] transition-transform"
                  id="teacher-entrance-card"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-105 rounded-full flex items-center justify-center text-4xl mx-auto border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-blue-300">
                      👨‍🏫
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-800">ورود و عضویت معلّمان</h3>
                      <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                        طراحی کوئیزها، مدیریت کلید سوالات، اشتراک‌گذاری لینک منحصربه‌فرد، بررسی زنده پاسخ‌ها و ثبت نمره کیفی سوالات تشریحی دانش‌آموزان
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveRole('teacher_form'); setIsRegistering(false); }}
                    className="w-full py-3.5 bg-blue-400 text-blue-950 font-black text-sm rounded-2xl cursor-pointer pill-btn"
                  >
                    من معلم هستم (ورود / ثبت‌نام) 💼
                  </button>
                </div>

                {/* GATE 2: STUDENT GATEBOARD */}
                <div 
                  className="bg-white rounded-3xl comic-border p-6 text-center flex flex-col justify-between h-[340px] hover:scale-[1.01] transition-transform"
                  id="student-entrance-card"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-pink-105 rounded-full flex items-center justify-center text-4xl mx-auto border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-pink-300">
                      🎒
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-800">ورود سریع دانش‌آموزان</h3>
                      <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                        بدون نیاز به ایجاد حساب کاربری! فقط کافی است کد آزمونی که دبیر گرامی برای شما فرستاده است را تعریف کنید تا بلافاصله وارد اتاق پاسخ‌دهی شوید.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveRole('student_form')}
                    className="w-full py-3.5 bg-pink-400 text-pink-950 font-black text-sm rounded-2xl cursor-pointer pill-btn"
                  >
                    من دانش‌آموز هستم (ورود به جلسه امتحان) ✍️
                  </button>
                </div>

              </div>

            </div>
          )}


          {/* ==================== STATE 2: TEACHER AUTHENTICATION FORM ==================== */}
          {activeRole === 'teacher_form' && (
            <div className="max-w-md mx-auto bg-white rounded-3xl comic-border p-6 space-y-6 text-right animate-fade-in" id="teacher-auth-form">
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-indigo-950">
                  {isRegistering ? 'ثبت‌نام و عضویت سریع دبیران' : 'ورود به پنل کاربری معلم'}
                </h3>
                <button
                  onClick={() => setActiveRole('landing')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  بازگشت ↩
                </button>
              </div>

              {/* Toggle switch between login / register */}
              <div className="grid grid-cols-2 gap-1 bg-slate-50 rounded-xl p-1 border-2 border-black font-sans">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`py-2 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                    !isRegistering ? 'bg-indigo-400 text-indigo-950' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  حساب دارم (ورود)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`py-2 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                    isRegistering ? 'bg-indigo-400 text-indigo-950' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  حساب ندارم (ثبت‌نام)
                </button>
              </div>

              <form onSubmit={handleTeacherSubmitAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-600 block">نام کاربری دلخواه (انگلیسی یا فارسی):</label>
                  <input
                    type="text"
                    value={teacherUsername}
                    onChange={e => setTeacherUsername(e.target.value)}
                    placeholder="مثال: ahmadi"
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                    required
                  />
                  {!isRegistering && (
                    <span className="text-[10px] text-slate-400 block font-bold">می‌توانید برای تست سیستم از نام کاربری نمونه <span className="font-black text-slate-600">ahmadi</span> استفاده کنید.</span>
                  )}
                </div>

                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      value={teacherFullName}
                      onChange={e => setTeacherFullName(e.target.value)}
                      placeholder="مثال: استاد حمیدرضا شاکری"
                      className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-yellow-300 text-yellow-950 font-black text-sm rounded-xl cursor-pointer pill-btn-sm"
                >
                  {isRegistering ? 'ایجاد حساب و ورود به پنل ✨' : 'ورود به حساب کاربری 🔐'}
                </button>
              </form>

            </div>
          )}


          {/* ==================== STATE 3: STUDENT EXAM CODE ENTRY ==================== */}
          {activeRole === 'student_form' && (
            <div className="max-w-md mx-auto bg-white rounded-3xl comic-border p-6 space-y-6 text-right animate-fade-in" id="student-code-entry-form">
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-800">ورود به جلسه آزمون کلاسی</h3>
                <button
                  onClick={() => setActiveRole('landing')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  بازگشت ↩
                </button>
              </div>

              <form onSubmit={handleStudentAccessCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 block">رمز یا کد اختصاصی آزمون:</label>
                  <input
                    type="text"
                    value={studentExamCode}
                    onChange={e => setStudentExamCode(e.target.value)}
                    placeholder="کد ۶ رقمی را وارد کنید (مثلاً: 654321)"
                    className="w-full text-center tracking-widest text-sm font-black px-3 py-3 rounded-xl border-2 border-black bg-white focus:outline-none font-sans"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block font-bold text-center mt-1">
                    کد آزمون نمونه پیش‌فرض جهت تست سریع: <span className="font-extrabold text-blue-600 font-sans">654321</span> یا <span className="font-extrabold text-blue-600 font-sans">123456</span> است.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-pink-400 text-pink-950 font-black text-sm rounded-xl cursor-pointer pill-btn-sm"
                >
                  تأیید و دریافت مشخصات ورود 📝
                </button>
              </form>

            </div>
          )}


          {/* ==================== STATE 4: THE TEACHER DASHBOARD AREA ==================== */}
          {activeRole === 'teacher_dashboard' && currentTeacher && (
            <TeacherDashboard
              currentTeacher={currentTeacher}
              exams={exams}
              submissions={submissions}
              onCreateExam={handleCreateExam}
              onDeleteExam={handleDeleteExam}
              onUpdateSubmissions={saveSubmissionsToStorage}
              onLogout={() => { setCurrentTeacher(null); setActiveRole('landing'); }}
            />
          )}


          {/* ==================== STATE 5: ACTIVE STUDENT EXAM AREA ==================== */}
          {activeRole === 'student_exam' && activeStudentExam && (
            <StudentExamRoom
              exam={activeStudentExam}
              onSubmitExam={handleStudentSubmitExam}
              onExit={() => { setActiveStudentExam(null); setStudentExamCode(''); setActiveRole('landing'); }}
            />
          )}

        </div>

      </div>

    </div>
  );
}
