import React, { useState } from 'react';
import { 
  Plus, Trash2, CheckCircle, X, HelpCircle, Eye, 
  Copy, LogOut, Clock, School, User, Award, 
  ChevronLeft, FileText, Check, AlertCircle, Share2, Calendar
} from 'lucide-react';
import { Exam, ExamQuestion, QuestionType, StudentSubmission, Teacher } from '../types';

interface TeacherDashboardProps {
  currentTeacher: Teacher;
  exams: Exam[];
  submissions: StudentSubmission[];
  onCreateExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  onDeleteExam: (examId: string) => void;
  onUpdateSubmissions: (subs: StudentSubmission[]) => void;
  onLogout: () => void;
}

export default function TeacherDashboard({
  currentTeacher,
  exams,
  submissions,
  onCreateExam,
  onDeleteExam,
  onUpdateSubmissions,
  onLogout
}: TeacherDashboardProps) {
  // Navigation states
  const [activeView, setActiveView] = useState<'list' | 'create' | 'results'>('list');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Exam Form states
  const [examTitle, setExamTitle] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [questions, setQuestions] = useState<Omit<ExamQuestion, 'id'>[]>([]);

  // Descriptive grading states
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingSuccessId, setGradingSuccessId] = useState<string | null>(null);

  // Copy Exam Code utility
  const copyExamLink = (examId: string) => {
    const url = `${window.location.origin}?examCode=${examId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(examId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Exam Filtering for current logged-in teacher ONLY
  const teacherExams = exams.filter(e => e.teacherId === currentTeacher.id);
  const selectedExam = exams.find(e => e.id === selectedExamId);
  const selectedExamSubmissions = submissions.filter(s => s.examId === selectedExamId);

  // Question Creation Handlers
  const addQuestionField = (type: QuestionType) => {
    const newQ: Omit<ExamQuestion, 'id' | 'type' | 'text' | 'maxScore'> = {
      options: type === 'multiple-choice' ? ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'] : undefined,
      correctAnswer: type === 'multiple-choice' ? 'گزینه ۱' : ''
    };
    
    setQuestions([...questions, {
      type,
      text: '',
      maxScore: type === 'descriptive' ? 10 : 5,
      ...newQ
    }]);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateQuestionMaxScore = (index: number, score: number) => {
    const updated = [...questions];
    updated[index].maxScore = score;
    setQuestions(updated);
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      const prevOpt = updated[qIndex].options![optIndex];
      updated[qIndex].options![optIndex] = val;
      // If the correct answer was this option, update the correct answer string as well
      if (updated[qIndex].correctAnswer === prevOpt) {
        updated[qIndex].correctAnswer = val;
      }
    }
    setQuestions(updated);
  };

  const selectCorrectOption = (qIndex: number, optionVal: string) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = optionVal;
    setQuestions(updated);
  };

  const updateCorrectAnswerText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  // Submit new designed exam helper
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      alert('لطفاً عنوان آزمون را وارد کنید');
      return;
    }
    if (questions.length === 0) {
      alert('حداقل یک سوال برای آزمون طراحی کنید!');
      return;
    }
    
    // Check if empty questions exist
    const hasEmpty = questions.some(q => !q.text.trim());
    if (hasEmpty) {
      alert('لطفاً صورت تمام سوالات را کامل کنید');
      return;
    }

    onCreateExam({
      title: examTitle,
      schoolName: schoolName || 'مدارس کشور',
      durationMinutes: duration || 30,
      active: true,
      questions: questions.map((q, idx) => ({ ...q, id: `q-custom-${idx + 1}-${Date.now()}` })) as ExamQuestion[]
    });

    // Reset Form Input
    setExamTitle('');
    setSchoolName('');
    setDuration(30);
    setQuestions([]);
    setActiveView('list');
  };

  // descriptive score input handler
  const handleDescriptiveGrade = (subId: string, qId: string, maxScore: number) => {
    const givenScore = gradingScores[`${subId}-${qId}`];
    if (givenScore === undefined || isNaN(givenScore) || givenScore < 0 || givenScore > maxScore) {
      alert(`لطفاً نمره‌ای بین 0 تا ${maxScore} وارد کنید.`);
      return;
    }

    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === subId) {
        // Calculate old score without this descriptive item
        const previousItemScore = sub.descriptiveScores[qId] || 0;
        const newScore = sub.score - previousItemScore + Number(givenScore);
        
        return {
          ...sub,
          score: newScore,
          descriptiveScores: {
            ...sub.descriptiveScores,
            [qId]: Number(givenScore)
          },
          isDescriptiveGraded: {
            ...sub.isDescriptiveGraded,
            [qId]: true
          }
        };
      }
      return sub;
    });

    onUpdateSubmissions(updatedSubmissions);
    setGradingSuccessId(`${subId}-${qId}`);
    setTimeout(() => setGradingSuccessId(null), 2500);
  };

  return (
    <div id="teacher-dashboard-view" className="space-y-6 animate-fade-in" dir="rtl">
      
      {/* Top Header of Dashboard info */}
      <div className="bg-white comic-border rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            👨‍🏫
          </div>
          <div className="text-right">
            <div className="text-xs text-indigo-800 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-full inline-block border border-indigo-200">
              رابط کاربری دبیران
            </div>
            <h2 className="text-base font-black text-slate-800 mt-1">خوش‌آمدید، {currentTeacher.fullName} ✨</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {activeView !== 'list' && (
            <button
              onClick={() => { setActiveView('list'); setSelectedExamId(null); }}
              className="px-4 py-2 bg-slate-100 font-black text-xs rounded-xl hover:bg-slate-200 cursor-pointer pill-btn-sm text-slate-700 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              بازگشت به آزمون‌ها
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-400 text-rose-950 font-black text-xs rounded-xl hover:bg-rose-500 cursor-pointer pill-btn-sm flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            خروج از سیستم
          </button>
        </div>
      </div>

      {/* ======================= VIEW 1: EXAM LISTS ======================= */}
      {activeView === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">📋 بانک آزمون‌های جادویی شما</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">شما طراح بزرگ ارزیابی‌های کلاسی خود هستید.</p>
            </div>
            
            <button
              onClick={() => setActiveView('create')}
              className="px-5 py-3 bg-indigo-400 text-indigo-950 font-black text-sm rounded-2xl cursor-pointer hover:bg-indigo-500 flex items-center gap-2 pill-btn"
            >
              <Plus className="w-5 h-5" />
              طراحی آزمون آنلاین جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherExams.map(exam => {
              const examSubmissions = submissions.filter(s => s.examId === exam.id);
              const ungradedSubmissionsCount = examSubmissions.filter(s => 
                Object.values(s.isDescriptiveGraded).some(v => v === false)
              ).length;

              return (
                <div 
                  key={exam.id} 
                  id={`created-exam-card-${exam.id}`}
                  className="bg-white rounded-3xl comic-border p-5 flex flex-col justify-between h-[310px] relative overflow-hidden group hover:scale-[1.01] transition-transform"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-indigo-50/75 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[11px] font-black text-indigo-950 flex items-center gap-1">
                        <School className="w-3.5 h-3.5 shrink-0" />
                        {exam.schoolName}
                      </span>
                      <span className="bg-yellow-300 text-yellow-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border-2 border-black">
                        کد آزمون: {exam.id}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 min-h-[40px] leading-relaxed">
                      {exam.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>زمان: {exam.durationMinutes || 'بدون محدودیت'} دقیقه</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span>سؤالات: {exam.questions.length} عدد</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>پاسخ‌ها: <span className="text-slate-800 font-extrabold">{examSubmissions.length} نفر</span></span>
                        {ungradedSubmissionsCount > 0 && (
                          <span className="text-[10px] font-black bg-rose-150 text-rose-800 px-1.5 py-0.5 rounded-md animate-pulse">
                            ({ungradedSubmissionsCount} تصحیح نشده)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedExamId(exam.id); setActiveView('results'); }}
                        className="flex-1 py-2 bg-emerald-300 text-emerald-950 rounded-xl font-black text-xs pill-btn-sm flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        نتایج و تصحیح
                      </button>

                      <button
                        onClick={() => copyExamLink(exam.id)}
                        className={`px-3 py-2 rounded-xl font-black text-xs pill-btn-sm flex items-center justify-center gap-1.5 ${
                          copiedId === exam.id ? 'bg-amber-300 text-amber-950 font-black' : 'bg-yellow-300 text-yellow-950'
                        }`}
                        title="کپی کردن لینک سریع برای دانش‌آموزان"
                      >
                        {copiedId === exam.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            کپی شد!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            لینک آزمون
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('آیا مایل به حذف این امتحان طراحی‌شده هستید؟ تمام سوابق دانش‌آموزان پاک می‌شود.')) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="w-full py-1.5 border-2 border-dashed border-rose-200 text-rose-500 hover:text-rose-600 hover:border-rose-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف دائمِ کلاس و آزمون
                    </button>
                  </div>
                </div>
              );
            })}

            {teacherExams.length === 0 && (
              <div className="col-span-full border-4 border-dashed border-black rounded-3xl p-10 text-center bg-white">
                <div className="text-4xl mb-3">📝🧸</div>
                <h4 className="font-black text-slate-700 text-sm">هیچ آزمونی هنوز طراحی نکرده‌اید!</h4>
                <p className="text-xs text-slate-400 mt-2">همین الان با فشردن دکمه «طراحی آزمون آنلاین جدید»، اولین برگه جادویی امتحانی خود را بسازید.</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ======================= VIEW 2: EXAM CREATOR FORM ======================= */}
      {activeView === 'create' && (
        <form onSubmit={handleSaveExam} className="bg-white rounded-3xl comic-border p-6 space-y-6">
          
          <div className="border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-black text-indigo-950 font-sans">🛠️ کارگاه طراحی برگه ارزیابی هوشمند معلم</h3>
            <p className="text-xs text-slate-500 mt-1">عنوان، نام مدرسه و فیلدهای سوالات آزمون تستی، تشریحی، جاخالی و کوتاه پاسخ را در این پنل تنظیم کنید.</p>
          </div>

          {/* Core Properties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">عنوان آزمون چیست؟</label>
              <input
                type="text"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                placeholder="مثلاً: کوئیز علوم پنجم - فصل دوم آوندها"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">نام مدرسه / برند آموزشگاه</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="مثلاً: دبستان دخترانه بهار"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">مدت زمان پاسخ‌گویی (دقیقه)</label>
              <input
                type="number"
                min={1}
                max={200}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Question types drawer picker */}
          <div className="bg-amber-50 rounded-2xl border-2 border-black p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              یک نوع سؤال جدید پیوند بزنید:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => addQuestionField('multiple-choice')}
                className="py-2.5 px-3 bg-blue-300 text-blue-950 font-black text-xs rounded-xl pill-btn-sm"
              >
                ➕ سؤال تستی (MC)
              </button>
              <button
                type="button"
                onClick={() => addQuestionField('descriptive')}
                className="py-2.5 px-3 bg-pink-300 text-pink-950 font-black text-xs rounded-xl pill-btn-sm"
              >
                ➕ سؤال تشریحی (بارم‌دار)
              </button>
              <button
                type="button"
                onClick={() => addQuestionField('short-answer')}
                className="py-2.5 px-3 bg-yellow-300 text-yellow-950 font-black text-xs rounded-xl pill-btn-sm"
              >
                ➕ سؤال کوتاه پاسخ
              </button>
              <button
                type="button"
                onClick={() => addQuestionField('fill-blank')}
                className="py-2.5 px-3 bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl pill-btn-sm"
              >
                ➕ سؤال جای خالی
              </button>
            </div>
          </div>

          {/* Question fields list area */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>لیست سؤالات آزمون شما</span>
              <span className="text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full font-mono">
                کل کدهای سوال: {questions.length} سوال آماده
              </span>
            </h4>

            {questions.map((q, qIdx) => (
              <div 
                key={qIdx} 
                className="bg-slate-50 border-2 border-black rounded-2xl p-4 relative space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Trash delete pill */}
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="absolute left-3 top-3 p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 border border-rose-300 cursor-pointer"
                  title="حذف سؤال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Sub-Header info */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-black bg-black text-white px-2.5 py-0.5 rounded-lg font-mono">
                    سؤال {qIdx + 1}
                  </span>
                  
                  {q.type === 'multiple-choice' && (
                    <span className="text-[10px] font-black bg-blue-100 border border-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                      تستی (چندگزینه‌ای)
                    </span>
                  )}
                  {q.type === 'descriptive' && (
                    <span className="text-[10px] font-black bg-pink-100 border border-pink-200 text-pink-900 px-2 py-0.5 rounded-full">
                      تشریحی (کیفی و نیازمند تصحیح دستی)
                    </span>
                  )}
                  {q.type === 'short-answer' && (
                    <span className="text-[10px] font-black bg-yellow-100 border border-yellow-250 text-yellow-900 px-2 py-0.5 rounded-full">
                      کوتاه پاسخ
                    </span>
                  )}
                  {q.type === 'fill-blank' && (
                    <span className="text-[10px] font-black bg-emerald-105 border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      جای خالی (با نقطه‌چین)
                    </span>
                  )}
                </div>

                {/* Main Content Design Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-slate-500">متن صورت سؤال:</label>
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestionText(qIdx, e.target.value)}
                      placeholder={
                        q.type === 'fill-blank' 
                          ? 'مثال: آب در دمای ........ درجه سانتی گراد تبخیر می‌شود.' 
                          : 'متن صورت سوال را بنویسید...'
                      }
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl border-2 border-black bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">نمره/بارم سوال:</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={q.maxScore}
                      onChange={e => updateQuestionMaxScore(qIdx, Number(e.target.value))}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl border-2 border-black bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Conditional Sub-settings for Multiple Choice options */}
                {q.type === 'multiple-choice' && q.options && (
                  <div className="space-y-2 border-t-2 border-dashed border-slate-200 pt-3">
                    <span className="text-[10px] font-black text-slate-500 block mb-1">تعیین گزینه‌ها و پاسخ صحیح (کلیک بر دایره برای انتخاب کلید تصحیح):</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-radio-${qIdx}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => selectCorrectOption(qIdx, opt)}
                            className="w-4 h-4 cursor-pointer text-indigo-600 focus:ring-indigo-500"
                            title="قرار دادن به عنوان گزینه صحیح"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={e => updateQuestionOption(qIdx, optIdx, e.target.value)}
                            className="flex-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditional Sub-settings for Short Answer keys */}
                {q.type === 'short-answer' && (
                  <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-2.5">
                    <label className="text-[10px] font-black text-indigo-950 block">کلید پاسخ صحیح (برای سیستم تصحیحِ خودکار):</label>
                    <input
                      type="text"
                      value={q.correctAnswer as string}
                      onChange={e => updateCorrectAnswerText(qIdx, e.target.value)}
                      placeholder="پاسخ نهایی دقیق دانش‌آموز (مثلاً: ابوریحان بیرونی)"
                      className="w-full max-w-sm text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Conditional Sub-settings for Fill in Blanks keys */}
                {q.type === 'fill-blank' && (
                  <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-2.5">
                    <label className="text-[10px] font-black text-emerald-950 block">پاسخ جای خالی اصلی (جهت تطبیق خودکار):</label>
                    <input
                      type="text"
                      value={q.correctAnswer as string}
                      onChange={e => updateCorrectAnswerText(qIdx, e.target.value)}
                      placeholder="کلمه جای خالی (مثلاً: ۱۰۰)"
                      className="w-full max-w-sm text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>
                )}

              </div>
            ))}

            {questions.length === 0 && (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 text-xs py-10 font-bold">
                💡 هنوز هیچ سوالی اضافه نکرده‌اید. با انتخاب یکی از کلیدهای بخش بالا، اولین سوال آزمون خود را بسازید.
              </div>
            )}
          </div>

          {/* Form Action Controls */}
          <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => { setActiveView('list'); setQuestions([]); }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-black text-xs rounded-xl cursor-pointer"
            >
              انصراف و لغو طراحی
            </button>
            <button
              type="submit"
              disabled={questions.length === 0}
              className="px-6 py-2.5 bg-pink-400 text-pink-950 font-black text-xs rounded-xl cursor-pointer pill-btn-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              ثبت و ذخیره نهایی آزمون و تولید کد 🌟
            </button>
          </div>

        </form>
      )}

      {/* ======================= VIEW 3: RESULTS PANEL & GRADING ======================= */}
      {activeView === 'results' && selectedExam && (
        <div className="space-y-6 animate-fade-in" id="exam-stats-results">
          
          {/* Exam Summary Info Box */}
          <div className="bg-white rounded-3xl comic-border p-5">
            <div className="flex justify-between items-start flex-wrap gap-4" dir="rtl">
              <div>
                <span className="text-[10px] font-black bg-yellow-300 text-yellow-950 px-2.5 py-0.5 rounded-full border-2 border-black">
                  کد آزمون تفصیلی: {selectedExam.id}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-2 font-sans">{selectedExam.title}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">طراح: {selectedExam.teacherName} | مرکز: {selectedExam.schoolName}</p>
              </div>
              <div className="bg-slate-50 border-2 border-black p-3 rounded-2xl flex items-center gap-4 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <span className="text-slate-400 block text-[9px]">تعداد شرکت کنندگان</span>
                  <span className="text-indigo-600 block text-center font-sans font-black text-base">{selectedExamSubmissions.length} نفر</span>
                </div>
                <div className="h-8 w-[1px] bg-slate-300"></div>
                <div>
                  <span className="text-slate-400 block text-[9px]">مجموع بارم کل آزمون</span>
                  <span className="text-emerald-700 block text-center font-sans font-black text-base">
                    {selectedExam.questions.reduce((sum, current) => sum + current.maxScore, 0)} نمره
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Submissions List */}
          <div className="bg-white rounded-3xl comic-border p-5 text-right">
            <h4 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">
              لیست کارهای ثبت شده دانش‌آموزان
            </h4>

            {selectedExamSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                🧸 هنوز هیچ دانش‌آموزی در این آزمون ثبت پاسخ نکرده است.
              </div>
            ) : (
              <div className="space-y-6">
                {selectedExamSubmissions.map((sub, sIdx) => {
                  const hasDescriptive = selectedExam.questions.some(q => q.type === 'descriptive');
                  const checkUndescripted = selectedExam.questions
                    .filter(q => q.type === 'descriptive')
                    .some(q => sub.isDescriptiveGraded[q.id] === false);

                  return (
                    <div 
                      key={sub.id} 
                      className="border-2 border-black rounded-2xl p-4 bg-slate-50/50 space-y-4"
                      id={`student-sub-card-${sub.id}`}
                    >
                      {/* Submission Header line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black border border-indigo-300">
                            {sIdx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-800">{sub.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold mr-2">(کد ملی/دانش‌آموزی: {sub.studentCode})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            تاریخ ثبت: {new Date(sub.submittedAt).toLocaleTimeString('fa-IR')} - {new Date(sub.submittedAt).toLocaleDateString('fa-IR')}
                          </span>

                          <div className="bg-white border-2 border-black px-3.5 py-1 rounded-xl text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-[9px] text-slate-400 block font-bold">نمره کل ثبت شده</span>
                            <span className="text-xs font-black text-slate-800 font-sans">
                              {sub.score} / {sub.maxPossibleScore}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Side-by-side answers detail review */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-black text-indigo-950 block">بررسی جزئی برگه پاسخنامه هدیه دانش‌آموز:</h5>
                        
                        <div className="grid grid-cols-1 gap-3.5">
                          {selectedExam.questions.map((q, questIdx) => {
                            const studentAns = sub.answers[q.id] || '(پاسخ نداده است)';
                            const isMC = q.type === 'multiple-choice';
                            const isBlank = q.type === 'fill-blank';
                            const isSA = q.type === 'short-answer';
                            const isDesc = q.type === 'descriptive';

                            // Autograder calculations display for MC, blank, SA
                            const isCorrect = !isDesc && (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());

                            return (
                              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                                <div className="flex justify-between items-start gap-3">
                                  <span className="font-bold text-slate-800 leading-relaxed text-xs">
                                    {questIdx + 1}. {q.text} <span className="text-slate-400 text-[10px] font-black">({q.maxScore} نمره)</span>
                                  </span>

                                  {/* Autograder Badge */}
                                  {!isDesc ? (
                                    isCorrect ? (
                                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border border-emerald-200">
                                        درست ✅ ({q.maxScore} از {q.maxScore})
                                      </span>
                                    ) : (
                                      <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border border-rose-200">
                                        نادرست ❌ (۰ از {q.maxScore})
                                      </span>
                                    )
                                  ) : (
                                    <span className="bg-pink-100 text-pink-900 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border border-pink-200">
                                      تشریحی 📝
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <div>
                                    <span className="text-slate-400 font-bold block">پاسخ ثبت شده دانش‌آموز:</span>
                                    <span className="font-extrabold text-indigo-900">{studentAns}</span>
                                  </div>
                                  
                                  {!isDesc ? (
                                    <div>
                                      <span className="text-slate-400 font-bold block">پاسخ صحیح سیستم:</span>
                                      <span className="font-extrabold text-emerald-800">{q.correctAnswer}</span>
                                    </div>
                                  ) : (
                                    <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200/60 mt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                                      <div className="flex items-center gap-1.5 self-start">
                                        <Award className="w-4 h-4 text-pink-500" />
                                        <span className="text-[10px] font-black text-pink-950">
                                          نمره این سوال تشریحی: {sub.isDescriptiveGraded[q.id] ? (
                                            <span className="text-emerald-700 font-sans font-black">{sub.descriptiveScores[q.id]} از {q.maxScore} ثبت شده</span>
                                          ) : (
                                            <span className="text-rose-600 animate-pulse font-black">تصحیح نشده ⚠️</span>
                                          )}
                                        </span>
                                      </div>

                                      {/* Grading input */}
                                      <div className="flex items-center gap-2 self-end w-full sm:w-auto">
                                        <input
                                          type="number"
                                          min={0}
                                          max={q.maxScore}
                                          step={0.5}
                                          placeholder={`نمره از ${q.maxScore}`}
                                          value={gradingScores[`${sub.id}-${q.id}`] ?? sub.descriptiveScores[q.id] ?? ''}
                                          onChange={e => setGradingScores({
                                            ...gradingScores,
                                            [`${sub.id}-${q.id}`]: Number(e.target.value)
                                          })}
                                          className="w-24 text-center px-1.5 py-1 rounded-lg border border-slate-300 font-mono text-[11px] bg-white text-slate-800 focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleDescriptiveGrade(sub.id, q.id, q.maxScore)}
                                          className="px-3 py-1 bg-yellow-300 text-yellow-950 text-[10px] font-black rounded-lg pill-btn-sm shrink-0"
                                        >
                                          ثبت نمره
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {gradingSuccessId === `${sub.id}-${q.id}` && (
                                  <div className="text-[10px] font-black text-emerald-700 text-left mt-1 flex items-center justify-end gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    نمره با موفقیت محاسبه و به کارنامه اضافه شد!
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
