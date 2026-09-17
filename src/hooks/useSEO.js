import { useEffect } from 'react';

const useSEO = ({ title, description, path, preventIndexing = false, image = 'https://www.wishnest.co.in/hero-3d-gift.webp' }) => {
  const baseUrl = 'https://www.wishnest.co.in';
  const url = `${baseUrl}${path}`;
  const defaultTitle = 'WishNest — Create & Share Your Wishlist for Any Occasion';
  const finalTitle = title ? `${title} | WishNest` : defaultTitle;

  useEffect(() => {
    // Helper to get or create meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      if (content) {
        tag.setAttribute('content', content);
      }
      return tag;
    };

    // 1. Update Title
    document.title = finalTitle;

    // 2. Update Description
    if (description) {
      setMetaTag('name', 'description', description);
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
    if (preventIndexing) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) metaRobots.remove();
    }

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:title', finalTitle);
    if (description) setMetaTag('property', 'og:description', description);
    if (image) setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:type', 'website');

    // 6. Twitter Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    if (description) setMetaTag('name', 'twitter:description', description);
    if (image) setMetaTag('name', 'twitter:image', image);

  }, [finalTitle, description, url, preventIndexing, image]);
};

export default useSEO;
