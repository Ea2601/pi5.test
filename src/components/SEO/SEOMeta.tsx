import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  noindex = false
}) => {
  const fullTitle = `${title} | Pi5 Süpernode`;
  const defaultKeywords = [
    'raspberry pi', 'network management', 'vpn', 'monitoring', 
    'enterprise', 'iot', 'network admin', 'wireguard'
  ];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Pi5 Supernode",
          "applicationCategory": "NetworkManagement",
          "operatingSystem": "Linux, Raspberry Pi OS",
          "description": description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </script>
    </Helmet>
  );
};