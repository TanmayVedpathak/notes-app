import { memo, type ReactNode } from "react";

import type { AnswerBlock, InlineContent, ListAnswerBlock, ListItem, RichTextFields, TableAnswerBlock, TableCell } from "@/types";

import CodeBlock from "./CodeBlock";

type AnswerRendererProps = {
  answer: AnswerBlock[];
};

function renderInline(content: InlineContent[] = []): ReactNode[] {
  return content.map((item, index) => {
    const key = `${item.type}-${index}`;

    switch (item.type) {
      case "text":
        return <span key={key}>{item.value}</span>;

      case "badge":
        return (
          <span key={key} className="rounded bg-amber-300 px-1 text-gray-900 dark:bg-yellow-600 dark:text-white">
            {item.value}
          </span>
        );

      case "code":
        return (
          <code key={key} className="rounded bg-gray-200 px-1 font-mono text-sm dark:bg-gray-700">
            {item.value}
          </code>
        );
    }
  });
}

function renderRichText(block: RichTextFields): ReactNode {
  if (block.content?.length) {
    return renderInline(block.content);
  }

  return block.text ?? "";
}

function renderListItem(item: ListItem, index: number): ReactNode {
  if (Array.isArray(item)) {
    return <li key={index}>{renderInline(item)}</li>;
  }

  if (typeof item === "object" && item.type === "list") {
    const ListTag = item.style === "ordered" ? "ol" : "ul";
    const listClassName = item.style === "ordered" ? "list-decimal space-y-1 pl-8" : "list-[circle] space-y-1 pl-8";

    return (
      <li key={index} className="list-none">
        <ListTag className={listClassName}>{(item.items ?? []).map(renderListItem)}</ListTag>
      </li>
    );
  }

  return <li key={index}>{String(item)}</li>;
}

function renderList(block: ListAnswerBlock, key: number): ReactNode {
  const ListTag = block.style === "ordered" ? "ol" : "ul";
  const className = block.style === "ordered" ? "list-decimal space-y-1 pl-8 text-gray-800 dark:text-gray-200" : "list-disc space-y-1 pl-8 text-gray-800 dark:text-gray-200";

  return (
    <ListTag key={key} className={className}>
      {(block.items ?? []).map(renderListItem)}
    </ListTag>
  );
}

function renderTableCell(cell: TableCell): ReactNode {
  if (cell === null) return "";

  if (typeof cell !== "object") {
    return String(cell);
  }

  if (cell.content?.length) {
    return renderInline(cell.content);
  }

  return cell.text ?? "";
}

function renderTable(block: TableAnswerBlock, key: number): ReactNode {
  return (
    <div key={key} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {(block.columns ?? []).map((column, index) => (
              <th key={index} scope="col" className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                {renderTableCell(column)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {(block.data ?? []).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-2 text-gray-700 dark:text-gray-200">
                  {renderTableCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AnswerRenderer = memo(function AnswerRenderer({ answer }: AnswerRendererProps) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {answer.map((block, index) => {
        switch (block.type) {
          case "h4":
            return (
              <h4 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {renderRichText(block)}
              </h4>
            );

          case "paragraph":
            return (
              <p key={index} className="text-gray-800 dark:text-gray-200">
                {renderRichText(block)}
              </p>
            );

          case "bold":
            return (
              <p key={index} className="mt-2 font-bold text-gray-900 dark:text-white">
                {renderRichText(block)}
              </p>
            );

          case "info":
            return (
              <div key={index} className="flex items-start gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200">
                <span className="text-lg" aria-hidden="true">
                  ℹ️
                </span>
                <p className="text-sm">{renderRichText(block)}</p>
              </div>
            );

          case "warn":
            return (
              <div key={index} className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                {renderRichText(block)}
              </div>
            );

          case "badge":
            return (
              <p key={index}>
                <span className="rounded bg-amber-300 px-1 text-gray-900 dark:bg-yellow-600 dark:text-white">{block.value ?? renderRichText(block)}</span>
              </p>
            );

          case "list":
            return renderList(block, index);

          case "code":
            return <CodeBlock key={index} code={block.code ?? ""} />;

          case "table":
            return renderTable(block, index);
        }
      })}
    </div>
  );
});

export default AnswerRenderer;
