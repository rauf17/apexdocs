export const templates = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start from scratch with a blank page.',
    content: `# Untitled Document\n\nStart writing here...`,
  },
  {
    id: 'resume-professional',
    name: 'Professional Resume',
    description: 'A clean, ATS-friendly resume template for professionals.',
    content: `# John Doe
**Software Engineer**
[john@example.com](mailto:john@example.com) | (555) 123-4567 | [LinkedIn](#) | [GitHub](#)

## Summary
Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success.

## Experience
### Senior Developer | Tech Corp
*Jan 2020 - Present*
- Led a team of 5 engineers to build a highly scalable web application.
- Reduced load times by 30% through code optimization.

### Web Developer | StartUp Inc
*Jun 2017 - Dec 2019*
- Developed RESTful APIs using Node.js and Express.
- Collaborated with design team to implement responsive UI.

## Education
### B.S. Computer Science | University of Technology
*Graduated: May 2017*

## Skills
JavaScript, React, Node.js, Python, SQL, Git, AWS`,
  },
  {
    id: 'invoice-standard',
    name: 'Standard Invoice',
    description: 'Simple and clean invoice for freelancers and agencies.',
    content: `# INVOICE
**Invoice #:** INV-2023-001  
**Date:** October 25, 2023  
**Due Date:** November 24, 2023

## From
**Your Name/Company**  
123 Business Rd.  
Business City, BC 12345  
hello@example.com

## To
**Client Name/Company**  
456 Client St.  
Client City, CC 67890

## Items

| Description | Quantity | Rate | Amount |
| :--- | :--- | :--- | :--- |
| Web Development Services | 40 hrs | $50 | $2000 |
| UI/Design Assets | 1 | $500 | $500 |
| Server Setup | 1 | $250 | $250 |

---

**Subtotal:** $2750  
**Tax (10%):** $275  
**Total Due:** $3025

## Notes
Thank you for your business! Please send payment within 30 days.`,
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Persuasive proposal template to win new clients.',
    content: `# Project Proposal: Website Redesign

**Prepared for:** Acme Corp  
**Prepared by:** Your Agency  
**Date:** October 25, 2023

## Executive Summary
We propose a complete redesign of the Acme Corp website to improve user engagement, increase conversion rates, and modernize the brand's digital presence.

## Objectives
1. Refresh the visual design to align with modern standards.
2. Improve mobile responsiveness and accessibility.
3. Optimize page load speeds and SEO performance.

## Proposed Solution
Our team will conduct a thorough UX audit, followed by wireframing, high-fidelity design, and full-stack development using modern web technologies.

## Timeline
- **Phase 1: Discovery & Design** (Weeks 1-3)
- **Phase 2: Development** (Weeks 4-7)
- **Phase 3: Testing & Launch** (Week 8)

## Budget Estimation
The estimated total cost for this project is $15,000, broken down by phases.

## Next Steps
To proceed, please review this proposal and provide feedback. Once approved, we will send a formal contract.`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured format for capturing meeting minutes.',
    content: `# Meeting Minutes: Project Kickoff
**Date:** October 25, 2023  
**Time:** 10:00 AM - 11:00 AM  
**Attendees:** Alice, Bob, Charlie, Diana

## Agenda
1. Introductions
2. Project Overview
3. Roles and Responsibilities
4. Timeline Review
5. Q&A

## Discussion Notes
- Alice introduced the project goals and objectives.
- Bob raised concerns about the tight deadline for Phase 1.
- Charlie agreed to allocate more resources to Phase 1.
- Diana will provide the initial design assets by next Tuesday.

## Action Items
- [ ] **Alice**: Share the project brief with the team. (Due: Oct 26)
- [ ] **Charlie**: Reassign tasks to accommodate Phase 1 timeline. (Due: Oct 27)
- [ ] **Diana**: Deliver initial wireframes. (Due: Oct 31)

## Next Meeting
November 1, 2023 at 10:00 AM`,
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Technical template for documenting RESTful APIs.',
    content: `# API Reference: User Service
Base URL: \`https://api.example.com/v1\`

## Authentication
All API requests require a Bearer token in the \`Authorization\` header.
\`\`\`http
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

## Endpoints

### 1. Get User Profile
Retrieves the profile information for a specific user.

**GET** \`/users/:id\`

#### Parameters
| Name | Type | Description |
| :--- | :--- | :--- |
| \`id\` | string | The unique identifier of the user |

#### Response (200 OK)
\`\`\`json
{
  "id": "u_12345",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
\`\`\`

### 2. Create User
Creates a new user account.

**POST** \`/users\`

#### Request Body
\`\`\`json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "securepassword123"
}
\`\`\`

#### Response (201 Created)
\`\`\`json
{
  "id": "u_67890",
  "status": "success",
  "message": "User created successfully"
}
\`\`\`
`,
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'A clean layout for writing engaging articles.',
    content: `# 10 Ways to Improve Your Coding Productivity
*By Jane Doe | October 25, 2023*

![Hero Image](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80)

In today's fast-paced tech world, productivity is key. Here are ten actionable tips to help you write better code, faster.

## 1. Master Your IDE
Your Integrated Development Environment is your primary tool. Take the time to learn its shortcuts, customize its theme, and install helpful extensions.

## 2. Plan Before You Type
Don't jump straight into coding. Spend 15 minutes planning the architecture and logic. A little forethought saves hours of debugging.

> "Give me six hours to chop down a tree and I will spend the first four sharpening the axe." - Abraham Lincoln

## 3. Automate Repetitive Tasks
If you do it more than twice, automate it. Write scripts for deployment, testing, and formatting.

## 4. Take Meaningful Breaks
Staring at a screen for hours leads to diminishing returns. Try the Pomodoro technique to maintain focus and energy.

## Conclusion
Productivity isn't about working harder; it's about working smarter. Implement these tips gradually, and watch your output soar.`,
  },
  {
    id: 'press-release',
    name: 'Press Release',
    description: 'Standard format for company announcements.',
    content: `# FOR IMMEDIATE RELEASE

## ApexDocs Launches Revolutionary Markdown Editor
*New tool promises to change how professionals create and share documents.*

**San Francisco, CA – October 25, 2023** – ApexDocs today announced the launch of its new web-based document editor, designed to streamline the writing process for developers, writers, and businesses.

Built entirely on Markdown, ApexDocs allows users to write distraction-free and export their work to beautifully formatted PDFs with a single click.

"We noticed a gap in the market for a tool that combines the speed of Markdown with professional, print-ready output," said Jane Doe, CEO of ApexDocs. "Our new platform eliminates the need for clunky word processors."

### Key Features include:
- Real-time Markdown preview
- 10+ professional templates
- Instant PDF export with zero watermarks
- Secure cloud storage

ApexDocs is available immediately and is free to use forever. For more information, visit [apexdocs.com](#).

### About ApexDocs
ApexDocs is a technology startup focused on building better tools for digital workers. Founded in 2023, the company is headquartered in San Francisco.

### Media Contact:
John Smith  
PR Director, ApexDocs  
press@apexdocs.com  
(555) 987-6543`,
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Highlight customer success stories.',
    content: `# Customer Success: How TechFlow Increased Conversions by 40%

## The Client
TechFlow is a leading SaaS provider offering project management tools for enterprise teams.

## The Challenge
Despite high traffic, TechFlow was struggling with a low trial-to-paid conversion rate. Their onboarding process was complex, leading to user drop-off within the first 48 hours.

## The Solution
We partnered with TechFlow to overhaul their user journey. Key initiatives included:
1. Simplifying the initial signup form.
2. Implementing an interactive, contextual onboarding tutorial.
3. Redesigning the dashboard for better feature discovery.

## The Results
Within three months of launching the new experience:
- **Conversion Rate:** Increased from 2.1% to 3.5% (a 40% relative increase).
- **Time to Value:** Reduced by 60%.
- **Customer Support Tickets:** Decreased by 25% related to onboarding queries.

> "The redesign completely transformed our trajectory. Users finally 'get' our product immediately." - Sarah Jenkins, CPO at TechFlow

## Conclusion
By focusing on user experience and simplifying the path to value, TechFlow achieved significant business growth without increasing marketing spend.`,
  },
  {
    id: 'changelog',
    name: 'Product Changelog',
    description: 'Template for documenting product updates and releases.',
    content: `# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2023-10-25
### Added
- New **Dark Mode** toggle in user settings.
- Integration with Google Calendar for automatic scheduling.
- Export to PDF functionality for all reports.

### Changed
- Improved dashboard loading speed by optimizing database queries.
- Updated the primary navigation menu to be more intuitive on mobile devices.

### Fixed
- Resolved an issue where user avatars were not updating immediately.
- Fixed a bug causing the app to crash when uploading files larger than 10MB.

---

## [1.1.5] - 2023-10-10
### Added
- Two-factor authentication (2FA) support.

### Fixed
- Addressed minor UI glitches in the billing section.

---

## [1.1.0] - 2023-09-15
### Added
- Initial public release of the API.
- Comprehensive documentation available at \`/docs\`.`,
  }
];
