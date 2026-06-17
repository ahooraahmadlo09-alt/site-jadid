import React, { useState, useEffect } from 'react';
import { 
  Clock, Award, BookOpen, User, CheckCircle, 
  Send, AlertCircle, ChevronRight, Check, Sparkles, LogOut
} from 'lucide-react';
import { Exam, StudentSubmission } from '../types';

interface StudentExamRoomProps {
  exam: Exam;
  onSubmitExam: (submission: Omit<StudentSubmission, 'id' | 'submittedAt'>) => void;
  onExit: () => void;
}

export default function StudentExamRoom({
  exam,
  onSubmitExam,
  onExit
}: StudentExamRoomProps) {
  // Setup steps
  const [examState, setExamState] = useState<'onboard' | 'testing' | 'loading' | 'submitted'>('onboard');

  // Onboard details
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');

  // Active answer mappings: questionId -> string response
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Real countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const totalDurationSeconds = (exam.durationMinutes || 30) * 60;

  useEffect(() => {
    if (examState === 'testing' && exam.durationMinutes) {
      setTimeLeft(totalDurationSeconds);
    }
  }, [examState]);

  useEffect(() => {
    if (examState !== 'testing' || !exam.durationMinutes) return;

    if (timeLeft <= 0) {
      // Auto submit on timeout
      handleForceSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, examState]);

  // Launch test room after basic verification
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('لطفاً نام خود را بنویسید');
      return;
    }
    if (!studentCode.trim()) {
      alert('لطفاً کد ملی یا کد دانش‌آموزی خود را بنویسید');
      return;
    }
    
    // Initialize temporary answers map
    const initialAnswers: Record<string, string> = {};
    exam.questions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
    setExamState('testing');
  };

  // Helper for answers
  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers({
      ...answers,
      [qId]: val
    });
  };

  // Submission handler
  const handleForceSubmit = () => {
    setExamState('loading');
    
    // Automatic system grading math
    let autoTotalScore = 0;
    const isDescriptiveGraded: Record<string, boolean> = {};
    const descriptiveScores: Record<string, number> = {};

    exam.questions.forEach(q => {
      const studentAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();

      if (q.type === 'descriptive') {
        isDescriptiveGraded[q.id] = false;
        descriptiveScores[q.id] = 0;
      } else {
        isDescriptiveGraded[q.id] = true;
        descriptiveScores[q.id] = 0;
        // check match
        if (studentAns === correctAns && correctAns !== '') {
          autoTotalScore += q.maxScore;
        }
      }
    });

    const maxPoss = exam.questions.reduce((sum, current) => sum + current.maxScore, 0);

    // Call submit event propagation after simulated delay
    setTimeout(() => {
      onSubmitExam({
        examId: exam.id,
        examTitle: exam.title,
        studentName,
        studentCode,
        answers,
        score: autoTotalScore,
        maxPossibleScore: maxPoss,
        isDescriptiveGraded,
        descriptiveScores
      });
      setExamState('submitted');
    }, 1200);
  };

  const executeManualSubmit = () => {
    const unansweredCount = exam.questions.filter(q => !answers[q.id] || !answers[q.id].trim()).length;
    let message = 'آیا مایل به پایان آزمون و ثبت برگه امتحانی خود هستید؟';
    if (unansweredCount > 0) {
      message = `شما به تعداد ${unansweredCount} سوال پاسخ نداده‌اید! آیا همچنان مایل به ارسال برگه آزمون هستید؟`;
    }
    
    if (confirm(message)) {
      handleForceSubmit();
    }
  };

  // Display timer helper
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div id="student-exam-room-element" className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      
      {/* State A: Login onboarding */}
      {examState === 'onboard' && (
        <div className="bg-white rounded-3xl comic-border p-6 space-y-6 text-right">
          
          <div className="bg-yellow-150 p-4 rounded-2xl border-2 border-black flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full">
                آماده برگزاری آزمون کلاسی
              </span>
              <h3 className="text-base font-black text-slate-800 font-sans">{exam.title}</h3>
              <p className="text-xs text-slate-500 font-bold">موسسه: {exam.schoolName} | معلم گرامی: {exam.teacherName}</p>
            </div>
            <div className="text-3xl">🎒✏️</div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-black text-indigo-950 mb-2">📋 مشخصات شناسایی خود را وارد کنید:</h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">برای شرکت در این سنجش، مشخصات شناسایی خود را به طور کامل بنویسید تا برای معلّم ارسال شود.</p>
            
            <form onSubmit={handleStartExam} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5Col">
                <label className="text-xs font-black text-slate-600 block">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="مثال: بردیا جهانگرد"
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5Col">
                <label className="text-xs font-black text-slate-600 block">کد دانش‌آموزی یا کد ملی:</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  placeholder="مثال: ۳۹۴۸۵۷"
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-full pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-black text-xs rounded-xl cursor-pointer"
                >
                  انصراف و خروج
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-indigo-400 text-indigo-950 font-black text-sm rounded-xl cursor-pointer pill-btn-sm"
                >
                  تأیید مشخصات و شروع آزمون 🚀
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* State B: Waiting Loader */}
      {examState === 'loading' && (
        <div className="bg-white rounded-3xl comic-border p-10 text-center space-y-4">
          <div className="animate-spin text-3xl inline-block">⏳</div>
          <h3 className="font-extrabold text-slate-800 text-sm">در حال ارسال و ثبت برگه پاسخنامه شما...</h3>
          <p className="text-xs text-slate-400 font-bold">بذار پاسخ‌ها رو مرتب بگذاریم توی پرونده علمی کلاست.</p>
        </div>
      )}


      {/* State C: Active Testing Room */}
      {examState === 'testing' && (
        <div className="space-y-6">
          
          {/* Dashboard Header Bar */}
          <div className="bg-white rounded-3xl comic-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-2 z-30">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl border border-indigo-300">
                📝
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-700">{exam.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">دانش‌آموز: <span className="font-extrabold text-slate-900">{studentName}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {exam.durationMinutes ? (
                <div className="bg-yellow-100 border-2 border-black px-4 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-yellow-950 font-black">
                  <Clock className="w-4 h-4 text-yellow-950 shrink-0" />
                  <span className="text-xs">زمان باقیمانده:</span>
                  <span className="text-sm font-mono font-black">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                  آزمون بدون محدودیت زمانی
                </span>
              )}

              <button
                onClick={executeManualSubmit}
                className="px-5 py-2.5 bg-emerald-300 text-emerald-950 font-black text-xs rounded-xl cursor-pointer pill-btn-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                پایان و ارسال آزمون
              </button>
            </div>
          </div>

          {/* Guidelines hint */}
          <div className="bg-indigo-50 border-2 border-black p-3.5 rounded-2xl text-xs font-bold text-indigo-950 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <span>قهرمان کوچک! سؤالات را با دقت بخوان و گزینه‌ها یا پاسخ‌های خالی را در داخل کاردِ مربوطه‌ی هر سؤال پر کن. در پایان حتماً دکمه سبز رنگِ «پایان و ارسال آزمون» را فشار بده. موفق باشی! 🌟</span>
          </div>

          {/* List of custom questions */}
          <div className="space-y-6">
            {exam.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className="bg-white rounded-3xl comic-border p-5 text-right space-y-4"
                id={`exam-quiz-question-${q.id}`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                  <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                    سؤال شماره {idx + 1}
                  </span>
                  <span className="text-[11px] font-black text-slate-400">
                    بارم نمره‌ای: <span className="text-slate-800 font-extrabold">{q.maxScore} نمره</span>
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-800 leading-relaxed font-sans">
                  {q.text}
                </h4>

                {/* Answer Inputs rendering depending on type */}
                
                {/* 1. Multiple choice */}
                {q.type === 'multiple-choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, opt)}
                          className={`p-3 text-right text-xs font-bold rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                            selected 
                              ? 'bg-blue-100 text-blue-950 border-blue-600 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-[1.01]' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-black'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selected ? 'border-indigo-600 bg-indigo-500' : 'border-slate-300'
                          }`}>
                            {selected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Descriptive essay type */}
                {q.type === 'descriptive' && (
                  <div className="pt-1.5">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">پاسخ تشریحی خود را در کادر زیر تایپ کنید:</label>
                    <textarea
                      rows={4}
                      value={answers[q.id]}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      placeholder="توضیحات علمی خود را در مورد این سوال به طور روان بنویسید..."
                      className="w-full text-xs font-bold p-3.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* 3. Short Answer */}
                {q.type === 'short-answer' && (
                  <div className="pt-1 w-full max-w-md">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">پاسخ کوتاه یا کلمه اصلی را بنویسید:</label>
                    <input
                      type="text"
                      value={answers[q.id]}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      placeholder="پاسخ کوتاه خود را تایپ کنید..."
                      className="w-full text-xs font-black px-3 py-2.5 rounded-xl border-2 border-black bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* 4. Fill in the Blank sentence style */}
                {q.type === 'fill-blank' && (
                  <div className="pt-1 w-full max-w-md">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">پاسخ کلمه جای خالی را بنویسید:</label>
                    <input
                      type="text"
                      value={answers[q.id]}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      placeholder="مثال: مریخ"
                      className="w-full text-xs font-black text-emerald-950 px-3 py-2.5 rounded-xl border-2 border-emerald-400 bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Giant Bottom Submit Button */}
          <div className="bg-white rounded-3xl comic-border p-5 text-center">
            <p className="text-xs font-bold text-slate-500 mb-3">تمام سوالات را بررسی کرده‌اید؟ آماده ثبت کارنامه هستید؟</p>
            <button
              onClick={executeManualSubmit}
              className="px-8 py-3.5 bg-emerald-400 text-emerald-950 text-sm font-black rounded-2xl cursor-pointer pill-btn"
            >
              🚀 ارسال و ثبت نهایی برگه جواب‌ها
            </button>
          </div>

        </div>
      )}


      {/* State D: Submission Completed Page */}
      {examState === 'submitted' && (
        <div className="bg-white rounded-3xl comic-border p-6 space-y-6 text-center animate-fade-in" id="student-success-scene">
          
          <div className="relative animate-bounce inline-block">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🎉
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">برگه آزمون شما با موفقیت تحویل معلم شد!</h3>
            <p className="text-xs text-slate-500 font-bold max-w-md mx-auto">
              بابت تلاش و هوش بالایی که گذاشتی، صمیمانه ازت متشکریم قهرمان! پاسخنامه الکترونیکی تو ثبت شد.
            </p>
          </div>

          <div className="bg-slate-50 border-2 border-black rounded-2xl p-4 max-w-sm mx-auto text-right space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-xs font-black text-indigo-950 border-b border-slate-200 pb-1.5 text-center">رسید تحویل پاسخنامه</h4>
            
            <div className="text-[11px] font-bold text-slate-600 space-y-1" dir="rtl">
              <div>نام شرکت‌کننده: <span className="font-extrabold text-slate-900">{studentName}</span></div>
              <div>کد دانش‌آموزی: <span className="font-extrabold font-mono text-slate-900">{studentCode}</span></div>
              <div>عنوان آزمون علمی: <span className="font-extrabold text-slate-900">{exam.title}</span></div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-dashed border-slate-300 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">سیستم تصحیح یکپارچه دانا لند</span>
              <p className="text-xs font-bold text-slate-700 mt-1">
                سؤالات تستی و کوتاه پاسخ تو فوراً تصحیح شدند. بخش‌های تشریحی پس از مطالعه توسط معلم نمره‌دهی خواهند شد.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={onExit}
              className="px-6 py-2.5 bg-indigo-400 text-indigo-950 font-black text-xs rounded-xl cursor-pointer pill-btn-sm"
            >
              خروج و بازگشت به صفحه اصلی
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
