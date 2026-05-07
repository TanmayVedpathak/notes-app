import { Helmet } from "react-helmet-async";

import Navbar from "../components/Navbar";
import TopicCard from "../components/TopicCard";

import BasicIcon from "../assets/coding.png";
import HtmlIcon from "../assets/html.png";
import CssIcon from "../assets/css-3.png";
import JavaScriptIcon from "../assets/javascript.png";
import ReactIcon from "../assets/react.png";
import TypescriptIcon from "../assets/typescript.png";
import NodeJSIcon from "../assets/node-js.png";
import MongodbIcon from "../assets/mongodb.png";

const topics = [
  { title: "Basic", slug: "basic", icon: BasicIcon, alt: "basic" },
  { title: "HTML", slug: "html", icon: HtmlIcon, alt: "html" },
  { title: "CSS", slug: "css", icon: CssIcon, alt: "css" },
  { title: "JavaScript", slug: "javascript", icon: JavaScriptIcon, alt: "javascript" },
  { title: "React", slug: "reactjs", icon: ReactIcon, alt: "react-js" },
  { title: "TypeScript", slug: "typescript", icon: TypescriptIcon, alt: "typescript" },
  { title: "Node Js", slug: "nodejs", icon: NodeJSIcon, alt: "node-js" },
  { title: "MongoDB", slug: "mongodb", icon: MongodbIcon, alt: "mongodb" },
];

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Notes App</title>
      </Helmet>
      <Navbar />

      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>
    </>
  );
}
