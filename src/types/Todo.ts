export interface Todo {
  id: string;
  title: string;
  description: string;
  type: "global" | "workspace" | "code";
  status: "todo" | "inprogress" | "done" | "blocked";
  filePath?: string; // For code todos - path to the file containing the comment
  lineNumber?: number; // For code todos - line number of the comment
}
