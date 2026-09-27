export type Message = { id: string; role: "user" | "assistant"; content: string; time: string; demo?: boolean };
export type Conversation = { id: string; title: string; date: string; messages: Message[] };
export type SavedPrompt = { id: string; name: string; content: string };
export const projectAnswer = `Here are 5 full-stack project ideas using React, Node.js, and a database that are great for your portfolio and learning:

1. **Task Management App**
   - Features: user authentication, create/edit/delete tasks, categories, due dates, dark mode.
   - Tech: React, Node.js, Express, MongoDB (or MySQL).
2. **AI Prompt Playground**
   - Features: chat with LLM, save prompts, organize by tags, user accounts.
   - Tech: React, Node.js, OpenAI API, MongoDB.
3. **Personal Finance Tracker**
   - Features: track income/expenses, charts, budgets, categories.
   - Tech: React, Node.js, MongoDB, Chart.js.
4. **Blog Platform**
   - Features: write and publish posts, comments, likes, user profiles.
   - Tech: React, Node.js, Express, MongoDB.
5. **Job Tracker App**
   - Features: add/save job applications, track status, reminders, notes.
   - Tech: React, Node.js, MongoDB.

Would you like a detailed plan for any of these projects? I can break down the features, tech stack, and development steps.`;
export const seedChats: Conversation[] = [
  { id: "projects", title: "React project ideas", date: "Today, 1:24 AM", messages: [
    { id: "example-user", role: "user", content: "Give me 5 full-stack project ideas using React, Node.js and a database.", time: "1:24 AM" },
    { id: "example-assistant", role: "assistant", content: projectAnswer, time: "1:24 AM" },
  ] },
  { id: "rag", title: "Explain RAG", date: "Today, 12:10 AM", messages: [{ id: "rag-answer", role: "assistant", content: "**Retrieval-augmented generation (RAG)** gives a language model relevant information before it answers.\n\n1. Search your documents for relevant passages.\n2. Add those passages to the prompt as context.\n3. Ask the model to answer using that context.\n\nIt is useful when an assistant needs your own documentation or current information.", time: "12:10 AM" }] },
  { id: "resume", title: "Create a resume", date: "Sep 25, 2026", messages: [{ id: "resume-answer", role: "assistant", content: "Let's build a resume that makes your work easy to understand. Share your target role, experience, skills, and a few projects you are proud of.", time: "10:42 AM" }] },
  { id: "aws", title: "AWS interview questions", date: "Sep 24, 2026", messages: [{ id: "aws-answer", role: "assistant", content: "**Practice questions**\n\n1. What is the difference between EC2 and Lambda?\n2. How do you secure an S3 bucket?\n3. When would you use a relational database rather than DynamoDB?\n4. How would you design a highly available web application?", time: "4:18 PM" }] },
  { id: "javascript", title: "JavaScript concepts", date: "Sep 23, 2026", messages: [{ id: "js-answer", role: "assistant", content: "Which JavaScript concept would you like to explore? We can work through closures, promises, the event loop, array methods, or React state with examples.", time: "3:30 PM" }] },
];
