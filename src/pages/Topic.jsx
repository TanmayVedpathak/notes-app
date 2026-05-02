import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

import CopyImg from "../assets/copy.svg";
import TickImg from "../assets/tick.svg";
import HamburgerImg from "../assets/menu.svg";

const sanitizeCode = (code = "") => {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

const renderInline = (content = []) => {
  return content.map((item, i) => {
    switch (item.type) {
      case "text":
        return <span key={i}>{item.value}</span>;

      case "badge":
        return (
          <span key={i} className="rounded bg-yellow-200 px-1 text-gray-900 dark:bg-yellow-600 dark:text-white">
            {item.value}
          </span>
        );

      case "code":
        return (
          <code key={i} className="rounded bg-gray-200 px-1 font-mono text-sm dark:bg-gray-700">
            {item.value}
          </code>
        );

      default:
        return <span key={i}>{item.value}</span>;
    }
  });
};

const AnswerRenderer = React.memo(({ answer }) => {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {answer.map((block, index) => {
        switch (block.type) {
          case "h4":
            return (
              <h4 key={index} className="text-lg text-gray-800 dark:text-gray-200">
                {block.content ? renderInline(block.content) : block.text}
              </h4>
            );

          case "paragraph":
            return (
              <p key={index} className="text-gray-800 dark:text-gray-200">
                {block.content ? renderInline(block.content) : block.text}
              </p>
            );

          case "bold":
            return (
              <p key={index} className="mt-2 font-bold text-gray-900 dark:text-white">
                {block.content ? renderInline(block.content) : block.text}
              </p>
            );

          case "info":
            return (
              <div key={index} className="flex items-center gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200">
                <span className="text-lg">ℹ️</span>
                <p className="text-sm">{block.content ? renderInline(block.content) : block.text}</p>
              </div>
            );

          case "warn":
            return (
              <div key={index} className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                {block.content ? renderInline(block.content) : block.text}
              </div>
            );

          case "list":
            const renderItem = (item, i) => {
              if (Array.isArray(item)) {
                return <li key={i}>{renderInline(item)}</li>;
              }

              if (item.type === "list") {
                return <>{item.style === "ordered" ? <ol className="list-decimal pl-8">{item.items.map(renderItem)}</ol> : <ul className="list-[circle] pl-8">{item.items.map(renderItem)}</ul>}</>;
              }

              return <li key={i}>{item}</li>;
            };

            if (block.style === "ordered") {
              return (
                <ol key={index} className="list-decimal pl-6 space-y-1 text-gray-800 dark:text-gray-200">
                  {block.items.map(renderItem)}
                </ol>
              );
            }

            return (
              <ul key={index} className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200">
                {block.items.map(renderItem)}
              </ul>
            );

          case "code":
            return <CodeBlock key={index} code={block.code} />;

          case "table":
            return (
              <div key={index} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {block.columns.map((col, i) => (
                        <th key={i} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                          {col.content ? renderInline(col.content) : col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y dark:divide-gray-700">
                    {block.data.map((row, rIndex) => (
                      <tr key={rIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className="px-4 py-2 text-gray-700 dark:text-gray-200">
                            {cell.content ? renderInline(cell.content) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return block.type;
        }
      })}
    </div>
  );
});

const extractTextFromBlock = (block) => {
  let text = "";

  if (block.text) {
    text += " " + block.text;
  }

  if (block.content) {
    block.content.forEach((c) => {
      if (c.value) text += " " + c.value;
    });
  }

  if (block.type === "list" && block.items) {
    block.items.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((i) => {
          if (i.value) text += " " + i.value;
        });
      } else {
        text += " " + item;
      }
    });
  }

  if (block.type === "code" && block.code) {
    text += " " + block.code;
  }

  if (block.type === "table") {
    if (block.columns) {
      text += " " + block.columns.join(" ");
    }

    if (block.data) {
      block.data.forEach((row) => {
        text += " " + row.join(" ");
      });
    }
  }

  return text.toLowerCase();
};

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const safeCode = sanitizeCode(code);

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-900 px-2 py-4 text-sm dark:border-gray-700">
      <div className="overflow-x-auto  mr-8">
        <button onClick={handleCopy} className="absolute right-2 top-3 rounded bg-gray-700 p-1 text-xs text-white hover:bg-gray-600 cursor-pointer">
          {copied ? <img src={TickImg} alt="tick" width="20px" /> : <img src={CopyImg} alt="copy" width="20px" />}
        </button>
        <pre className="text-gray-100">
          <code dangerouslySetInnerHTML={{ __html: safeCode }} />
        </pre>
      </div>
    </div>
  );
};

export default function Topic() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState([]);
  const [activeSubtopic, setActiveSubtopic] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [toggleBar, setToggleBar] = useState(false);

  const sectionRefs = useRef({});

  const isSearching = debouncedSearchText.trim() !== "";

  const dataToRender = useMemo(() => {
    if (!debouncedSearchText.trim()) return content;
    const query = debouncedSearchText.toLowerCase();
    return content.filter((item) => item.question.toLowerCase().includes(query) || item.searchableText.includes(query));
  }, [content, debouncedSearchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (!slug) navigate("/404");
    const getData = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + slug + ".json");
        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        const data = await res.json();
        const processedData = data.map((item) => ({
          ...item,
          searchableText: item.answer.map(extractTextFromBlock).join(" ").toLowerCase(),
        }));
        setContent(processedData);
      } catch (error) {
        console.log(error);
        navigate("/404");
      }
    };

    getData();
  }, [slug]);

  useEffect(() => {
    if (!content?.length) return;

    const container = document.querySelector(".scroll-container");
    const headings = container?.querySelectorAll("h2[id]");

    if (!container || !headings.length) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;

      let active = null;

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();

        if (rect.top <= containerTop + 200) {
          active = heading;
        }
      });

      if (active) {
        setActiveSubtopic((prev) => {
          if (prev !== active.id) {
            return active.id;
          }
          return prev;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        // Get only visible headings
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          // Sort by distance from top of container
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const closest = visible[0];
          setActiveSubtopic(closest.target.id);
        }
      },
      {
        root: container,
        rootMargin: "-10% 0px -80% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [content]);

  return (
    <>
      <Navbar />

      <div className="mb-4 flex items-center gap-2 px-2">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-slate-900"
        />

        {searchText && (
          <button onClick={handleClearSearch} className="rounded-md bg-gray-300 px-3 py-2 text-sm hover:bg-gray-400">
            ✖
          </button>
        )}
      </div>

      {isSearching && dataToRender.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-semibold">No results found</p>
          <p className="text-sm mt-1">Try different keywords</p>
        </div>
      )}

      <button onClick={() => setToggleBar((prev) => !prev)} className="bg-gray-700 p-1 text-xs text-white hover:bg-gray-600 cursor-pointer absolute top-32.5 right-2.5 z-10 block lg:hidden">
        <img src={HamburgerImg} alt="hamburger" width="20px" />
      </button>

      <div className="scroll-container flex relative">
        {!isSearching && (
          <div className={`w-[90%] lg:w-[20%] h-[calc(100vh-130px)] overflow-auto absolute top-0 ${toggleBar ? "left-0" : "-left-full"} lg:sticky border-r border-gray-200 bg-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-slate-900 transition duration-300 ease-in-out z-20`}>
            {content?.map((data, index) => {
              const showSubtopic = index === 0 || content[index - 1].subTopic !== data.subTopic;

              if (!showSubtopic) return null;

              const isActive = activeSubtopic === data.subTopic;

              return (
                <p
                  key={data.subTopic}
                  onClick={() => document.getElementById(data.subTopic)?.scrollIntoView({ behavior: "smooth" })}
                  className={`w-[90%] my-2 cursor-pointer rounded-md px-3 py-2 text-sm transition
                  ${isActive ? "bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-900 dark:text-indigo-300" : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-800"}
                `}
                >
                  {data.subTopic}
                </p>
              );
            })}
          </div>
        )}
        <div className="w-full lg:w-[80%] h-[calc(100vh-130px)] overflow-auto flex flex-col gap-6 px-2 mx-auto">
          {dataToRender?.map((data, index) => {
            const showSubtopic = !isSearching && (index === 0 || content[index - 1]?.subTopic !== data.subTopic);

            return (
              <React.Fragment key={data.id}>
                {showSubtopic && (
                  <h2
                    ref={(el) => {
                      if (el) sectionRefs.current[data.subTopic] = el;
                    }}
                    id={data.subTopic}
                    className="my-8 border-l-4 border-indigo-500 pl-4 text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {data.subTopic}
                  </h2>
                )}

                <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-slate-900">
                  <div className="mb-3 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      <span className="mr-2 text-indigo-600 dark:text-indigo-400">Q.{index + 1}</span>
                      {data?.question}
                    </h3>
                  </div>

                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Answer</p>

                  <AnswerRenderer answer={data?.answer} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}
