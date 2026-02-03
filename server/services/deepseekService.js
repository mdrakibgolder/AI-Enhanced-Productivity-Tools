// DeepSeek AI Integration Service
const https = require('https');

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  }

  async chat(messages, options = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: options.model || 'deepseek-chat',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        stream: false
      });

      const url = new URL(this.baseUrl);
      const requestOptions = {
        hostname: url.hostname,
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(requestOptions, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.error) {
              reject(new Error(parsed.error.message || 'API Error'));
            } else {
              resolve(parsed.choices[0].message.content);
            }
          } catch (e) {
            reject(new Error('Failed to parse API response'));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  // Analyze a task and provide AI insights
  async analyzeTask(task) {
    try {
      const prompt = `Analyze this task and provide helpful insights in JSON format:
Task: "${task.title}"
Description: "${task.description || 'No description'}"
Priority: ${task.priority}
Due Date: ${task.dueDate || 'Not set'}

Respond with a JSON object containing:
{
  "suggestedCategory": "work|personal|learning|health|finance|other",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "estimatedMinutes": number,
  "priorityScore": 1-100,
  "tips": "Brief actionable tip for completing this task",
  "breakdownSteps": ["step1", "step2", "step3"]
}

Only respond with valid JSON, no other text.`;

      const response = await this.chat([
        { role: 'system', content: 'You are a productivity AI assistant. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Task Analysis Error:', error.message);
      return null;
    }
  }

  // Generate smart daily plan
  async generateDailyPlan(tasks, completedToday, focusMinutes) {
    try {
      const taskList = tasks.slice(0, 10).map(t => 
        `- ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate || 'No date'})`
      ).join('\n');

      const prompt = `Create a personalized daily productivity plan based on:

Pending Tasks:
${taskList || 'No pending tasks'}

Progress Today:
- Tasks completed: ${completedToday}
- Focus time: ${focusMinutes} minutes

Generate a motivating and practical daily plan in JSON format:
{
  "greeting": "Personalized morning/afternoon/evening greeting based on time",
  "motivationalMessage": "Brief inspiring message",
  "topPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "suggestedSchedule": [
    {"time": "9:00 AM", "activity": "Activity description", "duration": "30 min"}
  ],
  "productivityTip": "One actionable productivity tip",
  "encouragement": "Brief encouragement based on their progress"
}

Only respond with valid JSON.`;

      const response = await this.chat([
        { role: 'system', content: 'You are an encouraging productivity coach. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.7 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Daily Plan Error:', error.message);
      return null;
    }
  }

  // Smart task suggestions based on context
  async getSmartSuggestions(tasks, analytics) {
    try {
      const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 8);
      const taskSummary = pendingTasks.map(t => ({
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate,
        category: t.category
      }));

      const prompt = `Analyze these pending tasks and productivity data to provide smart suggestions:

Tasks: ${JSON.stringify(taskSummary)}
Productivity Score: ${analytics.productivityScore || 50}
Current Streak: ${analytics.streak || 0} days
Tasks Completed Today: ${analytics.tasksCompletedToday || 0}

Provide 3-4 actionable suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "priority|warning|tip|motivation",
      "icon": "🎯|⚠️|💡|🔥|⚡|📅",
      "title": "Short title",
      "message": "Helpful suggestion message",
      "actionLabel": "Action button text"
    }
  ],
  "nextBestAction": "What should the user do right now",
  "focusRecommendation": "Recommended focus session length and task"
}

Only respond with valid JSON.`;

      const response = await this.chat([
        { role: 'system', content: 'You are a smart productivity assistant. Analyze tasks and provide actionable insights. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.5 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Suggestions Error:', error.message);
      return null;
    }
  }

  // Summarize a note with AI
  async summarizeNote(content) {
    try {
      const prompt = `Summarize this note concisely in 2-3 sentences:

${content.substring(0, 2000)}

Respond with JSON:
{
  "summary": "Brief summary",
  "keyPoints": ["point1", "point2", "point3"],
  "suggestedTags": ["tag1", "tag2"]
}

Only respond with valid JSON.`;

      const response = await this.chat([
        { role: 'system', content: 'You are a helpful assistant that summarizes notes. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Summarize Error:', error.message);
      return null;
    }
  }

  // AI Chat for productivity coaching
  async productivityChat(message, context = {}) {
    try {
      const systemPrompt = `You are an AI productivity coach. Help users with:
- Task management and prioritization
- Time management strategies
- Focus and concentration tips
- Work-life balance advice
- Goal setting and achievement

Context about the user:
- Pending tasks: ${context.pendingTasks || 0}
- Completed today: ${context.completedToday || 0}
- Current streak: ${context.streak || 0} days
- Productivity score: ${context.productivityScore || 50}/100

Be concise, encouraging, and actionable. Keep responses under 150 words.`;

      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ], { temperature: 0.7, maxTokens: 300 });

      return response;
    } catch (error) {
      console.error('AI Chat Error:', error.message);
      return "I'm having trouble connecting right now. Try again in a moment!";
    }
  }

  // Parse natural language to create task
  async parseNaturalLanguageTask(input) {
    try {
      const prompt = `Parse this natural language input into a structured task:

Input: "${input}"

Extract task details and respond with JSON:
{
  "title": "Clear task title",
  "description": "Optional description if mentioned",
  "priority": "low|medium|high",
  "category": "work|personal|learning|health|finance|other",
  "dueDate": "YYYY-MM-DD or null if not mentioned",
  "estimatedTime": minutes as number or 30 as default,
  "tags": ["relevant", "tags"]
}

Today's date is ${new Date().toISOString().split('T')[0]}.
If "tomorrow" is mentioned, use tomorrow's date.
If "next week" is mentioned, use a date 7 days from now.

Only respond with valid JSON.`;

      const response = await this.chat([
        { role: 'system', content: 'You parse natural language into structured task data. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.2 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Parse Error:', error.message);
      return null;
    }
  }

  // Generate productivity insights
  async generateInsights(analytics, tasks) {
    try {
      const prompt = `Analyze this productivity data and generate personalized insights:

Weekly Stats:
${JSON.stringify(analytics.weeklyData || [], null, 2)}

Overall Stats:
- Tasks completed: ${analytics.tasksCompleted || 0}
- Productivity score: ${analytics.productivityScore || 50}
- Current streak: ${analytics.streak || 0} days
- Total focus time this week: ${analytics.totalFocusMinutes || 0} minutes

Task Distribution:
${JSON.stringify(analytics.categoryDistribution || [], null, 2)}

Generate 3-4 personalized insights in JSON format:
{
  "insights": [
    {
      "type": "achievement|improvement|pattern|suggestion",
      "icon": "🏆|📈|🎯|💡|⭐|🔥",
      "title": "Insight title",
      "message": "Detailed insight message",
      "metric": "Optional metric like '+15%' or '5 days'"
    }
  ],
  "overallAssessment": "Brief overall productivity assessment",
  "weeklyGoal": "Suggested goal for next week"
}

Only respond with valid JSON.`;

      const response = await this.chat([
        { role: 'system', content: 'You are a productivity analyst. Analyze data and provide actionable insights. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.5 });

      return JSON.parse(response.trim());
    } catch (error) {
      console.error('AI Insights Error:', error.message);
      return null;
    }
  }
}

module.exports = new DeepSeekService();
