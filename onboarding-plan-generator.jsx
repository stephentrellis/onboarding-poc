import { useState, useMemo, useCallback } from "react";

// ============================================================
// TEMPLATE SYSTEM
// Each template is a markdown fragment keyed by:
//   {phase}_{section}_{department}_{seniority}_{roleType}
// The app resolves templates with fallback:
//   exact match → dept+general seniority → general dept → universal
// In production, these would be loaded from .md files on disk.
// ============================================================

const DEPARTMENTS = [
  { id: "engineering", label: "Engineering", icon: "⚙️" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "sales", label: "Sales", icon: "📈" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "people_ops", label: "People Operations", icon: "🤝" },
  { id: "general", label: "Other / General", icon: "📋" },
];

const SENIORITY_LEVELS = [
  { id: "junior", label: "Junior / Entry-Level", desc: "0-2 years experience, learning the craft" },
  { id: "mid", label: "Mid-Level", desc: "2-5 years experience, growing independence" },
  { id: "senior", label: "Senior", desc: "5+ years experience, driving impact" },
  { id: "lead", label: "Lead / Principal", desc: "Domain expert, setting direction" },
];

const ROLE_TYPES = [
  { id: "ic", label: "Individual Contributor", desc: "Focused on execution and craft" },
  { id: "manager", label: "People Manager", desc: "Leading and developing a team" },
];

const WORK_MODES = [
  { id: "onsite", label: "On-site", desc: "Primarily working from the office" },
  { id: "hybrid", label: "Hybrid", desc: "Mix of office and remote" },
  { id: "remote", label: "Fully Remote", desc: "Working remotely full-time" },
];

// --------------- TEMPLATE CONTENT ---------------
// Organized as: TEMPLATES[phase][section] = { [key]: markdownString }
// Keys follow: department, department_seniority, department_roleType, universal

const TEMPLATES = {
  30: {
    goals: {
      engineering: `### Goals
- Complete all IT setup, tooling access, and environment configuration
- Understand the team's tech stack, architecture, and coding standards
- Build relationships with immediate team members and key cross-functional partners
- Complete first small contribution (bug fix or small feature) to build confidence with the codebase
- Understand the product roadmap and how engineering priorities align with business goals`,
      design: `### Goals
- Complete all IT setup and gain access to design tools (Figma, prototyping tools, design system)
- Understand the brand guidelines, design system, and existing component library
- Build relationships with immediate team members, product managers, and engineering partners
- Complete a small design task (e.g., component revision or minor UI improvement)
- Review existing product designs and understand the user research that informed them`,
      sales: `### Goals
- Complete all IT setup and gain access to CRM, sales tools, and communication platforms
- Understand the product/service offering, pricing, and competitive landscape
- Build relationships with immediate team members, sales leadership, and key partners
- Shadow at least 5 sales calls or demos to understand the sales process and buyer personas
- Learn the sales methodology, pipeline stages, and qualification criteria`,
      marketing: `### Goals
- Complete all IT setup and gain access to marketing platforms (CMS, analytics, email, social)
- Understand the brand voice, messaging framework, and content strategy
- Build relationships with immediate team members, sales, product, and creative partners
- Review current campaigns, content calendar, and marketing metrics/KPIs
- Understand the target audience, buyer personas, and customer journey`,
      people_ops: `### Goals
- Complete all IT setup and gain access to HRIS, ATS, and people operations platforms
- Understand current HR policies, benefits administration, and compliance requirements
- Build relationships with team members, department heads, and key org stakeholders
- Review current people programs (onboarding, performance management, engagement)
- Understand the employee lifecycle and the team's role in supporting each stage`,
      general: `### Goals
- Complete all IT setup, tooling access, and systems onboarding
- Understand the team's mission, current priorities, and how they connect to company objectives
- Build relationships with immediate team members and key cross-functional partners
- Complete a small initial project or task to build familiarity with workflows and tools
- Understand the team's communication norms, meeting cadence, and decision-making process`,
    },
    tasks: {
      engineering_junior: `### Tasks
- [ ] Complete local development environment setup (IDE, repos, Docker, CI/CD access)
- [ ] Read through onboarding documentation and architecture decision records
- [ ] Pair with a teammate on at least 3 sessions to understand codebase patterns
- [ ] Complete 1-2 starter tickets (bug fixes or small improvements) with code review
- [ ] Attend all team ceremonies (standups, sprint planning, retros) and observe the rhythm
- [ ] Set up 1:1s with each team member for introductions
- [ ] Review and bookmark key internal documentation, wikis, and runbooks
- [ ] Shadow an on-call rotation to understand operational practices`,
      engineering_mid: `### Tasks
- [ ] Complete local development environment setup and verify end-to-end workflow
- [ ] Review architecture documentation, system diagrams, and key service boundaries
- [ ] Pair with teammates to understand critical paths in the codebase
- [ ] Pick up 2-3 tickets of moderate complexity and ship with code review
- [ ] Attend all team ceremonies and begin contributing to technical discussions
- [ ] Set up 1:1s with team members and key cross-functional partners
- [ ] Identify one area that could use improvement — document initial thoughts
- [ ] Review monitoring/alerting setup and understand incident handling`,
      engineering_senior: `### Tasks
- [ ] Complete environment setup and validate the full development-to-deployment pipeline
- [ ] Deep-dive into architecture: review system design docs, service maps, and data flows
- [ ] Meet with tech leads and architects to understand technical vision and challenges
- [ ] Ship 2-3 meaningful contributions to demonstrate domain understanding
- [ ] Identify architectural or process improvements and begin socializing ideas
- [ ] Set up 1:1s with team members, engineering leadership, and product counterparts
- [ ] Review team's technical debt backlog and form a perspective on priorities
- [ ] Understand on-call, incident response, and reliability practices`,
      engineering_lead: `### Tasks
- [ ] Complete environment setup and gain deep access to architecture and infrastructure
- [ ] Conduct architecture deep-dives with current tech leads and principal engineers
- [ ] Review and assess current technical strategy, standards, and decision-making process
- [ ] Ship meaningful contributions while evaluating codebase health and patterns
- [ ] Begin identifying systemic improvements to architecture, tooling, or practices
- [ ] Set up 1:1s with engineering leadership, product leaders, and key IC contributors
- [ ] Review technical roadmap and begin forming a vision for your domain area
- [ ] Assess team's engineering culture and identify ways to elevate craft`,
      engineering_manager: `### Tasks
- [ ] Complete setup and gain access to project management, communication, and engineering tools
- [ ] Schedule 1:1s with every direct report to understand goals, challenges, and working styles
- [ ] Meet with peer managers, product leads, and engineering leadership
- [ ] Review team's current sprint/project commitments, velocity, and backlog health
- [ ] Observe 1-2 full sprint cycles to understand team rhythm and ceremonies
- [ ] Review team members' recent performance feedback and development plans
- [ ] Understand hiring pipeline, open headcount, and team capacity
- [ ] Shadow or review recent incident responses to understand operational maturity`,
      sales_junior: `### Tasks
- [ ] Complete CRM setup, learn pipeline management workflows
- [ ] Study product documentation, pricing sheets, and competitive battle cards
- [ ] Shadow at least 5 sales calls/demos with experienced reps
- [ ] Complete sales methodology training (provided by team lead)
- [ ] Build and organize initial prospect list with manager guidance
- [ ] Set up 1:1s with team members, sales enablement, and product marketing
- [ ] Practice and deliver first mock pitch/demo to manager for feedback
- [ ] Learn objection handling framework and practice common scenarios`,
      sales_mid: `### Tasks
- [ ] Complete CRM setup and review pipeline management processes
- [ ] Deep-dive into product offering, pricing, and competitive positioning
- [ ] Shadow 3-5 calls and begin running initial discovery calls with support
- [ ] Review existing customer accounts and understand key use cases
- [ ] Build initial territory plan and prioritize target accounts
- [ ] Set up 1:1s with team members, sales leadership, and cross-functional partners
- [ ] Understand the full sales cycle, from prospecting to close to handoff
- [ ] Begin outbound activity — aim for first qualified meetings by end of month`,
      sales_senior: `### Tasks
- [ ] Complete CRM setup and review historical pipeline data and win/loss analysis
- [ ] Deep-dive into product offering, positioning, and strategic differentiators
- [ ] Shadow 2-3 calls to calibrate, then begin running own calls
- [ ] Analyze territory and develop strategic prospecting plan
- [ ] Meet with sales leadership, marketing, product, and CS to understand GTM motion
- [ ] Review top customer accounts and understand retention/expansion drivers
- [ ] Identify quick-win opportunities in pipeline or territory
- [ ] Begin building pipeline — aim for qualified opportunities by end of month`,
      sales_lead: `### Tasks
- [ ] Complete CRM setup and conduct deep analysis of team pipeline and historical performance
- [ ] Master product positioning, competitive landscape, and strategic differentiators
- [ ] Observe team selling motions and begin identifying coaching opportunities
- [ ] Meet with sales leadership, marketing, product, CS, and finance stakeholders
- [ ] Review and assess current sales process, methodology adoption, and tooling
- [ ] Develop initial perspective on territory/account strategy optimization
- [ ] Identify quick wins for pipeline acceleration and deal progression
- [ ] Build relationships with key accounts and strategic prospects`,
      sales_manager: `### Tasks
- [ ] Complete CRM setup and review team pipeline, forecasting process, and historical data
- [ ] Schedule 1:1s with every direct report — understand their deals, goals, and development needs
- [ ] Meet with sales leadership, peer managers, and cross-functional partners
- [ ] Review team quota attainment, activity metrics, and pipeline health
- [ ] Observe team members on calls to understand selling skills and coaching opportunities
- [ ] Review comp plans, territory assignments, and headcount
- [ ] Understand forecasting methodology and commit process
- [ ] Attend deal reviews and begin forming perspective on pipeline quality`,
      general_junior: `### Tasks
- [ ] Complete all systems setup and tool access requests
- [ ] Read through team documentation, wikis, and process guides
- [ ] Set up 1:1s with each team member for introductions and context
- [ ] Shadow a teammate on 2-3 typical tasks to learn the workflow
- [ ] Complete one small, well-scoped task independently with manager support
- [ ] Attend all team meetings and observe how decisions are made
- [ ] Identify and bookmark key resources, contacts, and escalation paths
- [ ] Start a running doc of questions, observations, and ideas`,
      general_mid: `### Tasks
- [ ] Complete all systems setup and verify access to key tools and platforms
- [ ] Review team documentation, current projects, and priorities
- [ ] Set up 1:1s with team members and cross-functional collaborators
- [ ] Take ownership of 1-2 tasks or workstreams with moderate complexity
- [ ] Attend team meetings and begin contributing ideas and feedback
- [ ] Understand the team's goals, metrics, and how success is measured
- [ ] Identify one area where your prior experience could add value
- [ ] Document processes or knowledge gaps you discover during onboarding`,
      general_senior: `### Tasks
- [ ] Complete all systems setup and establish access to tools, data, and stakeholders
- [ ] Review strategic documents, team OKRs, and current initiatives in depth
- [ ] Set up 1:1s with team members, leadership, and cross-functional partners
- [ ] Take ownership of a meaningful workstream or project
- [ ] Identify opportunities for improvement — process, strategy, or execution
- [ ] Attend team meetings and actively contribute perspective from prior experience
- [ ] Understand decision-making frameworks, governance, and approval processes
- [ ] Develop a 30-day summary of observations and initial recommendations`,
      general_lead: `### Tasks
- [ ] Complete systems setup and gain access to strategic planning tools and data
- [ ] Conduct deep review of team strategy, OKRs, and performance data
- [ ] Set up 1:1s with leadership, key ICs, and cross-functional executives
- [ ] Begin driving a strategic initiative or high-impact workstream
- [ ] Assess current processes and identify systemic improvement opportunities
- [ ] Establish thought leadership by sharing perspectives in team forums
- [ ] Map the decision-making landscape and influence structures
- [ ] Prepare a 30-day strategic assessment with recommendations`,
      general_manager: `### Tasks
- [ ] Complete setup and gain access to all management, reporting, and communication tools
- [ ] Schedule 1:1s with every direct report to understand goals, challenges, and working styles
- [ ] Meet with peer managers, department leadership, and cross-functional partners
- [ ] Review team's current projects, priorities, and capacity
- [ ] Observe team dynamics in meetings and day-to-day interactions
- [ ] Review team members' recent performance feedback and development plans
- [ ] Understand hiring pipeline, open headcount, and budget
- [ ] Identify team strengths, gaps, and initial areas for improvement`,
      design_junior: `### Tasks
- [ ] Complete Figma/design tool setup and gain access to the design system
- [ ] Review brand guidelines, component library, and design patterns
- [ ] Shadow senior designers on 2-3 projects to learn the design process
- [ ] Complete one small design task (icon update, component refinement, etc.)
- [ ] Set up 1:1s with design team members and product/engineering partners
- [ ] Study user research findings and personas for the product
- [ ] Attend design critiques and observe the feedback process
- [ ] Review accessibility standards and inclusive design practices`,
      design_mid: `### Tasks
- [ ] Complete design tool setup and deep-dive into the design system
- [ ] Review current product designs, user flows, and recent research
- [ ] Take ownership of a design task or feature with moderate scope
- [ ] Set up 1:1s with design peers, product managers, and engineering leads
- [ ] Participate in design critiques — give and receive feedback
- [ ] Understand the design-to-development handoff process
- [ ] Review analytics/metrics for existing features to understand user behavior
- [ ] Identify one UX improvement opportunity and share a proposal`,
      design_senior: `### Tasks
- [ ] Complete tool setup and audit the current design system for consistency
- [ ] Deep-dive into product strategy, user research, and design vision
- [ ] Take ownership of a significant design initiative or feature area
- [ ] Meet with design leadership, product, engineering, and research
- [ ] Begin contributing to design system improvements and pattern libraries
- [ ] Lead or co-lead a design critique session
- [ ] Assess design process maturity and identify improvement opportunities
- [ ] Prepare initial perspective on design quality and strategic alignment`,
      design_lead: `### Tasks
- [ ] Complete tool setup and conduct comprehensive design system audit
- [ ] Review design strategy, vision, and team's creative direction
- [ ] Set up 1:1s with design leadership, product executives, and engineering leads
- [ ] Assess design team capabilities, workflows, and output quality
- [ ] Begin defining or refining design principles and quality standards
- [ ] Lead design critique sessions and establish feedback culture
- [ ] Evaluate design-to-development handoff and collaboration processes
- [ ] Develop initial vision for design system and creative direction`,
      design_manager: `### Tasks
- [ ] Complete setup and gain access to design, project management, and communication tools
- [ ] Schedule 1:1s with every direct report — understand skills, goals, and challenges
- [ ] Meet with product leadership, engineering managers, and research leads
- [ ] Review team's current project load, capacity, and design quality
- [ ] Observe design critiques and team collaboration patterns
- [ ] Review portfolio of recent work and design system health
- [ ] Understand hiring needs, team structure, and growth plans
- [ ] Assess design process and identify areas for improvement`,
      marketing_junior: `### Tasks
- [ ] Complete setup for CMS, email platform, analytics tools, and social media accounts
- [ ] Study brand guidelines, messaging framework, and content style guide
- [ ] Shadow teammates on 2-3 active campaigns or content projects
- [ ] Complete one small content piece or campaign task with manager review
- [ ] Set up 1:1s with team members, sales, and product marketing
- [ ] Review analytics dashboards and understand key marketing metrics
- [ ] Study current content calendar and editorial process
- [ ] Learn marketing automation workflows and lead scoring`,
      marketing_mid: `### Tasks
- [ ] Complete platform setup and verify access to analytics and reporting tools
- [ ] Deep-dive into current campaigns, performance data, and content strategy
- [ ] Take ownership of a campaign, content series, or marketing program
- [ ] Set up 1:1s with team members, sales, product, and agency partners
- [ ] Understand marketing-to-sales handoff and lead management process
- [ ] Review marketing tech stack and identify optimization opportunities
- [ ] Analyze past campaign performance and extract key learnings
- [ ] Begin contributing to content calendar and campaign planning`,
      marketing_senior: `### Tasks
- [ ] Complete platform setup and audit current marketing tech stack and data
- [ ] Review marketing strategy, budgets, and performance against goals
- [ ] Take ownership of a significant marketing initiative or channel
- [ ] Meet with marketing leadership, sales, product, and executive team
- [ ] Assess content strategy, brand consistency, and competitive positioning
- [ ] Identify quick-win optimization opportunities across channels
- [ ] Review attribution model and marketing-influenced pipeline metrics
- [ ] Develop initial perspective on strategy refinements and new opportunities`,
      marketing_lead: `### Tasks
- [ ] Complete setup and gain access to strategy documents, budgets, and analytics
- [ ] Conduct comprehensive review of marketing strategy, positioning, and performance
- [ ] Set up 1:1s with marketing leadership, product, sales, and executive stakeholders
- [ ] Assess team capabilities, marketing tech stack, and process maturity
- [ ] Begin defining or refining marketing strategy for your area of ownership
- [ ] Review competitive landscape and market trends in depth
- [ ] Evaluate brand positioning and messaging effectiveness
- [ ] Prepare strategic assessment with initial recommendations`,
      marketing_manager: `### Tasks
- [ ] Complete setup and gain access to all marketing platforms and reporting tools
- [ ] Schedule 1:1s with every direct report — understand skills, goals, and workload
- [ ] Meet with peer managers, sales leadership, product, and agency partners
- [ ] Review team's current campaigns, pipeline, and performance metrics
- [ ] Observe team workflows and collaboration patterns
- [ ] Review budget allocation, agency relationships, and vendor contracts
- [ ] Understand marketing-sales alignment and lead management process
- [ ] Assess team strengths, gaps, and initial improvement opportunities`,
      people_ops_junior: `### Tasks
- [ ] Complete HRIS, ATS, and benefits platform setup and training
- [ ] Review employee handbook, HR policies, and compliance documentation
- [ ] Shadow team members on key HR processes (onboarding, benefits questions, etc.)
- [ ] Complete one HR administration task independently with guidance
- [ ] Set up 1:1s with People team members and department liaisons
- [ ] Study current employee lifecycle processes and documentation
- [ ] Learn HRIS data entry, reporting, and common workflows
- [ ] Review upcoming HR calendar (open enrollment, reviews, etc.)`,
      people_ops_mid: `### Tasks
- [ ] Complete platform setup and audit access to all HR systems and data
- [ ] Review current people programs, policies, and compliance status
- [ ] Take ownership of a people operations process or program area
- [ ] Set up 1:1s with team members, department heads, and key stakeholders
- [ ] Understand employee relations processes and escalation paths
- [ ] Review engagement survey data and current action plans
- [ ] Assess onboarding experience from the new hire perspective (meta!)
- [ ] Identify one process improvement and develop a proposal`,
      people_ops_senior: `### Tasks
- [ ] Complete platform setup and conduct audit of HR systems, data, and processes
- [ ] Review people strategy, org design, and workforce planning documents
- [ ] Take ownership of a significant people program or strategic initiative
- [ ] Meet with People leadership, department heads, and executive team
- [ ] Assess compliance posture, risk areas, and policy gaps
- [ ] Review compensation philosophy, benefits strategy, and market positioning
- [ ] Evaluate DEI programs and employee experience initiatives
- [ ] Develop initial assessment of people operations maturity and priorities`,
      people_ops_lead: `### Tasks
- [ ] Complete setup and gain access to all HR platforms, analytics, and strategic documents
- [ ] Conduct comprehensive review of people strategy, programs, and organizational health
- [ ] Set up 1:1s with People leadership, executive team, and department heads
- [ ] Assess team capabilities, HR tech stack, and process maturity
- [ ] Begin defining or refining people strategy for your area of ownership
- [ ] Review employment law compliance, risk areas, and upcoming regulatory changes
- [ ] Evaluate total rewards strategy and competitive positioning
- [ ] Prepare strategic assessment with recommendations for People leadership`,
      people_ops_manager: `### Tasks
- [ ] Complete setup and gain access to all HR platforms, employee data, and reporting tools
- [ ] Schedule 1:1s with every direct report — understand their areas, challenges, and goals
- [ ] Meet with People leadership, department heads, and executive stakeholders
- [ ] Review team's current programs, projects, and operational workload
- [ ] Observe team dynamics and understand collaboration patterns
- [ ] Review HR metrics, engagement data, and program effectiveness
- [ ] Understand budget, vendor relationships, and resource allocation
- [ ] Assess team strengths, development areas, and structural needs`,
    },
    checkins: {
      universal: `### Check-in Cadence
- **Daily (Week 1):** 15-minute daily sync with manager or onboarding buddy
- **Twice weekly (Weeks 2-4):** 30-minute check-ins to discuss progress, blockers, and questions
- **End of Week 2:** Informal pulse check — "How are you feeling? What's unclear?"
- **End of Month 1:** Formal 30-day review — walk through this plan together, celebrate wins, adjust Phase 2 goals`,
    },
    resources: {
      engineering: `### Resources
- Architecture documentation and system diagrams
- Team wiki / knowledge base
- Coding standards and style guide
- CI/CD pipeline documentation
- On-call runbook and incident response playbook
- Product roadmap and backlog
- Recommended reading: team-specific technical deep-dives`,
      design: `### Resources
- Design system documentation and component library
- Brand guidelines and visual identity standards
- User research repository and persona documents
- Figma project files and design templates
- Accessibility guidelines and inclusive design resources
- Design critique guidelines and feedback frameworks
- Competitive design analysis and inspiration library`,
      sales: `### Resources
- Product documentation and demo environment access
- Competitive battle cards and market positioning docs
- Sales methodology training materials
- CRM guides and pipeline management best practices
- Customer case studies and success stories
- Pricing and packaging documentation
- Sales enablement content library`,
      marketing: `### Resources
- Brand style guide and messaging framework
- Content strategy documentation and editorial calendar
- Marketing analytics dashboards and KPI definitions
- Marketing tech stack documentation and access guides
- Campaign templates and creative asset library
- Buyer persona profiles and journey maps
- Competitive intelligence and market research`,
      people_ops: `### Resources
- Employee handbook and policy documentation
- HRIS and ATS user guides and training materials
- Benefits administration guides and vendor contacts
- Employment law compliance resources and calendar
- Performance management framework documentation
- Engagement survey data and historical trends
- HR metrics dashboards and reporting templates`,
      general: `### Resources
- Team wiki and documentation hub
- Company handbook and policies
- Org chart and stakeholder map
- Team OKRs and strategic plan
- Meeting recordings and key presentations
- Internal communication channels and norms guide
- Recommended contacts for common questions`,
    },
    metrics: {
      ic: `### Success Metrics
- Completed all systems setup and access by end of Week 1
- Met with all immediate team members by end of Week 2
- Delivered at least one completed task or contribution by end of Month 1
- Can articulate the team's mission, current priorities, and how their role contributes
- Manager and new hire both feel confident about the working relationship`,
      manager: `### Success Metrics
- Completed 1:1s with all direct reports and key stakeholders by end of Week 2
- Has a clear understanding of team dynamics, strengths, and development areas
- Can articulate current team priorities, commitments, and capacity
- Has identified 2-3 initial observations or opportunities for the team
- Direct reports feel heard and are optimistic about the new leadership`,
    },
    workmode: {
      remote: `### Remote Work Setup
- [ ] Verify home office setup: reliable internet, webcam, headset, ergonomic workspace
- [ ] Test all video conferencing tools and ensure audio/video quality
- [ ] Understand async communication norms — when to Slack, when to email, when to meet
- [ ] Set up virtual coffee chats with teammates to build relationships informally
- [ ] Clarify expectations around working hours, availability windows, and time zones
- [ ] Bookmark virtual team social events and optional get-togethers`,
      hybrid: `### Hybrid Work Setup
- [ ] Understand in-office schedule expectations and team norms for office days
- [ ] Set up both office workspace and home workspace
- [ ] Learn hot-desking or desk reservation system if applicable
- [ ] Understand which meetings/activities are best done in-person vs. remote
- [ ] Coordinate office days with teammates and manager for maximum overlap
- [ ] Review building access, parking, and office amenities guide`,
      onsite: `### On-site Setup
- [ ] Complete building access setup (badge, keys, parking, etc.)
- [ ] Tour the office — locate your desk, meeting rooms, kitchen, and common areas
- [ ] Meet the office/facilities team and understand support channels
- [ ] Set up your physical workspace (monitors, peripherals, etc.)
- [ ] Review office hours, visitor policy, and building amenities`,
    },
  },
  60: {
    goals: {
      engineering: `### Goals
- Take ownership of a meaningful feature or project and drive it forward
- Deepen understanding of system architecture and contribute to technical discussions
- Build productive working relationships across engineering and product teams
- Participate actively in code reviews — giving and receiving thoughtful feedback
- Develop a point of view on technical improvements or process optimizations`,
      design: `### Goals
- Own a significant design project from research through delivery
- Contribute to design system improvements and establish design patterns
- Build strong collaborative relationships with product and engineering
- Lead design critiques and mentor less experienced designers
- Develop a clear perspective on product UX quality and improvement opportunities`,
      sales: `### Goals
- Run sales calls and demos independently with increasing confidence
- Build a healthy pipeline with qualified opportunities at various stages
- Deepen product knowledge and tailor pitches to different buyer personas
- Develop working relationships with sales support functions (SE, marketing, CS)
- Close first deal or advance opportunities significantly through the pipeline`,
      marketing: `### Goals
- Own and execute marketing campaigns or programs with measurable results
- Deepen understanding of marketing analytics and optimize based on data
- Build strong cross-functional relationships with sales, product, and creative teams
- Contribute to content strategy and thought leadership initiatives
- Develop a perspective on channel effectiveness and resource allocation`,
      people_ops: `### Goals
- Own a people operations process or program and drive measurable improvements
- Build trusted relationships with department heads and managers across the org
- Contribute to policy updates, compliance initiatives, or program redesigns
- Develop data-driven insights into workforce trends and employee experience
- Become a go-to resource for HR questions within your area of ownership`,
      general: `### Goals
- Take ownership of a meaningful project or workstream and deliver results
- Build productive working relationships across the team and cross-functional partners
- Begin contributing ideas and improvements beyond assigned tasks
- Demonstrate growing independence — less reliance on manager for day-to-day decisions
- Develop a deeper understanding of how the team's work impacts business outcomes`,
    },
    tasks: {
      ic: `### Tasks
- [ ] Own and deliver a project or workstream with increasing autonomy
- [ ] Contribute to team planning and prioritization discussions
- [ ] Build relationships with cross-functional partners through collaboration
- [ ] Share knowledge with the team through documentation, presentations, or mentoring
- [ ] Identify and propose improvements to tools, processes, or workflows
- [ ] Seek feedback from peers and manager — develop a personal growth plan
- [ ] Take on stretch assignments that expand skills beyond current comfort zone
- [ ] Begin contributing to team culture (knowledge sharing, social events, etc.)`,
      manager: `### Tasks
- [ ] Establish your management rhythm — 1:1s, team meetings, skip-levels
- [ ] Conduct first round of lightweight performance check-ins with each direct report
- [ ] Implement one process improvement identified during your first 30 days
- [ ] Build relationships with cross-functional peers and stakeholders
- [ ] Begin coaching team members on specific skills or challenges
- [ ] Review and refine team goals, priorities, or ways of working
- [ ] Start building a hiring pipeline if headcount is open
- [ ] Present team updates or strategy to leadership`,
    },
    checkins: {
      universal: `### Check-in Cadence
- **Weekly:** 30-minute 1:1 with manager (standard cadence going forward)
- **Mid-phase (Day 45):** Check-in on plan progress — are goals still the right goals?
- **End of Month 2:** 60-day review — assess progress, discuss development areas, finalize Phase 3 goals`,
    },
    resources: {
      universal: `### Resources
- Continue leveraging Phase 1 resources
- Cross-functional team documentation and roadmaps
- Industry blogs, newsletters, and professional development content
- Internal training or learning platform courses relevant to role growth
- Peer mentorship or buddy system connections`,
    },
    metrics: {
      ic: `### Success Metrics
- Delivering work independently with appropriate quality and timeliness
- Actively contributing ideas in team meetings and planning sessions
- Receiving positive feedback from peers and cross-functional partners
- Demonstrating growing domain knowledge and business context
- Manager sees clear trajectory toward full productivity`,
      manager: `### Success Metrics
- Established consistent management cadence (1:1s, team meetings, etc.)
- Direct reports report feeling supported and clear on expectations
- Has implemented at least one meaningful process or culture improvement
- Building credibility with cross-functional peers and leadership
- Team performance is stable or improving under new leadership`,
    },
    workmode: {
      remote: `### Remote Adjustments
- [ ] Evaluate and refine async communication practices based on first month
- [ ] Schedule regular virtual social time with teammates
- [ ] Discuss any remote work challenges with manager and problem-solve together
- [ ] Ensure visibility — share progress proactively and participate in async channels`,
      hybrid: `### Hybrid Adjustments
- [ ] Evaluate which activities are most productive in-office vs. remote
- [ ] Optimize office days for high-collaboration activities
- [ ] Ensure consistent communication regardless of location
- [ ] Share feedback on hybrid experience with manager`,
      onsite: `### On-site Adjustments
- [ ] Explore cross-team lunch or coffee connections
- [ ] Attend company or office social events
- [ ] Optimize workspace for productivity (quiet time, collaboration zones)`,
    },
  },
  90: {
    goals: {
      engineering: `### Goals
- Operate as a fully contributing team member with clear ownership areas
- Drive technical decisions and contribute to architectural discussions
- Mentor or support newer team members where appropriate
- Deliver a significant project milestone or feature to production
- Articulate a clear development plan and growth trajectory with your manager`,
      design: `### Goals
- Operate as a fully contributing designer with clear ownership and influence
- Drive design decisions and shape product direction through design leadership
- Mentor team members and contribute to raising the bar on design quality
- Deliver a significant design project that impacts users and business metrics
- Establish a clear growth plan aligned with career aspirations`,
      sales: `### Goals
- Consistently hit or exceed activity and pipeline targets
- Close deals independently and manage the full sales cycle with confidence
- Develop and execute a territory or account strategy aligned with team goals
- Share learnings and contribute to team knowledge (playbooks, objection handling)
- Establish a clear development plan with manager for continued growth`,
      marketing: `### Goals
- Own marketing programs or channels and deliver measurable business impact
- Lead cross-functional initiatives and campaigns with confidence
- Contribute to marketing strategy and planning for upcoming quarters
- Establish yourself as a subject matter expert in your area of focus
- Define a clear growth plan and development goals with your manager`,
      people_ops: `### Goals
- Own people programs or processes and deliver measurable improvements
- Serve as a trusted advisor to managers and leaders across the organization
- Contribute to people strategy and planning for upcoming quarters
- Drive data-informed decisions about workforce and employee experience
- Establish a growth plan and development goals with your manager`,
      general: `### Goals
- Operate as a fully contributing team member with clear ownership and accountability
- Proactively identify and drive improvements to team processes or outcomes
- Build influence and credibility across the organization
- Deliver measurable results that align with team and company objectives
- Establish a clear development plan and growth trajectory with your manager`,
    },
    tasks: {
      ic: `### Tasks
- [ ] Lead or own a significant deliverable or project end-to-end
- [ ] Contribute to strategic planning and long-term thinking for the team
- [ ] Mentor or onboard another team member (pay it forward!)
- [ ] Document and share lessons learned from your onboarding experience
- [ ] Propose and begin executing on a meaningful improvement initiative
- [ ] Prepare for formal performance conversation (self-assessment, goals)
- [ ] Build your internal network beyond immediate team
- [ ] Define 6-month and 12-month career development goals with your manager`,
      manager: `### Tasks
- [ ] Conduct meaningful performance check-ins with development-focused feedback
- [ ] Implement team-level improvements to process, culture, or delivery
- [ ] Present team strategy or results to broader leadership
- [ ] Build and maintain a healthy hiring pipeline if applicable
- [ ] Establish yourself as a trusted partner to cross-functional leaders
- [ ] Document your management philosophy and share it with your team
- [ ] Plan team development and growth opportunities for the next quarter
- [ ] Define your own leadership development goals with your manager`,
    },
    checkins: {
      universal: `### Check-in Cadence
- **Weekly:** Standard 1:1 cadence continues
- **Day 75:** Pre-review check-in — discuss self-assessment, gather feedback from peers
- **Day 90:** Formal 90-day review — celebrate accomplishments, discuss development plan, transition from "onboarding" to "ongoing" growth`,
    },
    resources: {
      universal: `### Resources
- Continue leveraging all previous resources
- Leadership and professional development programs
- Industry conferences, meetups, or community groups
- Internal mentorship or sponsorship programs
- Career development framework and growth pathways`,
    },
    metrics: {
      ic: `### Success Metrics
- Consistently delivering quality work with minimal oversight
- Recognized by peers and stakeholders as a valuable contributor
- Has a clear understanding of role expectations and is meeting or exceeding them
- Actively contributing to team culture, knowledge sharing, and improvement
- Both manager and new hire are aligned on a forward-looking development plan`,
      manager: `### Success Metrics
- Team is performing well and reports high satisfaction with leadership
- Has established a clear management rhythm and team culture
- Cross-functional partners view the manager as a reliable, collaborative leader
- Has delivered at least one meaningful improvement to team or process
- Clear alignment with leadership on team direction and personal development`,
    },
    workmode: {
      remote: `### Remote Long-term
- [ ] Ensure you have strong async documentation habits established
- [ ] Plan for occasional in-person time (team offsite, company events, etc.)
- [ ] Continue investing in virtual relationship-building
- [ ] Share what's working/not working with People team to improve remote experience`,
      hybrid: `### Hybrid Long-term
- [ ] Establish a sustainable hybrid rhythm that maximizes productivity
- [ ] Model good hybrid practices for the team
- [ ] Provide feedback to leadership on hybrid work policies
- [ ] Ensure equal inclusion in decisions regardless of location`,
      onsite: `### On-site Long-term
- [ ] Expand your in-office network beyond immediate team
- [ ] Take advantage of in-person collaboration opportunities
- [ ] Contribute to office culture and community building
- [ ] Provide feedback on office environment and amenities`,
    },
  },
};

// --------------- TEMPLATE RESOLVER ---------------

function resolveTemplate(phase, section, dept, seniority, roleType) {
  const phaseTemplates = TEMPLATES[phase]?.[section];
  if (!phaseTemplates) return "";

  // Try specific keys in order of specificity
  const keys = [
    `${dept}_${seniority}`,
    `${dept}_${roleType}`,
    dept,
    `${roleType}`,
    "universal",
    "general",
  ];

  for (const key of keys) {
    if (phaseTemplates[key]) return phaseTemplates[key];
  }
  return "";
}

function buildPlan(config) {
  const { name, roleTitle, department, startDate, managerName, seniority, roleType, workMode } = config;

  const deptLabel = DEPARTMENTS.find((d) => d.id === department)?.label || department;

  let md = `# 30/60/90 Day Onboarding Plan\n\n`;
  md += `**New Team Member:** ${name || "___"}\n`;
  md += `**Role:** ${roleTitle || "___"}\n`;
  md += `**Department:** ${deptLabel}\n`;
  md += `**Start Date:** ${startDate || "___"}\n`;
  md += `**Manager:** ${managerName || "___"}\n\n---\n\n`;
  md += `Welcome to the team${name ? `, ${name}` : ""}! This onboarding plan is designed to set you up for success in your first 90 days. It outlines clear goals, tasks, and milestones across three phases so you know exactly what to expect and how you'll be supported along the way.\n\n`;
  md += `Your manager will check in with you regularly to discuss progress, answer questions, and adjust the plan as needed. This is a living document — use it as a guide, not a rigid script.\n\n`;

  const phases = [
    { num: 30, title: "Phase 1: First 30 Days — Learn & Absorb" },
    { num: 60, title: "Phase 2: Days 31–60 — Build & Contribute" },
    { num: 90, title: "Phase 3: Days 61–90 — Own & Lead" },
  ];

  for (const phase of phases) {
    md += `---\n\n## ${phase.title}\n\n`;
    const goals = resolveTemplate(phase.num, "goals", department, seniority, roleType);
    const tasks = resolveTemplate(phase.num, "tasks", department, seniority, roleType);
    const checkins = resolveTemplate(phase.num, "checkins", department, seniority, roleType);
    const resources = resolveTemplate(phase.num, "resources", department, seniority, roleType);
    const metrics = resolveTemplate(phase.num, "metrics", department, seniority, roleType);
    const workmode = resolveTemplate(phase.num, "workmode", department, seniority, workMode);

    if (goals) md += goals + "\n\n";
    if (tasks) md += tasks + "\n\n";
    if (workmode) md += workmode + "\n\n";
    if (checkins) md += checkins + "\n\n";
    if (resources) md += resources + "\n\n";
    if (metrics) md += metrics + "\n\n";
  }

  return md;
}

// --------------- MARKDOWN RENDERER ---------------

function renderMarkdown(md) {
  if (!md) return "";
  let html = md;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 style="color:#232123;font-family:Questrial,Helvetica Neue,sans-serif;font-size:16px;font-weight:600;margin:20px 0 10px 0">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="color:#232123;font-family:Questrial,Helvetica Neue,sans-serif;font-size:22px;font-weight:600;margin:32px 0 16px 0;padding-bottom:8px;border-bottom:2px solid #63f2cc">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="color:#232123;font-family:Questrial,Helvetica Neue,sans-serif;font-size:28px;font-weight:600;margin:0 0 20px 0">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0ded6;margin:24px 0"/>');

  // Checkboxes
  html = html.replace(
    /^- \[ \] (.+)$/gm,
    '<div style="display:flex;align-items:flex-start;gap:8px;margin:6px 0;padding:6px 10px;background:#f6f6f4;border-radius:6px"><span style="color:#4c8ca2;font-size:16px;flex-shrink:0">☐</span><span style="color:#232123;font-size:14px;line-height:1.5">$1</span></div>'
  );

  // Regular list items
  html = html.replace(
    /^- (.+)$/gm,
    '<div style="display:flex;align-items:flex-start;gap:8px;margin:4px 0"><span style="color:#63f2cc;font-size:12px;margin-top:5px;flex-shrink:0">●</span><span style="color:#232123;font-size:14px;line-height:1.5">$1</span></div>'
  );

  // Paragraphs
  html = html.replace(/\n\n/g, '<div style="margin:12px 0"></div>');

  return html;
}

// --------------- WIZARD STEPS ---------------

function StepInfo({ config, setConfig }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ color: "#232123", fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
          Let's start with the basics about the new hire. This information will be used to personalize the onboarding plan.
        </p>
      </div>
      {[
        { key: "name", label: "New Hire's Name", placeholder: "e.g. Alex Johnson" },
        { key: "roleTitle", label: "Role Title", placeholder: "e.g. Senior Frontend Engineer" },
        { key: "startDate", label: "Start Date", placeholder: "e.g. April 1, 2026", type: "date" },
        { key: "managerName", label: "Manager's Name", placeholder: "e.g. Sarah Chen" },
      ].map((field) => (
        <div key={field.key}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4c8ca2", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            {field.label}
          </label>
          <input
            type={field.type || "text"}
            value={config[field.key] || ""}
            onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1.5px solid #e0ded6",
              fontSize: 15,
              fontFamily: "Helvetica Neue, sans-serif",
              color: "#232123",
              background: "#fff",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#63f2cc")}
            onBlur={(e) => (e.target.style.borderColor = "#e0ded6")}
          />
        </div>
      ))}
    </div>
  );
}

function StepSelect({ title, description, options, value, onChange, columns = 2 }) {
  return (
    <div>
      <p style={{ color: "#232123", fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 4,
                padding: "16px 18px",
                borderRadius: 10,
                border: selected ? "2px solid #63f2cc" : "2px solid #e0ded6",
                background: selected ? "#edfdf8" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                boxShadow: selected ? "0 0 0 3px rgba(99,242,204,0.15)" : "none",
              }}
            >
              {opt.icon && <span style={{ fontSize: 24, marginBottom: 2 }}>{opt.icon}</span>}
              <span style={{ fontWeight: 600, color: "#232123", fontSize: 15 }}>{opt.label}</span>
              {opt.desc && <span style={{ fontSize: 13, color: "#6b6969", lineHeight: 1.4 }}>{opt.desc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPreview({ config, markdown, setMarkdown }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1.5px solid #4c8ca2",
            background: editing ? "#4c8ca2" : "#fff",
            color: editing ? "#fff" : "#4c8ca2",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {editing ? "Preview" : "Edit Markdown"}
        </button>
        <button
          onClick={handleCopy}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1.5px solid #63f2cc",
            background: copied ? "#63f2cc" : "#fff",
            color: copied ? "#232123" : "#4c8ca2",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {copied ? "Copied!" : "Copy Markdown"}
        </button>
      </div>

      {editing ? (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          style={{
            width: "100%",
            minHeight: 500,
            padding: 16,
            borderRadius: 8,
            border: "1.5px solid #e0ded6",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.6,
            color: "#232123",
            background: "#f6f6f4",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            padding: "24px 28px",
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e0ded6",
            maxHeight: 600,
            overflowY: "auto",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
        />
      )}
    </div>
  );
}

// --------------- MAIN APP ---------------

const STEPS = [
  { id: "info", label: "New Hire Info", num: 1 },
  { id: "department", label: "Department", num: 2 },
  { id: "seniority", label: "Seniority", num: 3 },
  { id: "roleType", label: "Role Type", num: 4 },
  { id: "workMode", label: "Work Mode", num: 5 },
  { id: "preview", label: "Review Plan", num: 6 },
];

export default function OnboardingPlanGenerator() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    name: "",
    roleTitle: "",
    startDate: "",
    managerName: "",
    department: "",
    seniority: "",
    roleType: "",
    workMode: "",
  });
  const [markdown, setMarkdown] = useState("");

  const currentStep = STEPS[step];

  const canProceed = useMemo(() => {
    switch (currentStep.id) {
      case "info":
        return config.name && config.roleTitle;
      case "department":
        return !!config.department;
      case "seniority":
        return !!config.seniority;
      case "roleType":
        return !!config.roleType;
      case "workMode":
        return !!config.workMode;
      default:
        return true;
    }
  }, [currentStep.id, config]);

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      if (STEPS[nextStep].id === "preview") {
        setMarkdown(buildPlan(config));
      }
      setStep(nextStep);
    }
  }, [step, config]);

  const goBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const startOver = useCallback(() => {
    setStep(0);
    setConfig({ name: "", roleTitle: "", startDate: "", managerName: "", department: "", seniority: "", roleType: "", workMode: "" });
    setMarkdown("");
  }, []);

  const renderStep = () => {
    switch (currentStep.id) {
      case "info":
        return <StepInfo config={config} setConfig={setConfig} />;
      case "department":
        return (
          <StepSelect
            description="Which department is this new hire joining? This determines the department-specific goals, tasks, and resources in the plan."
            options={DEPARTMENTS}
            value={config.department}
            onChange={(v) => setConfig({ ...config, department: v })}
            columns={2}
          />
        );
      case "seniority":
        return (
          <StepSelect
            description="What level is the new hire coming in at? This adjusts the expectations, task complexity, and autonomy in the plan."
            options={SENIORITY_LEVELS}
            value={config.seniority}
            onChange={(v) => setConfig({ ...config, seniority: v })}
            columns={2}
          />
        );
      case "roleType":
        return (
          <StepSelect
            description="Is this person joining as an individual contributor or a people manager? This changes the focus of goals and success metrics."
            options={ROLE_TYPES}
            value={config.roleType}
            onChange={(v) => setConfig({ ...config, roleType: v })}
            columns={2}
          />
        );
      case "workMode":
        return (
          <StepSelect
            description="How will this person be working? This adds setup steps and tips specific to their work arrangement."
            options={WORK_MODES}
            value={config.workMode}
            onChange={(v) => setConfig({ ...config, workMode: v })}
            columns={3}
          />
        );
      case "preview":
        return <StepPreview config={config} markdown={markdown} setMarkdown={setMarkdown} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#edebe3", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#232123", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#63f2cc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#232123" }}>Z</div>
          <div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, fontFamily: "Questrial, Helvetica Neue, sans-serif" }}>Onboarding Plan Generator</div>
            <div style={{ color: "#63f2cc", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>30 / 60 / 90 Day Plan Builder</div>
          </div>
        </div>
        {step > 0 && (
          <button
            onClick={startOver}
            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 12 }}
          >
            Start Over
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0ded6", padding: "16px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, maxWidth: 700, margin: "0 auto" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: i < step ? "pointer" : "default",
                  opacity: i <= step ? 1 : 0.4,
                }}
                onClick={() => { if (i < step) setStep(i); }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: i < step ? "#63f2cc" : i === step ? "#232123" : "#e0ded6",
                    color: i < step ? "#232123" : i === step ? "#fff" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i < step ? "✓" : s.num}
                </div>
                <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 400, color: "#232123", whiteSpace: "nowrap", display: i === step || window.innerWidth > 600 ? "inline" : "none" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? "#63f2cc" : "#e0ded6", margin: "0 8px", minWidth: 12 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 24px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "32px 36px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            border: "1px solid #e0ded6",
          }}
        >
          <h2 style={{ fontFamily: "Questrial, Helvetica Neue, sans-serif", fontSize: 22, fontWeight: 600, color: "#232123", margin: "0 0 4px 0" }}>
            {currentStep.label}
          </h2>
          <div style={{ width: 40, height: 3, background: "#63f2cc", borderRadius: 2, marginBottom: 24 }} />

          {renderStep()}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #f0eee6" }}>
            <button
              onClick={goBack}
              disabled={step === 0}
              style={{
                padding: "10px 22px",
                borderRadius: 8,
                border: "1.5px solid #e0ded6",
                background: "#fff",
                color: step === 0 ? "#ccc" : "#232123",
                cursor: step === 0 ? "default" : "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={goNext}
                disabled={!canProceed}
                style={{
                  padding: "10px 28px",
                  borderRadius: 8,
                  border: "none",
                  background: canProceed ? "#232123" : "#e0ded6",
                  color: canProceed ? "#63f2cc" : "#999",
                  cursor: canProceed ? "pointer" : "default",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                Next →
              </button>
            )}
            {step === STEPS.length - 1 && (
              <button
                onClick={startOver}
                style={{
                  padding: "10px 28px",
                  borderRadius: 8,
                  border: "none",
                  background: "#63f2cc",
                  color: "#232123",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Create Another Plan
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0", color: "#999", fontSize: 12 }}>
          Powered by Zaelab · Templates are customizable via markdown files
        </div>
      </div>
    </div>
  );
}
