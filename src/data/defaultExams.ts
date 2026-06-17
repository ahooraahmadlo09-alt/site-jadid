import { Exam, StudentSubmission, Teacher } from '../types';

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    username: 'ahmadi',
    fullName: 'استاد علیرضا احمدی'
  },
  {
    id: 't-2',
    username: 'karimi',
    fullName: 'خانم مریم کریمی'
  }
];

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: '654321',
    title: 'کوییز علوم تجربی - مبحث شگفت‌انگیز منظومه شمسی 🌌',
    teacherId: 't-1',
    teacherName: 'استاد علیرضا احمدی',
    schoolName: 'دبستان هوشمند اندیشه',
    durationMinutes: 20,
    active: true,
    createdAt: '2026-05-26T18:30:00.000Z',
    questions: [
      {
        id: 'q-sci-1',
        type: 'multiple-choice',
        text: 'کدام سیاره در منظومه شمسی به «سیاره سرخ» یا قرمز معروف است؟',
        options: ['زهره (ناهید)', 'مریخ (بهرام)', 'مشتری (هرمز)', 'عطارد (تیر)'],
        correctAnswer: 'مریخ (بهرام)',
        maxScore: 5
      },
      {
        id: 'q-sci-2',
        type: 'fill-blank',
        text: 'بزرگترین سیاره در منظومه شمسی، سیاره ........ نام دارد.',
        correctAnswer: 'مشتری',
        maxScore: 5
      },
      {
        id: 'q-sci-3',
        type: 'short-answer',
        text: 'تنها قمر طبیعی سیاره زمین چه نام دارد؟',
        correctAnswer: 'ماه',
        maxScore: 5
      },
      {
        id: 'q-sci-4',
        type: 'descriptive',
        text: 'چرا سیاره زمین دارای جو (اتمسفر) و آب مایع است و حیات در آن شکل گرفته است؟ توضیح کوتاهی بنویسید.',
        maxScore: 10
      }
    ]
  },
  {
    id: '123456',
    title: 'امتحان ریاضی پایه پنجم - فصل اول الگوها و عددنویسی 🔢',
    teacherId: 't-2',
    teacherName: 'خانم مریم کریمی',
    schoolName: 'دبستان دخترانه بهار دانش',
    durationMinutes: 30,
    active: true,
    createdAt: '2026-05-27T08:00:00.000Z',
    questions: [
      {
        id: 'q-math-1',
        type: 'multiple-choice',
        text: 'عدد بعدی در الگوی روبرو کدام است؟ ۲، ۴، ۸، ۱۶، ...',
        options: ['۲۰', '۲۴', '۳۲', '۳۰'],
        correctAnswer: '۳۲',
        maxScore: 5
      },
      {
        id: 'q-math-2',
        type: 'short-answer',
        text: 'کوچکترین عدد زوج دو رقمی چیست؟',
        correctAnswer: '۱۰',
        maxScore: 5
      },
      {
        id: 'q-math-3',
        type: 'descriptive',
        text: 'توضیح دهید چگونه می‌توان تشخیص داد که یک عدد چندرقمی بر ۵ بخش‌پذیر است یا خیر؟',
        maxScore: 10
      }
    ]
  }
];

export const DEFAULT_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    examId: '654321',
    examTitle: 'کوییز علوم تجربی - مبحث شگفت‌انگیز منظومه شمسی 🌌',
    studentName: 'محمدمهدی مرادی',
    studentCode: '9001',
    answers: {
      'q-sci-1': 'مریخ (بهرام)',
      'q-sci-2': 'مشتری',
      'q-sci-3': 'ماه',
      'q-sci-4': 'به دلیل وجود گازهای اکسیژن و نیتروژن و فاصله مناسب زمین از ستاره خورشید، مایعات یخ نمی‌زنند یا تبخیر کامل نمی‌شوند و جو از ما در برابر اشعه‌ها محافظت می‌کند.'
    },
    submittedAt: '2026-05-27T14:22:00.000Z',
    score: 15, // base default calculated for auto-graded ones (5 + 5 + 5)
    maxPossibleScore: 25,
    isDescriptiveGraded: {
      'q-sci-4': false
    },
    descriptiveScores: {
      'q-sci-4': 0
    }
  },
  {
    id: 'sub-2',
    examId: '654321',
    examTitle: 'کوییز علوم تجربی - مبحث شگفت‌انگیز منظومه شمسی 🌌',
    studentName: 'سنا حسینی',
    studentCode: '9002',
    answers: {
      'q-sci-1': 'زهره (ناهید)',
      'q-sci-2': 'کیوان',
      'q-sci-3': 'ماه',
      'q-sci-4': 'چون فاصله زمین تا خورشید مناسب است و هوا برای تنفس جانداران دارد.'
    },
    submittedAt: '2026-05-27T15:10:00.000Z',
    score: 5, // correct answer for q-sci-3 only
    maxPossibleScore: 25,
    isDescriptiveGraded: {
      'q-sci-4': true
    },
    descriptiveScores: {
      'q-sci-4': 8 // graded by teacher
    }
  },
  {
    id: 'sub-3',
    examId: '123456',
    examTitle: 'امتحان ریاضی پایه پنجم - فصل اول الگوها و عددنویسی 🔢',
    studentName: 'بردیا جمشیدی',
    studentCode: '8011',
    answers: {
      'q-math-1': '۳۲',
      'q-math-2': '۱۰',
      'q-math-3': 'اگر رقم یکان آن عدد صفر یا پنج باشد، آن عدد بر ۵ بخش‌پذیر است.'
    },
    submittedAt: '2026-05-27T12:05:00.000Z',
    score: 10, // MC and short answers correct
    maxPossibleScore: 20,
    isDescriptiveGraded: {
      'q-math-3': true
    },
    descriptiveScores: {
      'q-math-3': 10 // perfect grade!
    }
  }
];
