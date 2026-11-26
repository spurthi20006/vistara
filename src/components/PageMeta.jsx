import { Helmet } from 'react-helmet-async';

export function PageMeta({ title, description }) {
  const fullTitle = title ? `${title} | University Connect` : 'University Connect | Campus & Alumni Network';
  const metaDescription =
    description ||
    'Connect with university alumni mentors, fellow students, campus communities, collaborative projects, and hackathons.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
