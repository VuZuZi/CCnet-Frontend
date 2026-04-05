import { Fragment } from 'react';

export function HelpRequestStory({ story, evidences = [] }) {
  if (!story) {
    return null;
  }

  const paragraphs = story
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const storyImage = evidences
    .filter((item) => item?.mediaType === 'image' || !item?.mediaType)
    .slice(1)[0];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">The Story</h2>
        <p className="text-sm text-slate-500">
          The background, context, and why this request matters right now.
        </p>
      </div>

      <div className="space-y-5 text-base leading-8 text-slate-700">
        {paragraphs.map((paragraph, index) => (
          <Fragment key={`${index}-${paragraph.slice(0, 16)}`}>
            <p className="break-words whitespace-pre-wrap">{paragraph}</p>

            {index === 0 && storyImage && (
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={storyImage.url}
                  alt={storyImage.originalName || 'Supporting evidence'}
                  className="h-72 w-full object-cover"
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
