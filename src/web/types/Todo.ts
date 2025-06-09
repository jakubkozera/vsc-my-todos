export interface Todo {
  id: string;
  title: string;
  description: string;
  type: "global" | "workspace";
  status: "todo" | "inprogress" | "done" | "blocked";
}
