import useSEO from '../hooks/useSEO';

const SEO = ({ title, description, path, preventIndexing }) => {
  useSEO({ title, description, path, preventIndexing });
  return null; // This component doesn't render anything
};

export default SEO;
