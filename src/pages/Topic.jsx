import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { QuestionErrorBoundary } from "../components/QuestionErrorBoundary";
import Loader from "../components/Loader";

import CopyIcon from "../assets/copy.svg";
import TickIcon from "../assets/tick.svg";
import HamburgerIcon from "../assets/menu.svg";
import SearchIcon from "../assets/search.svg";

const processData = (data) => {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => {
      const questionId = item?.id || `index-${index}`;

      try {
        const answer = Array.isArray(item?.answer) ? item.answer : [];

        return {
          ...item,
          answer,
          searchableText: answer
            .map((block) => {
              try {
                return extractTextFromBlock(block);
              } catch (error) {
                console.error("Error extracting searchable text:", {
                  questionId,
                  error,
                });

                return "";
              }
            })
            .join(" ")
            .toLowerCase(),
        };
      } catch (error) {
        console.error("Error processing question:", {
          questionId,
          error,
        });

        return null;
      }
    })
    .filter(Boolean);
};

const renderItem = (item, i) => {
  if (Array.isArray(item)) {
    return <li key={i}>{renderInline(item)}</li>;
  }

  if (item.type === "list") {
    return <>{item.style === "ordered" ? <ol className="list-decimal pl-8">{item.items.map(renderItem)}</ol> : <ul className="list-[circle] pl-10">{item.items.map(renderItem)}</ul>}</>;
  }

  return <li key={i}>{item}</li>;
};

const renderInline = (content = []) => {
  return content.map((item, i) => {
    switch (item.type) {
      case "text":
        return <span key={i}>{item.value}</span>;

      case "badge":
        return (
          <span key={i} className="rounded bg-amber-300 px-1 text-gray-900 dark:bg-yellow-600 dark:text-white">
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

const renderHeading = (block, index) => {
  return (
    <>
      <h4 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-200">
        {block.content ? renderInline(block.content) : block.text}
      </h4>
    </>
  );
};

const renderParagraph = (block, index) => {
  return (
    <>
      <p key={index} className="text-gray-800 dark:text-gray-200">
        {block.content ? renderInline(block.content) : block.text}
      </p>
    </>
  );
};

const renderList = (block, index) => {
  const items = Array.isArray(block?.items) ? block.items : [];

  if (block?.style === "ordered") {
    return (
      <ol key={index} className="list-decimal pl-8 space-y-1 text-gray-800 dark:text-gray-200">
        {items.map(renderItem)}
      </ol>
    );
  }

  return (
    <ul key={index} className="list-disc pl-8 space-y-1 text-gray-800 dark:text-gray-200">
      {items.map(renderItem)}
    </ul>
  );
};

const renderTable = (block, index) => {
  const columns = Array.isArray(block?.columns) ? block.columns : [];
  const rows = Array.isArray(block?.data) ? block.data : [];

  return (
    <div key={index} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                {col?.content ? renderInline(col.content) : String(col ?? "")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y dark:divide-gray-700">
          {rows.map((row, rIndex) => {
            const cells = Array.isArray(row) ? row : [];

            return (
              <tr key={rIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {cells.map((cell, cIndex) => (
                  <td key={cIndex} className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {cell?.content ? renderInline(cell.content) : String(cell ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const BLOCK_RENDERERS = {
  h4: renderHeading,
  paragraph: renderParagraph,
  list: renderList,
  table: renderTable,
};

const AnswerRenderer = React.memo(({ answer }) => {
  if (!Array.isArray(answer)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {answer.map((block, index) => {
        try {
          if (!block || !block.type) return null;

          switch (block.type) {
            case "h4":
              return BLOCK_RENDERERS.h4(block, index);

            case "paragraph":
              return BLOCK_RENDERERS.paragraph(block, index);

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
              return BLOCK_RENDERERS.list(block, index);

            case "code":
              return <CodeBlock key={index} code={block.code || ""} />;

            case "table":
              return BLOCK_RENDERERS.table(block, index);

            default:
              return null;
          }
        } catch (error) {
          console.error("Error rendering answer block:", {
            blockIndex: index,
            block,
            error,
          });

          return null;
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

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-900 px-2 py-4 text-sm dark:border-gray-700">
      <div className="overflow-x-auto  mr-8">
        <button onClick={handleCopy} className="absolute right-2 top-3 rounded bg-gray-700 p-1 text-xs text-white hover:bg-gray-600 cursor-pointer">
          {copied ? <img src={TickIcon} alt="tick" width="20px" /> : <img src={CopyIcon} alt="copy" width="20px" />}
        </button>
        <pre className="text-gray-100 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default function Topic({ topics }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState([]);
  const [activeSubtopic, setActiveSubtopic] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [toggleBar, setToggleBar] = useState(false);
  const [toggleSearch, setToggleSearch] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchInputRef = useRef(null);
  const sectionRefs = useRef({});

  const SCROLL_KEY = `topic_scroll_${slug}`;
  const SUB_SCROLL_KEY = `sub_scroll_${slug}`;
  const CACHE_KEY = `topic_${slug}`;
  const CACHE_DURATION = Number(import.meta.env.VITE_CACHE_TIME);

  const isSearching = debouncedSearchText.trim() !== "";

  const getData = async () => {
    try {
      setLoading(true);
      setError(false);

      const cachedData = sessionStorage.getItem(CACHE_KEY);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);

        const isExpired = Date.now() > Number(parsedData.expiry);

        if (!isExpired) {
          setContent(parsedData.data);
          return;
        }

        sessionStorage.removeItem(CACHE_KEY);
      }

      const res = await fetch(import.meta.env.VITE_API_URL + slug + ".json");

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const data = await res.json();

      const processedData = processData(data);

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: processedData,
          expiry: Date.now() + CACHE_DURATION,
        }),
      );

      setContent(processedData);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const QuestionItem = ({ data, index, isSearching, content, sectionRefs }) => {
    const showSubtopic = !isSearching && data?.subTopic && (index === 0 || content[index - 1]?.subTopic !== data?.subTopic);

    return (
      <React.Fragment>
        {showSubtopic && (
          <h2
            ref={(el) => {
              if (el && data?.subTopic) {
                sectionRefs.current[data.subTopic] = el;
              }
            }}
            id={data?.subTopic}
            className="my-8 border-l-4 border-indigo-500 pl-4 text-2xl font-bold text-gray-900 dark:text-white"
          >
            {data?.subTopic}
          </h2>
        )}

        <div className="rounded-xl border border-gray-200 bg-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-slate-900">
          <div className="mb-3 border-b pb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              <span className="mr-2 text-indigo-600 dark:text-indigo-400">Q.{index + 1}</span>
              {data?.question}
            </h3>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Answer :</p>

          <AnswerRenderer answer={data?.answer} />
        </div>
      </React.Fragment>
    );
  };

  const renderData = (dataToRender) => {
    return (
      <>
        {Array.isArray(dataToRender) &&
          dataToRender.map((data, index) => {
            const questionId = data?.id || `index-${index}`;

            try {
              if (!data) return null;

              return <QuestionItem key={questionId} data={data} index={index} isSearching={isSearching} content={content} sectionRefs={sectionRefs} />;
            } catch (error) {
              console.error("Error rendering question item:", {
                questionId,
                error,
              });

              return null;
            }
          })}
      </>
    );
  };

  const dataToRender = useMemo(() => {
    if (!debouncedSearchText.trim()) return content;

    const query = debouncedSearchText.toLowerCase();

    return content.filter((item) => {
      const question = item?.question || "";
      const searchableText = item?.searchableText || "";

      return question.toLowerCase().includes(query) || searchableText.includes(query);
    });
  }, [content, debouncedSearchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setToggleSearch(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (toggleSearch) {
      searchInputRef.current?.focus();
    }
  }, [toggleSearch]);

  useEffect(() => {
    if (!slug) {
      navigate("/404");
      return;
    }

    getData();
  }, [slug]);

  useEffect(() => {
    if (isSearching) return;

    const container = document.querySelector(".scroll-container");
    if (!container) return;

    const subContainer = document.querySelector(".sub-scroll-container");
    if (!subContainer) return;

    const getHeadings = () => Array.from(container.querySelectorAll("h2[id]"));

    const savedScrollTop = sessionStorage.getItem(SCROLL_KEY);
    const savedSubScrollTop = sessionStorage.getItem(SUB_SCROLL_KEY);

    if (savedScrollTop !== null || savedSubScrollTop !== null) {
      requestAnimationFrame(() => {
        container.scrollTop = Number(savedScrollTop);
        subContainer.scrollTop = Number(savedSubScrollTop);
      });
    }

    const handleScroll = () => {
      const headings = getHeadings();

      if (!headings.length) return;

      const containerTop = container.getBoundingClientRect().top;

      let active = headings[0];

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();

        if (rect.top <= containerTop + 200) {
          active = heading;
        }
      });

      sessionStorage.setItem(SCROLL_KEY, String(container.scrollTop));
      sessionStorage.setItem(SUB_SCROLL_KEY, String(subContainer.scrollTop));

      if (active?.id) {
        setActiveSubtopic((prev) => {
          return prev !== active.id ? active.id : prev;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);

    requestAnimationFrame(handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [dataToRender, isSearching, SCROLL_KEY]);

  return (
    <>
      <Helmet key={slug}>
        <title>{slug ? `${slug.toUpperCase()} Notes` : "Notes App"}</title>
      </Helmet>

      <select className="topic-select" value={slug} onChange={(e) => navigate(`/topic/${e.target.value}`)} aria-label="Select topic">
        <option value="" disabled>
          Select Topic
        </option>
        {topics.map((topic) => (
          <option key={topic.slug} value={topic.slug}>
            {topic.title}
          </option>
        ))}
      </select>

      {loading ? (
        <Loader height="h-[80vh]" />
      ) : error ? (
        <div className="flex items-center justify-center h-[80vh]">
          <h2 className="text-3xl leading-loose font-bold text-gray-900 dark:text-white text-center">No data found</h2>
        </div>
      ) : (
        <>
          <div className={`${toggleSearch ? "w-full" : "w-1/5"} mb-4 flex items-center gap-2 px-2 absolute top-20 left-0 z-20`}>
            {toggleSearch ? (
              <>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchText}
                  ref={searchInputRef}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-slate-900"
                />

                <button onClick={handleClearSearch} className="rounded-md bg-gray-300 px-3 py-2 text-sm hover:bg-gray-400">
                  ✖
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setToggleSearch(true)} className="bg-gray-700 p-2 text-xs text-white hover:bg-gray-600 rounded-full cursor-pointer z-10">
                  <img src={SearchIcon} alt="search" width="16px" />
                </button>
              </>
            )}
          </div>

          {isSearching && dataToRender.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-lg font-semibold">No results found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}

          <button onClick={() => setToggleBar((prev) => !prev)} className="bg-gray-700 p-1 text-xs text-white hover:bg-gray-600 cursor-pointer absolute top-20 right-2.5 z-10 block lg:hidden">
            <img src={HamburgerIcon} alt="hamburger" width="20px" />
          </button>

          <div className="flex relative">
            {!isSearching && (
              <div
                className={`sub-scroll-container w-[90%] lg:w-[20%] h-[calc(100vh-160px)] overflow-auto absolute top-0 ${toggleBar ? "left-0" : "-left-full"} lg:sticky border-r border-gray-200 bg-gray-100 p-5 shadow-sm dark:border-gray-700 dark:bg-slate-900 transition duration-300 ease-in-out z-20`}
              >
                {content?.map((data, index) => {
                  const showSubtopic = index === 0 || content[index - 1]?.subTopic !== data?.subTopic;

                  if (!showSubtopic) return null;

                  const isActive = activeSubtopic === data.subTopic;

                  return (
                    <p
                      key={data.subTopic}
                      onClick={() => {
                        if (!data?.subTopic) return;

                        document.getElementById(data.subTopic)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
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
            <div className="scroll-container w-full lg:w-[80%] h-[calc(100vh-160px)] overflow-auto flex flex-col gap-6 px-2 mx-auto">{renderData(dataToRender)}</div>
          </div>
        </>
      )}
    </>
  );
}
