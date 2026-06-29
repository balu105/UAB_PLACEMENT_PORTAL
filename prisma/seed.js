const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing records to avoid constraint violations on rerun
  await prisma.jobClick.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.advertisement.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('balu123@', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'balaji918214@gmail.com',
      password: adminPasswordHash,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });

  const candidatePasswordHash = await bcrypt.hash('password123', 10);
  const candidateUser = await prisma.user.create({
    data: {
      email: 'candidate@careerlaunch.com',
      password: candidatePasswordHash,
      name: 'Alex Candidate',
      role: 'CANDIDATE',
      skills: 'React, TypeScript, Node.js, CSS, SQL',
      resumeText: 'Alex Candidate. Senior Frontend Developer with 5 years of experience in React and TypeScript. Built responsive dashboards and web portals.',
    },
  });

  console.log('Users created: Admin (balaji918214@gmail.com), Candidate (candidate@careerlaunch.com).');

  // 3. Create Categories
  const categories = [
    { name: 'Software Engineering', slug: 'software-engineering' },
    { name: 'Product Management', slug: 'product-management' },
    { name: 'Design & UX', slug: 'design-ux' },
    { name: 'Data Science & AI', slug: 'data-science-ai' },
    { name: 'Finance & Operations', slug: 'finance-operations' },
  ];

  const dbCategories = [];
  for (const cat of categories) {
    const dbCat = await prisma.category.create({ data: cat });
    dbCategories.push(dbCat);
  }
  console.log('Categories seeded.');

  // 4. Create Companies
  const companies = [
    {
      name: 'Google',
      slug: 'google',
      logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=120&h=120&q=80',
      website: 'https://careers.google.com',
      description: 'Google LLC is a multinational technology company focusing on search, cloud computing, and AI.',
      verified: true,
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      logoUrl: 'https://images.unsplash.com/photo-1625014020903-e329f586c990?auto=format&fit=crop&w=120&h=120&q=80',
      website: 'https://careers.microsoft.com',
      description: 'Microsoft Corporation is an American multinational technology corporation producing software, electronics, and personal computers.',
      verified: true,
    },
    {
      name: 'Stripe',
      slug: 'stripe',
      logoUrl: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=120&h=120&q=80',
      website: 'https://stripe.com/jobs',
      description: 'Stripe is a financial services and software as a service company offering payment processing software.',
      verified: true,
    },
    {
      name: 'Stark Industries',
      slug: 'stark-industries',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
      website: 'https://www.starkindustries.com/careers',
      description: 'Stark Industries is a global conglomerate specializing in advanced technology, aerospace, and energy.',
      verified: false,
    },
  ];

  const dbCompanies = [];
  for (const comp of companies) {
    const dbComp = await prisma.company.create({ data: comp });
    dbCompanies.push(dbComp);
  }
  console.log('Companies seeded.');

  // 5. Create Jobs
  const jobsData = [
    {
      title: 'Senior Frontend Engineer (React/TS)',
      slug: 'senior-frontend-engineer-google-1',
      description: 'Join the Google Cloud console team. You will build highly responsive, accessible web portals for cloud resource management.',
      requirements: 'Requirements:\n- 5+ years of production experience in React\n- Proficient in TypeScript and Vanilla CSS\n- Understanding of server-side rendering (Next.js/Remix) is a plus\n- High care for accessibility (WCAG 2.1 AA/AAA)',
      applyUrl: 'https://careers.google.com/jobs/results/senior-frontend-engineer-cloud',
      verifiedSource: true,
      type: 'Full-time',
      location: 'Mountain View, CA (Hybrid)',
      salaryRange: '$180,000 - $240,000',
      skills: 'React, TypeScript, CSS, Accessibility',
      status: 'PUBLISHED',
      companyId: dbCompanies[0].id, // Google
      categoryId: dbCategories[0].id, // Software Engineering
    },
    {
      title: 'AI Platform Product Manager',
      slug: 'ai-platform-pm-microsoft-2',
      description: 'Define the roadmap for Microsoft Azure Cognitive Services. Work alongside top researchers and engineers to deliver standard NLP engines.',
      requirements: 'Requirements:\n- 3+ years experience as a PM on tech products\n- Strong technical background in AI/ML architectures\n- Experience compiling customer requirements into functional specifications',
      applyUrl: 'https://careers.microsoft.com/jobs/results/ai-platform-pm',
      verifiedSource: true,
      type: 'Full-time',
      location: 'Redmond, WA',
      salaryRange: '$160,000 - $220,000',
      skills: 'Product Management, Azure, AI, Machine Learning',
      status: 'PUBLISHED',
      companyId: dbCompanies[1].id, // Microsoft
      categoryId: dbCategories[1].id, // Product PM
    },
    {
      title: 'UX/UI Designer (Financial Systems)',
      slug: 'ux-ui-designer-stripe-3',
      description: 'Stripe is looking for a designer to redesign the checkout flow dashboard. Create elegant interfaces that explain complex money mechanics.',
      requirements: 'Requirements:\n- 4+ years of UX design experience\n- Stellar portfolio demonstrating interactive flows and clean layouts\n- Proficiency in Figma and layout prototyping',
      applyUrl: 'https://stripe.com/jobs/designer-checkout',
      verifiedSource: true,
      type: 'Remote',
      location: 'San Francisco, CA (Remote)',
      salaryRange: '$140,000 - $190,000',
      skills: 'UI/UX, Figma, Prototyping, Design Systems',
      status: 'PUBLISHED',
      companyId: dbCompanies[2].id, // Stripe
      categoryId: dbCategories[2].id, // Design UX
    },
    {
      title: 'Arc Reactor Security Operations Specialist',
      slug: 'reactor-ops-stark-4',
      description: 'Stark Industries is looking for a Security Analyst to monitor energy matrix grids. This job requires physical location presence and extreme confidentiality.',
      requirements: 'Requirements:\n- 2+ years of cybersecurity operational monitoring\n- High stress tolerance and crisis management skills\n- Experience with high-voltage warning systems and network security',
      applyUrl: 'https://starkindustries.com/careers/operations-specialist',
      verifiedSource: false,
      type: 'Full-time',
      location: 'New York, NY',
      salaryRange: '$90,000 - $130,000',
      skills: 'Security, Grid Monitoring, Compliance',
      status: 'PUBLISHED',
      companyId: dbCompanies[3].id, // Stark Industries
      categoryId: dbCategories[4].id, // Finance & Ops
    },
  ];

  for (const job of jobsData) {
    await prisma.job.create({ data: job });
  }
  console.log('Jobs seeded.');

  // 6. Create Resources
  const resourcesData = [
    {
      title: 'Google Technical Software Engineer Interview Guide',
      slug: 'google-technical-swe-guide',
      type: 'INTERVIEW_QUESTION',
      category: 'System Design',
      content: `## Google Software Engineer Interview Structure
This resource compiles common patterns for Software Engineering interviews at Google.

### Topics Covered:
1. **Data Structures & Algorithms**: Focus on Trees, Graphs (BFS/DFS), Hash Maps, and Dynamic Programming.
2. **System Design**: Designing scalable databases, load balancers, rate limiters, and data ingestion architectures.
3. **Behavioral (Googlyness)**: Showing capability in ambiguity, alignment with team culture, and problem ownership.

### Sample System Design Question:
*Question: Design a high-concurrency Job Outbound Click Tracker.*
- **Scale**: 10,000 clicks/sec.
- **Constraints**: Privacy preservation, minimal latency (<100ms), and 99.99% click delivery log reliability.
- **Approach**: Use a lightweight Edge worker (Vercel Edge functions) redirecting immediately, and asynchronously write to a message queue (Kafka/Redis) to batch-write click logs to the database in background jobs.`,
    },
    {
      title: 'Standard Frontend Placement Paper 2026',
      slug: 'standard-frontend-placement-paper-2026',
      type: 'PLACEMENT_PAPER',
      category: 'Frontend Engineering',
      content: `## Frontend Placement Test & Technical Quiz
A comprehensive placement paper containing typical questions asked by Stripe, Netflix, and Vercel.

### Q1: What is the difference between client-side rendering (CSR) and server-side rendering (SSR) for SEO?
*Answer:* 
- **CSR** serves a skeleton HTML to the browser, which fetches and executes a large JS bundle before rendering content. This delays the Time to Interactive (TTI) and poses risks if search engine scrapers fail to execute JS.
- **SSR** pre-renders HTML on the server. The client receives raw HTML containing fully populated text content (perfect for SEO and immediate First Contentful Paint - FCP). The client then "hydrates" it to attach JS listeners.

### Q2: Design a CSS system that manages dynamic light and dark modes without layout shifts.
*Answer:* Use CSS Custom Properties (Variables) defined in \`:root\` and a toggled body attribute:
\`\`\`css
:root {
  --bg: #ffffff;
  --text: #000000;
}
[data-theme="dark"] {
  --bg: #121212;
  --text: #ffffff;
}
body {
  background-color: var(--bg);
  color: var(--text);
  transition: background-color 0.3s ease;
}
\`\`\``,
    },
  ];

  for (const res of resourcesData) {
    await prisma.resource.create({ data: res });
  }
  console.log('Resources seeded.');

  // 7. Create Blogs
  const blogsData = [
    {
      title: 'How to Build an Enterprise Career Platform with Next.js App Router',
      slug: 'build-enterprise-career-platform-nextjs',
      content: `The modern job market demands fast, interactive, and SEO-optimized web systems. In this post, we explain how we structured CareerLaunch AI to achieve a Lighthouse score of 100 in Performance and SEO.

## 1. Sever-side Rendering (SSR) for Content Pages
By leveraging Next.js App Router, we deliver static HTML for job detail pages and blog posts directly from the edge. This provides immediate indexing for Google JobPosting and Article rich schemas.

## 2. Dynamic client-side components for search
We use React hydration solely for client-side interactivity, such as:
- URL-synced search filters using \`useRouter\`
- Debounced autocomplete suggestions
- Real-time ATS resume keyword scoring and AI chatbot conversations`,
      excerpt: 'Learn the architectural patterns behind building a production-ready, SEO-friendly, scalable job site using Next.js, Prisma, and MySQL.',
      coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      title: 'The AI Resume Game: Defeating ATS Screeners Natively',
      slug: 'ai-resume-game-defeating-ats',
      content: `Many job applicants struggle because their resumes fail to pass applicant tracking systems (ATS). Here is how you can use CareerLaunch AI's built-in ATS scoring tool to secure interviews.

## What is an ATS?
Applicant Tracking Systems search for matching keywords in resume PDFs. If a job listing requires "TypeScript" and your resume only says "JavaScript", the system may screen you out automatically.

## How to use our tool:
1. Copy-paste the job description requirements.
2. Upload or paste your resume text.
3. Review the keywords suggestion scorecard and fill in the missing skills.`,
      excerpt: 'Discover how modern recruitment filtering pipelines work, and learn to tailor your resume keyword alignment using Gemini AI.',
      coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.create({ data: blog });
  }
  console.log('Blogs seeded.');

  // 8. Create Advertisements
  const adsData = [
    {
      title: 'Become an AWS Certified Cloud Practitioner',
      placement: 'SIDEBAR',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=350&h=250&q=80',
      targetUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
      active: true,
    },
    {
      title: 'Premium Frontend Coding Bootcamps - Save 25%',
      placement: 'BANNER',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=728&h=90&q=80',
      targetUrl: 'https://frontendmasters.com',
      active: true,
    },
  ];

  for (const ad of adsData) {
    await prisma.advertisement.create({ data: ad });
  }
  console.log('Advertisements seeded.');

  // 9. System Settings
  const settingsData = [
    { key: 'site_name', value: 'UAB CAREER LAUNCH' },
    { key: 'newsletter_blast_active', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
  ];

  for (const set of settingsData) {
    await prisma.systemSetting.create({ data: set });
  }
  console.log('System settings seeded.');

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
