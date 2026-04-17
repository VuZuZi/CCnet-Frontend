import { useEffect, useMemo, useState } from 'react';
import { FileText, Link2, Loader2, X } from 'lucide-react';

import { chatAPI } from '@/features/chat/api/chat.api';
import { CHAT_ASSET_TABS } from '@/features/chat/constants/chat.constants';
import useConversationAssets from '@/features/chat/hooks/assets/useConversationAssets';
import { groupByMonth } from '@/features/chat/utils/assets';
import AttachmentPreviewModal from '@/features/chat/components/message/AttachmentPreviewModal';

function isImageAttachment(attachment) {
  const mimetype = String(attachment?.mimetype || '').toLowerCase();
  const name = String(
    attachment?.originalName || attachment?.filename || ''
  ).toLowerCase();
  const url = String(attachment?.url || attachment?.previewUrl || '').toLowerCase();

  return (
    mimetype.startsWith('image/') ||
    /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(name) ||
    /\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/i.test(url)
  );
}

function AssetTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-8 border-b border-slate-200 px-6">
      {CHAT_ASSET_TABS.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`border-b-[3px] py-4 text-base font-bold transition ${
              active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function LoadMoreButton({ hasMore, onLoadMore, isLoadingMore }) {
  if (!hasMore) return null;

  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={() => onLoadMore?.()}
        disabled={isLoadingMore}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
      </button>
    </div>
  );
}

function flattenImageItems(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows.flatMap((row) => {
    const attachments = Array.isArray(row?.attachments) ? row.attachments : [];

    return attachments
      .filter((attachment) => isImageAttachment(attachment))
      .map((attachment, index) => ({
        ...attachment,
        messageId: row?._id || '',
        createdAt: row?.createdAt || '',
        __assetIndex: index,
      }));
  });
}

function flattenFileItems(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows.flatMap((row) => {
    const attachments = Array.isArray(row?.attachments) ? row.attachments : [];

    return attachments
      .filter((attachment) => !isImageAttachment(attachment))
      .map((attachment, index) => ({
        ...attachment,
        messageId: row?._id || '',
        createdAt: row?.createdAt || '',
        __assetIndex: index,
      }));
  });
}

function flattenLinkItems(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows.flatMap((row) => {
    const links = Array.isArray(row?.links) ? row.links : [];

    return links
      .filter(Boolean)
      .map((link, index) => ({
        ...link,
        messageId: row?._id || '',
        createdAt: row?.createdAt || '',
        __assetIndex: index,
      }));
  });
}

export function ConversationAssetsDrawer({
  open,
  onClose,
  conversationId,
  initialTab = CHAT_ASSET_TABS[0].key,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [failedImageUrls, setFailedImageUrls] = useState({});

  useEffect(() => {
    if (!open) return;

    setActiveTab(initialTab || CHAT_ASSET_TABS[0].key);
    setPreviewAttachment(null);
    setFailedImageUrls({});
  }, [open, initialTab]);

  const imageQuery = useConversationAssets(
    conversationId,
    'image',
    open && activeTab === 'image'
  );

  const fileQuery = useConversationAssets(
    conversationId,
    'file',
    open && activeTab === 'file'
  );

  const linkQuery = useConversationAssets(
    conversationId,
    'link',
    open && activeTab === 'link'
  );

  const imageItems = useMemo(() => {
    return flattenImageItems(imageQuery.data)
      .map((item, index) => {
        const previewUrl = chatAPI.getAttachmentUrl(item);
        const previewName = item?.originalName || item?.filename || 'Ảnh';

        const previewKey = String(
          item?.messageId ||
            `${previewUrl}__${item?.createdAt || ''}__${item?.__assetIndex || index}`
        );

        return {
          ...item,
          __previewUrl: previewUrl,
          __previewName: previewName,
          __previewKey: previewKey,
        };
      })
      .filter((item) => item.__previewUrl)
      .filter((item) => !failedImageUrls[item.__previewUrl]);
  }, [imageQuery.data, failedImageUrls]);

  const fileItems = useMemo(() => {
    return flattenFileItems(fileQuery.data).map((item, index) => ({
      ...item,
      __fileUrl: chatAPI.getAttachmentUrl(item),
      __fileKey: String(
        item?.messageId ||
          `${item?.url || item?.filename || 'file'}__${item?.createdAt || ''}__${item?.__assetIndex || index}`
      ),
    }));
  }, [fileQuery.data]);

  const linkItems = useMemo(() => {
    return flattenLinkItems(linkQuery.data);
  }, [linkQuery.data]);

  const groupedFileItems = useMemo(() => groupByMonth(fileItems), [fileItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2400] flex justify-end bg-black/25">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Đóng ngăn tệp đính kèm"
      />

      <div className="relative z-[2401] flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xl font-black text-slate-900">Tệp đính kèm</div>
            <div className="text-sm text-slate-500">
              Xem hình ảnh, file và liên kết trong cuộc trò chuyện
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Đóng"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <AssetTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {activeTab === 'image' ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {imageItems.map((item) => (
                  <button
                    key={item.__previewKey}
                    type="button"
                    onClick={() =>
                      setPreviewAttachment({
                        ...item,
                        url: item.__previewUrl,
                        filename: item.__previewName,
                        originalName: item.__previewName,
                      })
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm hover:shadow-md"
                  >
                    <img
                      src={item.__previewUrl}
                      alt={item.__previewName}
                      className="h-48 w-full object-cover"
                      onError={() =>
                        setFailedImageUrls((prev) => ({
                          ...prev,
                          [item.__previewUrl]: true,
                        }))
                      }
                    />
                  </button>
                ))}
              </div>

              <LoadMoreButton
                hasMore={imageQuery.hasMore}
                onLoadMore={imageQuery.loadMore}
                isLoadingMore={imageQuery.isLoadingMore}
              />
            </>
          ) : null}

          {activeTab === 'file' ? (
            <>
              <div className="space-y-6">
                {Object.entries(groupedFileItems).map(([monthLabel, items]) => (
                  <div key={monthLabel}>
                    <div className="mb-3 text-sm font-black text-slate-900">
                      {monthLabel}
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.__fileKey}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {item?.originalName || item?.filename || 'Tệp'}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {item?.mimetype || 'Tệp đính kèm'}
                              </div>
                            </div>
                          </div>

                          {item.__fileUrl ? (
                            <a
                              href={item.__fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Mở
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <LoadMoreButton
                hasMore={fileQuery.hasMore}
                onLoadMore={fileQuery.loadMore}
                isLoadingMore={fileQuery.isLoadingMore}
              />
            </>
          ) : null}

          {activeTab === 'link' ? (
            <>
              <div className="space-y-3">
                {linkItems.map((item, index) => {
                  const href = String(item?.url || '').trim();
                  const key = `${item?.messageId || 'link'}__${href || 'link'}__${index}`;

                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm hover:bg-slate-50"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Link2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {item?.title || href}
                        </div>
                        {item?.description ? (
                          <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {item.description}
                          </div>
                        ) : null}
                        <div className="mt-1 truncate text-xs text-slate-400">
                          {href}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              <LoadMoreButton
                hasMore={linkQuery.hasMore}
                onLoadMore={linkQuery.loadMore}
                isLoadingMore={linkQuery.isLoadingMore}
              />
            </>
          ) : null}
        </div>

        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      </div>
    </div>
  );
}

export default ConversationAssetsDrawer;