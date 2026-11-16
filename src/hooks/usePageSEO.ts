import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
}

const BASE_URL = "https://examprep-pxp.vercel.app";
const DEFAULT_TITLE = "ExamPrep Pro - All-in-One Exam Preparation & Study Dashboard";
const DEFAULT_DESC =
  "Ace your 7th Semester university exams with ExamPrep Pro. Real-time countdowns, full syllabus tracker, Arcade Pomodoro timer, lofi study beats, and curated PYQs.";

export const usePageSEO = ({ title, description, canonicalPath }: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = title ? `${title} | ExamPrep Pro` : DEFAULT_TITLE;
    document.title = finalTitle;

    // 2. Update Meta Description
    const finalDesc = description || DEFAULT_DESC;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", finalDesc);

    // 3. Update Canonical URL
    const canonicalUrl = canonicalPath
      ? `${BASE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`
      : BASE_URL;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // 4. Update OpenGraph and Twitter tags
    const updateMeta = (nameOrProperty: "name" | "property", key: string, value: string) => {
      let tag = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(nameOrProperty, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    updateMeta("property", "og:title", finalTitle);
    updateMeta("property", "og:description", finalDesc);
    updateMeta("property", "og:url", canonicalUrl);
    updateMeta("name", "twitter:title", finalTitle);
    updateMeta("name", "twitter:description", finalDesc);
  }, [title, description, canonicalPath]);
};
