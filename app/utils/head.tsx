interface HeadProps {
  title: string;
  description: string;
  keywords: string;
}

export default function Head({ title, description, keywords }: HeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
    </>
  );
}