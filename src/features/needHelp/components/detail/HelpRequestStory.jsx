import { Fragment } from 'react';
import { AlignLeft } from 'lucide-react';

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
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700">
            <AlignLeft size={13} />
            Story
          </div>

          <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Background and context
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Understand the situation, urgency, and why this request matters.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {storyImage ? (
          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={storyImage.url}
              alt={storyImage.originalName || 'Supporting evidence'}
              className="h-56 w-full object-cover sm:h-64"
            />
          </div>
        ) : null}

        <div className="space-y-4 text-[15px] leading-8 text-slate-700">
          {paragraphs.map((paragraph, index) => (
            <Fragment key={`${index}-${paragraph.slice(0, 16)}`}>
              <p className="break-words whitespace-pre-wrap">{paragraph}</p>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HelpRequestStory;