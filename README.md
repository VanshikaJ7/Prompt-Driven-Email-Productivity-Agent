# Email Productivity Agent

An intelligent, prompt-driven Email Productivity Agent that automates email management through AI-powered categorization, action-item extraction, auto-drafting replies, and chat-based inbox interaction.

## Features

- **Email Categorization**: Automatically categorize emails into Important, Newsletter, Spam, and To-Do
- **Action Item Extraction**: Extract tasks and deadlines from email content
- **Auto-Draft Replies**: Generate contextually appropriate draft replies
- **Email Agent Chat**: Interactive AI assistant for querying and managing your inbox
- **Prompt Configuration**: Customize the agent's behavior through user-defined prompts
- **Mock Inbox**: Pre-loaded with 20 diverse sample emails for testing

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **LLM**: Google Gemini API (via REST)
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- A Google Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd email-productivity-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (you can copy the example file):

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API
3. Copy the Project URL (VITE_SUPABASE_URL)
4. Copy the anon/public key (VITE_SUPABASE_ANON_KEY)

#### Getting Gemini API Key

1. Go to the Google AI Studio / Gemini console
2. Sign up or log in
3. Create an API key for the Generative Language API
4. Copy it and use it as `VITE_GEMINI_API_KEY`

### 4. Database Setup

The database schema is automatically created through Supabase migrations. The schema includes:

- `emails` - Stores inbox emails
- `prompts` - Stores user-defined prompt templates
- `action_items` - Stores extracted tasks from emails
- `drafts` - Stores generated email drafts
- `chat_history` - Stores chat interactions

All tables are configured with Row Level Security (RLS) and public access policies for demo purposes.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Loading the Mock Inbox

When you first run the application:

1. You'll see a welcome screen
2. Click "Load Mock Inbox & Initialize"
3. This will:
   - Load 20 sample emails into the database
   - Create 3 default prompt templates
   - Initialize the application

The mock inbox includes diverse email types:
- Meeting requests
- Code review requests
- Bug reports
- Newsletters
- Security alerts
- Team communications
- Spam/promotional emails

## Configuring Prompts

### Default Prompts

The application comes with three default prompts:

1. **Categorization Prompt**: Categorizes emails into Important, Newsletter, Spam, or To-Do
2. **Action Item Prompt**: Extracts tasks and deadlines in JSON format
3. **Auto-Reply Prompt**: Generates contextually appropriate draft replies

### Creating Custom Prompts

1. Navigate to the "Prompts" tab
2. Click "New Prompt"
3. Fill in:
   - **Name**: Unique identifier (e.g., `categorization`, `action_item`)
   - **Description**: Human-readable description
   - **Content**: The actual prompt instructions for the LLM
4. Click "Save Prompt"

### Editing Prompts

1. Go to the "Prompts" tab
2. Click the edit icon on any prompt
3. Modify the content or description
4. Click "Save Prompt"

## Usage Examples

### 1. Processing Emails

**Inbox Tab:**
1. Click "Process All" button
2. The agent will:
   - Categorize each email
   - Extract action items
   - Mark emails as processed
3. View results in the email list and detail view

### 2. Chat with Email Agent

**Email Agent Tab:**
1. Optionally select an email for context
2. Type your query:
   - "Summarize all urgent emails"
   - "What tasks do I need to do?"
   - "Show me all emails from Sarah"
   - "Draft a reply to the selected email"
3. The agent responds with relevant information

### 3. Managing Drafts

**Drafts Tab:**
1. Click "New Draft" to create a draft manually
2. Or select an email to reply to and click "Generate"
3. The agent will create a draft based on the auto-reply prompt
4. Edit the draft as needed
5. Click "Save Draft"

### 4. Filtering Emails

**Inbox Tab:**
- Use category filters to view:
  - All emails
  - Important only
  - To-Do only
  - Newsletters
  - Spam

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ChatView.tsx     # Email agent chat interface
│   │   ├── DraftsView.tsx   # Draft management
│   │   ├── EmailCard.tsx    # Email list item
│   │   ├── InboxView.tsx    # Email inbox viewer
│   │   ├── PromptsView.tsx  # Prompt configuration
│   │   └── SetupView.tsx    # Initial setup screen
│   ├── data/
│   │   └── seedData.ts      # Mock emails and default prompts
│   ├── lib/
│   │   └── supabase.ts      # Supabase client and types
│   ├── services/
│   │   ├── emailService.ts  # Email database operations
│   │   ├── llmService.ts    # LLM API integration
│   │   └── promptService.ts # Prompt database operations
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles
│   └── main.tsx             # Application entry point
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Architecture

### Frontend Architecture

- **UI Layer**: React components with Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Service Layer**: Modular services for database and LLM operations
- **Type Safety**: TypeScript for compile-time type checking

### Backend Architecture

- **Database**: Supabase (PostgreSQL) with automatic RLS
- **LLM Integration**: Google Gemini API via REST
- **Prompt-Driven**: All LLM operations use stored prompt templates

### Data Flow

1. **Email Ingestion**: Mock emails → Database
2. **Processing**: Email + Prompt → LLM → Results → Database
3. **Chat**: User query + Context → LLM → Response
4. **Drafts**: Email context + Prompt → LLM → Draft → Database

## Key Features Details

### Email Categorization

The categorization prompt analyzes email content and assigns one of four categories:
- **Important**: Time-sensitive or from key stakeholders
- **To-Do**: Direct requests requiring user action
- **Newsletter**: Bulk promotional content
- **Spam**: Unwanted or suspicious content

### Action Item Extraction

Extracts structured task information:
```json
{
  "task": "Review payment integration PR #234",
  "deadline": "Tomorrow morning"
}
```

### Auto-Reply Generation

Context-aware reply generation:
- Meeting requests → Ask for agenda
- Task requests → Acknowledge and provide timeline
- Informational → Brief acknowledgment

### Email Agent Chat

Conversational AI assistant that can:
- Summarize emails
- Query inbox by criteria
- Extract specific information
- Generate drafts on demand
- Answer questions about email content

## Safety Features

- **No Automatic Sending**: All generated emails are saved as drafts
- **Error Handling**: Graceful error messages for LLM failures
- **Data Validation**: Input validation before database operations
- **RLS Security**: Database-level security policies

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules dist
npm install
npm run build
```

### Database Connection Issues

- Verify Supabase credentials in `.env`
- Check if your Supabase project is active
- Ensure the migration has been applied

### LLM API Errors

- Verify Gemini API key is correct
- Check the key has sufficient quota
- Ensure internet connectivity

### UI Not Loading

```bash
# Check for console errors
# Verify all dependencies are installed
npm install

# Try rebuilding
npm run build
```

## Development

### Running Tests

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- LLM API calls may take 2-10 seconds depending on prompt complexity
- Processing all emails sequentially to avoid rate limits
- Database queries optimized with indexes

## Future Enhancements

- Real email provider integration (Gmail, Outlook)
- Email threading and conversation view
- Advanced filtering and search
- Bulk operations
- Email templates
- Scheduled sending
- Analytics dashboard

## Credits

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- Google Gemini API
- [Lucide Icons](https://lucide.dev/)
