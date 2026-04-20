import { useEffect } from 'react';

const useSEO = ({ title, description, path, preventIndexing = false }) => {
  const baseUrl = 'https://www.wishnest.co.in';
  const url = `${baseUrl}${path}`;

  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | WishNest`;
    }

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    }

    // 3. Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', url);

    // 4. Update Robots (NoIndex)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (preventIndexing) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
      metaRobots.remove();
    }

    // 5. Update OpenGraph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', url);
    }

    // 6. Update OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute('content', title);
    }

  }, [title, description, url, preventIndexing]);
};

export default useSEO;
