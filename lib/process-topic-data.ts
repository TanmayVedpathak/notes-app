import type { AnswerBlock, InlineContent, ListAnswerBlock, ListItem, RichTableCell, TableCell, TopicQuestion } from "@/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeInlineContent(value: unknown): InlineContent[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];

    const type = item.type;
    const rawValue = item.value;

    if (type !== "text" && type !== "badge" && type !== "code") {
      return [];
    }

    if (typeof rawValue !== "string" && typeof rawValue !== "number") {
      return [];
    }

    return [{ type, value: String(rawValue) }];
  });
}

function normalizeListItem(value: unknown): ListItem | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    const content = normalizeInlineContent(value);
    return content.length ? content : null;
  }

  if (isRecord(value) && value.type === "list") {
    return normalizeListBlock(value);
  }

  return null;
}

function normalizeListBlock(value: UnknownRecord): ListAnswerBlock {
  const rawItems = Array.isArray(value.items) ? value.items : [];
  const items = rawItems.flatMap((item) => {
    const normalized = normalizeListItem(item);
    return normalized === null ? [] : [normalized];
  });

  return {
    type: "list",
    style: value.style === "ordered" ? "ordered" : "unordered",
    items,
  };
}

function normalizeTableCell(value: unknown): TableCell {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (!isRecord(value)) return "";

  const cell: RichTableCell = {};
  const text = optionalString(value.text);
  const content = normalizeInlineContent(value.content);

  if (text) cell.text = text;
  if (content.length) cell.content = content;

  return cell;
}

function normalizeAnswerBlock(value: unknown): AnswerBlock | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    return null;
  }

  const text = optionalString(value.text);
  const content = normalizeInlineContent(value.content);
  const richText = {
    ...(text ? { text } : {}),
    ...(content.length ? { content } : {}),
  };

  switch (value.type) {
    case "h4":
    case "h5":
    case "paragraph":
    case "bold":
    case "info":
    case "warn":
      return {
        type: value.type,
        ...richText,
      };

    case "badge":
      return {
        type: "badge",
        ...richText,
        ...(typeof value.value === "string" ? { value: value.value } : {}),
      };

    case "code":
      return {
        type: "code",
        code: typeof value.code === "string" ? value.code : "",
      };

    case "list":
      return normalizeListBlock(value);

    case "table": {
      const columns = Array.isArray(value.columns) ? value.columns.map(normalizeTableCell) : [];

      const data = Array.isArray(value.data) ? value.data.map((row) => (Array.isArray(row) ? row.map(normalizeTableCell) : [])) : [];

      return {
        type: "table",
        columns,
        data,
      };
    }

    default:
      return null;
  }
}

function inlineText(content: InlineContent[] | undefined): string {
  return content?.map((item) => item.value).join(" ") ?? "";
}

function listItemText(item: ListItem): string {
  if (typeof item === "string" || typeof item === "number") {
    return String(item);
  }

  if (Array.isArray(item)) {
    return inlineText(item);
  }

  return item.items?.map(listItemText).join(" ") ?? "";
}

function tableCellText(cell: TableCell): string {
  if (cell === null) return "";

  if (typeof cell === "string" || typeof cell === "number" || typeof cell === "boolean") {
    return String(cell);
  }

  return [cell.text ?? "", inlineText(cell.content)].filter(Boolean).join(" ");
}

export function extractTextFromBlock(block: AnswerBlock): string {
  switch (block.type) {
    case "h4":
    case "h5":
    case "paragraph":
    case "bold":
    case "info":
    case "warn":
      return [block.text ?? "", inlineText(block.content)].filter(Boolean).join(" ");

    case "badge":
      return [block.value ?? "", block.text ?? "", inlineText(block.content)].filter(Boolean).join(" ");

    case "code":
      return block.code ?? "";

    case "list":
      return block.items?.map(listItemText).join(" ") ?? "";

    case "table":
      return [...(block.columns ?? []).map(tableCellText), ...(block.data ?? []).flatMap((row) => row.map(tableCellText))].join(" ");
  }
}

export function processTopicData(data: unknown): TopicQuestion[] {
  if (!Array.isArray(data)) return [];

  return data.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const question = optionalString(item.question);
    if (!question) return [];

    const answer = Array.isArray(item.answer)
      ? item.answer.flatMap((block) => {
          const normalized = normalizeAnswerBlock(block);
          return normalized ? [normalized] : [];
        })
      : [];

    const rawId = item.id;
    const id = typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : `index-${index}`;

    const searchableText = [question, ...answer.map(extractTextFromBlock)].join(" ").toLocaleLowerCase();

    return [
      {
        id,
        question,
        answer,
        searchableText,
        topic: optionalString(item.topic),
        subTopic: optionalString(item.subTopic),
        difficulty: optionalString(item.difficulty),
      },
    ];
  });
}
