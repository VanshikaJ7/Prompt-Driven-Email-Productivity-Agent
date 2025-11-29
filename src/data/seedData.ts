export const defaultPrompts = [
  {
    name: 'categorization',
    content: 'You are an email triage assistant. Categorize each email into EXACTLY ONE of these categories: Important, To-Do, Newsletter, Spam. To-Do emails must include a direct request requiring user action. Important emails are time-sensitive or from key stakeholders. Newsletters are bulk or promotional content like marketing emails, digests, or announcements. Spam is unwanted or suspicious content such as scams or phishing. Respond with ONLY the category name: Important, To-Do, Newsletter, or Spam.',
    description: 'Categorizes incoming emails into predefined categories'
  },
  {
    name: 'action_item',
    content: 'Extract tasks from the email. Respond in JSON format: {"task": "description of the task", "deadline": "deadline if mentioned, otherwise empty string"}. If multiple tasks exist, return an array of task objects. If no tasks exist, return an empty array.',
    description: 'Extracts actionable tasks and deadlines from email content'
  },
  {
    name: 'auto_reply',
    content: 'If an email is a meeting request, draft a polite reply asking for an agenda. If it\'s a task request, acknowledge receipt and provide an estimated timeline. If it\'s informational, draft a brief acknowledgment. Keep the tone professional but friendly.',
    description: 'Generates contextually appropriate draft replies'
  }
];

export const mockEmails = [
  {
    sender: 'sarah.johnson@techcorp.com',
    sender_name: 'Sarah Johnson',
    subject: 'Q4 Planning Meeting - Action Required',
    body: 'Hi Team,\n\nWe need to schedule our Q4 planning meeting by end of this week. Please review the attached budget proposal and come prepared with your departmental goals.\n\nDeadline: Friday, 3 PM\n\nThanks,\nSarah',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'newsletter@techweekly.com',
    sender_name: 'Tech Weekly',
    subject: 'Your Weekly Tech Digest: AI Trends & More',
    body: 'Welcome to this week\'s edition of Tech Weekly!\n\nTop Stories:\n- AI adoption in enterprise\n- Cloud computing trends\n- Cybersecurity updates\n\nRead more on our website...\n\nUnsubscribe | Manage Preferences',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'suspicious@random-domain.xyz',
    sender_name: 'Prize Committee',
    subject: 'Congratulations! You\'ve Won $1,000,000',
    body: 'Dear Lucky Winner,\n\nYou have been selected to receive $1,000,000! Click here immediately to claim your prize. This offer expires in 24 hours!\n\nSend your bank details to claim...',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'mike.chen@company.com',
    sender_name: 'Mike Chen',
    subject: 'Code Review Request - Payment Module',
    body: 'Hey,\n\nCould you review the payment integration PR #234? It\'s blocking our release. Need your feedback by tomorrow morning.\n\nThe main changes are in src/payments/ directory.\n\nThanks!',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'hr@company.com',
    sender_name: 'HR Department',
    subject: 'Reminder: Submit Your Timesheet',
    body: 'Hello,\n\nThis is a friendly reminder to submit your timesheet for the current pay period by end of day Thursday.\n\nLogin to the HR portal to complete your submission.\n\nThank you,\nHR Team',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'deals@shoponline.com',
    sender_name: 'Shop Online',
    subject: 'Flash Sale: 50% Off Everything!',
    body: 'Don\'t miss out on our biggest sale of the year!\n\n50% OFF EVERYTHING\n\nUse code: FLASH50\nValid for 24 hours only\n\nShop Now | View Deals\n\nUnsubscribe',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'lisa.wong@partner.com',
    sender_name: 'Lisa Wong',
    subject: 'Partnership Proposal Discussion',
    body: 'Hi,\n\nI\'d like to schedule a call to discuss potential partnership opportunities between our companies. \n\nAre you available next week? Tuesday or Wednesday afternoon works best for me.\n\nLooking forward to connecting!\n\nBest regards,\nLisa',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'david.park@company.com',
    sender_name: 'David Park',
    subject: 'Project Update: Dashboard Redesign',
    body: 'Team,\n\nQuick update on the dashboard redesign:\n- Wireframes completed ✓\n- User testing scheduled for next week\n- Development starts Monday\n\nNo action needed from you, just keeping everyone in the loop.\n\nCheers,\nDavid',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'security@company.com',
    sender_name: 'IT Security',
    subject: 'URGENT: Security Certificate Expiring',
    body: 'ATTENTION REQUIRED\n\nYour security certificate expires in 3 days. Please renew immediately to avoid service disruption.\n\nAction Items:\n1. Review current certificate\n2. Submit renewal request\n3. Update DNS records\n\nDeadline: December 20th\n\nContact IT Security if you need assistance.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'events@industry.org',
    sender_name: 'Industry Conference',
    subject: 'Join Us at TechConf 2024',
    body: 'You\'re invited to TechConf 2024!\n\nDate: March 15-17, 2024\nLocation: San Francisco, CA\n\nEarly bird registration now open. Save 30% if you register before January 15th.\n\nFeatured speakers include industry leaders from top tech companies.\n\nRegister Now | View Agenda',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'jennifer.lee@client.com',
    sender_name: 'Jennifer Lee',
    subject: 'Bug Report: Login Issues',
    body: 'Hi Support Team,\n\nOur users are experiencing login issues since this morning. Getting "Session timeout" errors even with correct credentials.\n\nThis is affecting approximately 50 users. Can you please investigate ASAP?\n\nI can provide logs if needed.\n\nThanks,\nJennifer',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'admin@company.com',
    sender_name: 'Office Admin',
    subject: 'Office Closure Notice - Holiday Schedule',
    body: 'Dear Team,\n\nPlease note that our office will be closed for the following dates:\n\n- December 24-26: Christmas Holiday\n- January 1: New Year\'s Day\n\nEmergency contact information will be shared separately.\n\nBest regards,\nAdmin Team',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'tom.anderson@vendor.com',
    sender_name: 'Tom Anderson',
    subject: 'Invoice #INV-2024-001 Payment Reminder',
    body: 'Hello,\n\nThis is a friendly reminder that Invoice #INV-2024-001 for $5,000 is due on December 15th.\n\nPayment Details:\nAmount: $5,000\nDue Date: Dec 15, 2024\nInvoice: INV-2024-001\n\nPlease let me know if you have any questions.\n\nBest,\nTom',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'marketing@webinars.com',
    sender_name: 'Webinars Today',
    subject: 'Free Webinar: Modern Web Development',
    body: 'Register now for our free webinar!\n\nTopic: Modern Web Development Best Practices\nDate: January 10, 2024\nTime: 2:00 PM EST\n\nWhat you\'ll learn:\n- React 18 features\n- Performance optimization\n- Security best practices\n\nRegister Free | Add to Calendar',
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'rachel.kim@company.com',
    sender_name: 'Rachel Kim',
    subject: 'Team Lunch Next Friday?',
    body: 'Hey everyone!\n\nWould anyone be interested in a team lunch next Friday to celebrate completing the project?\n\nI\'m thinking Italian or Mexican food. Let me know your preferences and dietary restrictions.\n\nReply by Wednesday so I can make a reservation.\n\nCheers,\nRachel',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'support@cloudservice.com',
    sender_name: 'Cloud Service',
    subject: 'Scheduled Maintenance Notification',
    body: 'Important Service Notification\n\nWe will be performing scheduled maintenance on our infrastructure:\n\nDate: December 18, 2024\nTime: 2:00 AM - 4:00 AM EST\nExpected Downtime: 2 hours\n\nServices Affected:\n- API endpoints\n- Dashboard access\n\nPlease plan accordingly. We apologize for any inconvenience.\n\nStatus updates: status.cloudservice.com',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'alex.roberts@company.com',
    sender_name: 'Alex Roberts',
    subject: 'Documentation Update Required',
    body: 'Hi,\n\nThe API documentation needs to be updated to reflect the recent changes in v2.0.\n\nCan you update the following sections:\n1. Authentication flow\n2. New endpoints\n3. Deprecation notices\n\nDeadline: Next Monday\n\nLet me know if you have questions.\n\nThanks,\nAlex',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'finance@company.com',
    sender_name: 'Finance Department',
    subject: 'Q4 Expense Report Submission',
    body: 'Dear Team Members,\n\nPlease submit your Q4 expense reports by December 22nd for timely processing.\n\nRequired documents:\n- Receipts for all expenses\n- Completed expense form\n- Manager approval\n\nSubmit through the finance portal.\n\nThank you,\nFinance Team',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'maria.garcia@startup.com',
    sender_name: 'Maria Garcia',
    subject: 'Coffee Chat?',
    body: 'Hi!\n\nI came across your profile and would love to connect. I\'m working on an exciting startup in the AI space and think you might have valuable insights.\n\nWould you be open to a quick coffee chat? Virtual works too!\n\nBest,\nMaria',
    timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString()
  },
  {
    sender: 'noreply@github.com',
    sender_name: 'GitHub',
    subject: '[Repository] New Pull Request #156',
    body: 'Pull Request #156 opened by john-dev\n\nTitle: Add email validation to registration form\n\nDescription:\nThis PR adds client-side and server-side email validation to improve data quality.\n\nChanges:\n- Added regex validation\n- Updated tests\n- Updated documentation\n\nView Pull Request | Add Review',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  }
];
