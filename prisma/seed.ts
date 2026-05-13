import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Mission Templates ───────────────────────────────────────────────

  const missionTemplates = [
    {
      type: 'SURVEY_BUILDER',
      title: 'Post-Installation Survey Design',
      description:
        'A software installation has just been completed for a client. Design a follow-up survey to assess satisfaction, identify issues, and gather improvement suggestions.',
      difficulty: 'BEGINNER',
      estimatedMin: 15,
      scenarioData: {
        client: {
          name: 'Greenfield Medical Centre',
          contact: 'Dr. Amanda Lee',
          industry: 'Healthcare',
          size: 'Medium (50-100 staff)',
        },
        context:
          'A new patient management system was installed 3 days ago. The IT team needs to survey staff about their experience with the new system to catch issues early.',
        requiredSurveyTopics: [
          {
            topic: 'System Usability',
            description: 'How easy staff find the new interface',
            suggestedQuestions: 3,
          },
          {
            topic: 'Training Adequacy',
            description: 'Whether the training sessions prepared them',
            suggestedQuestions: 2,
          },
          {
            topic: 'Performance Issues',
            description: 'Any slowdowns, crashes, or errors encountered',
            suggestedQuestions: 3,
          },
          {
            topic: 'Feature Requests',
            description: 'Missing features or improvements desired',
            suggestedQuestions: 2,
          },
        ],
        constraints: [
          'Survey must take under 5 minutes to complete',
          'Must include at least one open-ended question',
          'Avoid technical jargon — staff are not IT professionals',
        ],
      },
      scoringRubric: {
        criteria: [
          { name: 'Question Clarity', weight: 25, description: 'Questions are clear and unambiguous' },
          { name: 'Topic Coverage', weight: 25, description: 'All required topics are addressed' },
          { name: 'Question Type Variety', weight: 20, description: 'Mix of open, closed, Likert scale questions' },
          { name: 'Survey Length', weight: 15, description: 'Appropriate length — not too long, not too short' },
          { name: 'Professional Tone', weight: 15, description: 'Professional and respectful language' },
        ],
        maxScore: 100,
        passingScore: 60,
      },
    },
    {
      type: 'CUSTOMER_INTERVIEW',
      title: 'The Frustrated Teacher',
      description:
        'Interview a teacher who is experiencing ongoing IT issues. Use active listening and proper questioning techniques to uncover their real needs.',
      difficulty: 'INTERMEDIATE',
      estimatedMin: 20,
      scenarioData: {
        client: {
          name: 'Mrs. Sarah Chen',
          role: 'Senior English Teacher',
          school: 'Westfield Secondary College',
          personality: 'Polite but impatient; tends to downplay issues then vent when prompted',
          emotions: {
            initial: 'Frustrated',
            ifEmpathized: 'Relieved',
            ifDismissed: 'Angry',
            ifPressured: 'Defensive',
          },
          hiddenNeeds: [
            'The projector in Room 12 has been flickering for 2 weeks',
            'She needs a reliable way to display student work digitally',
            'The Wi-Fi drops during her Year 12 class every Thursday at 11am',
            'She has a parent-teacher night next week and needs printing to work',
          ],
          techLevel: 'Basic — uses email, projector, and printer only',
        },
        initialMessage:
          "Oh, you're from IT? Look, I put in a ticket weeks ago and nothing happened. I really don't have time for this — I have essays to mark.",
        dialogueStrategy: 'Start by acknowledging the frustration before asking questions. She will open up if she feels heard.',
        evaluationPoints: [
          'Did you acknowledge her frustration before diving into questions?',
          'Did you uncover the hidden Wi-Fi schedule issue?',
          'Did you find out about the parent-teacher night urgency?',
          'Did you use open-ended questions rather than yes/no?',
          'Did you avoid technical jargon?',
        ],
      },
      scoringRubric: {
        criteria: [
          { name: 'Active Listening', weight: 30, description: 'Acknowledged feelings, paraphrased concerns' },
          { name: 'Question Quality', weight: 25, description: 'Open-ended, relevant, well-timed questions' },
          { name: 'Hidden Needs Discovery', weight: 25, description: 'Uncovered all hidden requirements' },
          { name: 'Professionalism', weight: 10, description: 'Maintained professional tone throughout' },
          { name: 'Empathy', weight: 10, description: 'Showed genuine care for the client situation' },
        ],
        maxScore: 100,
        passingScore: 60,
      },
    },
    {
      type: 'FEEDBACK_ANALYSIS',
      title: 'Library System Feedback Review',
      description:
        'Analyse a set of user feedback from the new library management system. Categorise comments, identify patterns, and determine the priority issues.',
      difficulty: 'INTERMEDIATE',
      estimatedMin: 20,
      scenarioData: {
        system: 'LibraryPro 3.0',
        feedbackPeriod: '1 month post-launch',
        totalResponses: 47,
        feedbackItems: [
          { id: 1, text: 'The search function is really slow when looking up books by author', correctCategory: 'PERFORMANCE', sentiment: 'NEGATIVE' },
          { id: 2, text: 'Love the new cover art display on the catalogue!', correctCategory: 'UI_DESIGN', sentiment: 'POSITIVE' },
          { id: 3, text: "Can't figure out how to renew books online — the button is hidden", correctCategory: 'USABILITY', sentiment: 'NEGATIVE' },
          { id: 4, text: 'The system logged me out while I was mid-reservation and I lost everything', correctCategory: 'RELIABILITY', sentiment: 'NEGATIVE' },
          { id: 5, text: 'Would be great if we could save reading lists for later', correctCategory: 'FEATURE_REQUEST', sentiment: 'NEUTRAL' },
          { id: 6, text: 'Barcode scanner integration works perfectly now', correctCategory: 'HARDWARE', sentiment: 'POSITIVE' },
          { id: 7, text: 'Error message when trying to place a hold on an available book — says "item not found"', correctCategory: 'BUG', sentiment: 'NEGATIVE' },
          { id: 8, text: 'The overdue notice emails have the wrong due dates', correctCategory: 'BUG', sentiment: 'NEGATIVE' },
          { id: 9, text: 'Training session was helpful but the quick-start guide needs updating', correctCategory: 'DOCUMENTATION', sentiment: 'NEUTRAL' },
          { id: 10, text: 'Mobile version is basically unusable — text overlaps and buttons are too small', correctCategory: 'USABILITY', sentiment: 'NEGATIVE' },
          { id: 11, text: 'Love the dark mode option!', correctCategory: 'UI_DESIGN', sentiment: 'POSITIVE' },
          { id: 12, text: 'Reports take over 5 minutes to generate for monthly statistics', correctCategory: 'PERFORMANCE', sentiment: 'NEGATIVE' },
        ],
        categories: ['PERFORMANCE', 'USABILITY', 'RELIABILITY', 'BUG', 'UI_DESIGN', 'FEATURE_REQUEST', 'HARDWARE', 'DOCUMENTATION'],
        priorityGuidance: 'Bugs affecting core functionality should be highest priority. Performance issues that affect daily workflows are second. UI/UX improvements come third.',
      },
      scoringRubric: {
        criteria: [
          { name: 'Categorisation Accuracy', weight: 35, description: 'Correct category assigned to each feedback item' },
          { name: 'Sentiment Accuracy', weight: 20, description: 'Correct sentiment (positive/negative/neutral) identified' },
          { name: 'Priority Assessment', weight: 25, description: 'Issues prioritised correctly based on impact' },
          { name: 'Pattern Recognition', weight: 10, description: 'Identified recurring themes across feedback' },
          { name: 'Actionable Insights', weight: 10, description: 'Provided concrete, actionable recommendations' },
        ],
        maxScore: 100,
        passingScore: 60,
      },
    },
    {
      type: 'DIFFICULT_CLIENT',
      title: 'The Escalating Executive',
      description:
        'Handle a call from an executive who is demanding an immediate fix for a problem that requires investigation. De-escalate the situation while maintaining professional standards.',
      difficulty: 'ADVANCED',
      estimatedMin: 25,
      scenarioData: {
        client: {
          name: 'Mr. David Hargrove',
          role: 'Chief Financial Officer',
          company: 'Pacific Solutions Ltd',
          personality: 'Authoritative, impatient, used to getting immediate results',
          emotions: {
            initial: 'Angry',
            ifDeEscalated: 'Cautiously cooperative',
            ifArgued: 'Escalates to management',
            ifTooPassive: 'Loses respect, becomes more demanding',
          },
          situation: 'His laptop keeps freezing during video conference calls with international clients. This has happened 3 times this week during critical meetings.',
          escalationTriggers: [
            'Saying "I understand but..." — feels dismissive',
            'Quoting SLA response times — feels like bureaucracy',
            'Asking him to restart his laptop — he has already done this',
            'Saying you will "look into it" without a concrete next step',
          ],
          deEscalationStrategies: [
            'Acknowledge the business impact directly: "This is clearly affecting your client meetings"',
            'Provide a specific action with a timeline: "I will have a senior technician at your office within 2 hours"',
            'Give him control: "Would you prefer we schedule a full diagnostic during your lunch break or after hours?"',
            'Follow up proactively — call him back before the promised deadline with an update',
          ],
          hiddenInfo: 'The real issue is a VPN conflict with the video conferencing software — not the laptop itself. Previous tickets were closed as "no fault found" because the tech only checked the hardware.',
          realSolution: 'Update VPN client and add video conferencing app to the VPN split-tunnel exclusion list.',
        },
        initialMessage:
          "This is UNACCEPTABLE. I am losing THOUSANDS of dollars in deals because your department can't keep a simple laptop working. I want this FIXED. NOW. Not tomorrow, not after a ticket — NOW.",
        timePressure: 'His next international call is in 90 minutes.',
      },
      scoringRubric: {
        criteria: [
          { name: 'De-escalation', weight: 30, description: 'Successfully reduced client anger without being passive' },
          { name: 'Professionalism', weight: 20, description: 'Maintained composure and professional standards' },
          { name: 'Problem Ownership', weight: 20, description: 'Took ownership of the issue rather than deflecting' },
          { name: 'Concrete Actions', weight: 15, description: 'Provided specific next steps with timelines' },
          { name: 'Root Cause Identification', weight: 15, description: 'Identified or investigated the real underlying issue' },
        ],
        maxScore: 100,
        passingScore: 70,
      },
    },
    {
      type: 'SERVICE_IMPROVEMENT',
      title: 'IT Help Desk Improvement Plan',
      description:
        'Based on aggregated feedback data, create an improvement plan for the school IT help desk. Identify key areas, set priorities, and recommend actionable changes.',
      difficulty: 'ADVANCED',
      estimatedMin: 25,
      scenarioData: {
        service: 'School IT Help Desk',
        feedbackSummary: {
          totalTickets: 342,
          averageResolutionTime: '3.2 days',
          satisfactionScore: '62%',
          responseRate: '78%',
        },
        areasForImprovement: [
          {
            area: 'Response Time',
            current: 'Average first response: 8 hours',
            target: 'Average first response: 2 hours',
            feedback: '"I never know if anyone received my ticket" — multiple respondents',
            impact: 'HIGH — affects trust and user satisfaction',
          },
          {
            area: 'Communication Quality',
            current: 'Updates sent only on resolution',
            target: 'Updates at receipt, in-progress, and resolution stages',
            feedback: '"I had to keep following up to get any update" — 23 respondents',
            impact: 'HIGH — leads to duplicate tickets and frustration',
          },
          {
            area: 'Knowledge Base',
            current: 'No self-service resources available',
            target: 'Common issues documented with step-by-step guides',
            feedback: '"I just need to know how to connect to the printer — do I really need to log a ticket?"',
            impact: 'MEDIUM — would reduce ticket volume by estimated 30%',
          },
          {
            area: 'Staff Training',
            current: 'One technician handles all issues',
            target: 'Cross-trained team with specialisations',
            feedback: '"Different techs give different answers to the same problem"',
            impact: 'MEDIUM — consistency and resilience concern',
          },
          {
            area: 'Feedback Collection',
            current: 'No systematic feedback mechanism',
            target: 'Post-ticket survey with monthly reporting',
            feedback: '"I was never asked if the fix actually worked"',
            impact: 'LOW-MEDIUM — important for continuous improvement',
          },
        ],
        constraints: [
          'Budget is limited — focus on process improvements over new tools',
          'Only 2 full-time IT staff available',
          'Must be implementable within the current school term (10 weeks)',
        ],
        stakeholders: ['IT Staff', 'Teachers', 'Administration', 'Students'],
      },
      scoringRubric: {
        criteria: [
          { name: 'Priority Assessment', weight: 25, description: 'Correctly identified highest impact improvements' },
          { name: 'Actionability', weight: 25, description: 'Recommendations are specific and implementable' },
          { name: 'Constraint Awareness', weight: 20, description: 'Plan respects budget, staffing, and time constraints' },
          { name: 'Stakeholder Consideration', weight: 15, description: 'Addresses needs of all stakeholder groups' },
          { name: 'Measurability', weight: 15, description: 'Includes ways to measure improvement success' },
        ],
        maxScore: 100,
        passingScore: 60,
      },
    },
  ]

  for (const template of missionTemplates) {
    const created = await prisma.missionTemplate.create({ data: template })
    console.log(`  ✅ MissionTemplate: ${created.title} (${created.type})`)
  }

  // ─── Badges ──────────────────────────────────────────────────────────

  const badges = [
    {
      slug: 'first-steps',
      name: 'First Steps',
      description: 'Completed your first mission',
      icon: '🎮',
      requirement: 'Complete 1 mission',
      category: 'PROGRESSION',
      xpReward: 50,
    },
    {
      slug: 'sharp-listener',
      name: 'Sharp Listener',
      description: 'Achieved 90%+ accuracy in active listening exercises',
      icon: '👂',
      requirement: 'Get 90%+ on any listening exercise',
      category: 'SKILL',
      xpReward: 100,
    },
    {
      slug: 'question-master',
      name: 'Question Master',
      description: 'Used all question types correctly in a single interview',
      icon: '❓',
      requirement: 'Use open, closed, probing, and clarifying questions correctly',
      category: 'SKILL',
      xpReward: 100,
    },
    {
      slug: 'cool-under-pressure',
      name: 'Cool Under Pressure',
      description: 'Successfully de-escalated a difficult client without triggering further anger',
      icon: '🧊',
      requirement: 'Complete DIFFICULT_CLIENT without triggering escalation',
      category: 'SKILL',
      xpReward: 150,
    },
    {
      slug: 'survey-architect',
      name: 'Survey Architect',
      description: 'Created a survey that scored 90%+ on all rubric criteria',
      icon: '📋',
      requirement: 'Score 90%+ on SURVEY_BUILDER mission',
      category: 'SKILL',
      xpReward: 100,
    },
    {
      slug: 'data-detective',
      name: 'Data Detective',
      description: 'Correctly categorised all feedback items in an analysis mission',
      icon: '🔍',
      requirement: '100% categorisation accuracy on FEEDBACK_ANALYSIS',
      category: 'SKILL',
      xpReward: 120,
    },
    {
      slug: 'improvement-champion',
      name: 'Improvement Champion',
      description: 'Created an improvement plan that addressed all stakeholder needs',
      icon: '🏆',
      requirement: 'Score 80%+ on SERVICE_IMPROVEMENT mission',
      category: 'SKILL',
      xpReward: 150,
    },
    {
      slug: 'five-star-service',
      name: 'Five Star Service',
      description: 'Achieved maximum client satisfaction in any mission',
      icon: '⭐',
      requirement: 'Get 100% client satisfaction score',
      category: 'ACHIEVEMENT',
      xpReward: 200,
    },
    {
      slug: 'team-player',
      name: 'Team Player',
      description: 'Completed 5 co-op missions with different partners',
      icon: '🤝',
      requirement: 'Complete 5 COOP room missions',
      category: 'PROGRESSION',
      xpReward: 75,
    },
    {
      slug: 'ict-professional',
      name: 'ICT Professional',
      description: 'Completed all mission types at least once',
      icon: '💻',
      requirement: 'Complete one mission of each type: SURVEY_BUILDER, CUSTOMER_INTERVIEW, FEEDBACK_ANALYSIS, DIFFICULT_CLIENT, SERVICE_IMPROVEMENT',
      category: 'MASTERY',
      xpReward: 300,
    },
  ]

  for (const badge of badges) {
    const created = await prisma.badge.create({ data: badge })
    console.log(`  ✅ Badge: ${created.name} (${created.slug})`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log(`  ${missionTemplates.length} MissionTemplates created`)
  console.log(`  ${badges.length} Badges created`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
