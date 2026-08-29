export type Theme = "light" | "dark";

export type InlineContentType = "text" | "badge" | "code";

export type InlineContent = {
  type: InlineContentType;
  value: string;
};

export type RichTextFields = {
  text?: string;
  content?: InlineContent[];
};

export type HeadingAnswerBlock = RichTextFields & {
  type: "h4";
};

export type ParagraphAnswerBlock = RichTextFields & {
  type: "paragraph";
};

export type BoldAnswerBlock = RichTextFields & {
  type: "bold";
};

export type InfoAnswerBlock = RichTextFields & {
  type: "info";
};

export type WarningAnswerBlock = RichTextFields & {
  type: "warn";
};

export type BadgeAnswerBlock = RichTextFields & {
  type: "badge";
  value?: string;
};

export type CodeAnswerBlock = {
  type: "code";
  code?: string;
};

export type ListStyle = "ordered" | "unordered";

export type NestedList = {
  type: "list";
  style?: ListStyle;
  items?: ListItem[];
};

export type ListItem = string | number | InlineContent[] | NestedList;

export type ListAnswerBlock = NestedList;

export type RichTableCell = {
  text?: string;
  content?: InlineContent[];
};

export type TableCell = string | number | boolean | null | RichTableCell;

export type TableAnswerBlock = {
  type: "table";
  columns?: TableCell[];
  data?: TableCell[][];
};

export type AnswerBlock = HeadingAnswerBlock | ParagraphAnswerBlock | BoldAnswerBlock | InfoAnswerBlock | WarningAnswerBlock | BadgeAnswerBlock | CodeAnswerBlock | ListAnswerBlock | TableAnswerBlock;

export type TopicQuestion = {
  id: string;
  topic?: string;
  subTopic?: string;
  difficulty?: string;
  question: string;
  answer: AnswerBlock[];
  searchableText: string;
};

export type TopicOption = {
  title: string;
  slug: string;
  icon: string;
  alt: string;
};

export type TopicObj = {
  id: string;
  topic: string;
  subTopic: string;
  difficulty: string;
  question: string;
  answer: unknown[];
};
