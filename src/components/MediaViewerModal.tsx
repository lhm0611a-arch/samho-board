import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  PlayCircle, 
  FileText, 
  User, 
  Briefcase, 
  Building, 
  MapPin, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface MediaViewerTarget {
  url: string;
  type: 'video' | 'personality';
  title?: string;
  candidateName?: string;
  candidateUid?: string;
  candidateJob?: string;
  candidateAgency?: string;
  candidateDept?: string;
  scoreInfo?: string;
}

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaViewerTarget | null;
}

/**
 * Transforms various media URLs (Google Drive, YouTube, direct links)
 * into iframe embeddable or direct preview URLs.
 */
function resolveEmbedSource(rawUrl?: string): {
  embedUrl: string;
  originalUrl: string;
  mediaCategory: 'gdrive' | 'youtube' | 'direct-video' | 'iframe';
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { embedUrl: '', originalUrl: '', mediaCategory: 'iframe' };
  }

  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 1. Google Drive URLs
  // Patterns:
  // - https://drive.google.com/file/d/{FILE_ID}/view...
  // - https://drive.google.com/open?id={FILE_ID}
  // - https://drive.google.com/uc?id={FILE_ID}
  const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveMatch1 = url.match(driveFileRegex);
  if (driveMatch1 && driveMatch1[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch1[1]}/preview`,
      originalUrl: url,
      mediaCategory: 'gdrive',
    };
  }

  const driveOpenRegex = /drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/i;
  const driveMatch2 = url.match(driveOpenRegex);
  if (driveMatch2 && driveMatch2[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch2[1]}/preview`,
      originalUrl: url,
      mediaCategory: 'gdrive',
    };
  }

  // 2. YouTube
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      originalUrl: url,
      mediaCategory: 'youtube',
    };
  }

  // 3. Direct video format
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      embedUrl: url,
      originalUrl: url,
      mediaCategory: 'direct-video',
    };
  }

  // 4. Default iframe fallback
  return {
    embedUrl: url,
    originalUrl: url,
    mediaCategory: 'iframe',
  };
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  onClose,
  media,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset loading state when media or reloadKey changes
  useEffect(() => {
    if (isOpen && media) {
      setIsLoading(true);
    }
  }, [isOpen, media?.url, reloadKey]);

  const { embedUrl, originalUrl, mediaCategory } = useMemo(() => {
    return resolveEmbedSource(media?.url);
  }, [media?.url]);

  if (!isOpen || !media) return null;

  const isVideo = media.type === 'video';
  const defaultTitle = isVideo ? '기량 평가 및 인터뷰 영상' : '인성 검사 평가 보고서';
  const displayTitle = media.title || defaultTitle;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#0d131f] border border-[#232f43] rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-300 animate-in zoom-in-95 ${
          isFullscreen
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : isVideo
            ? 'w-full max-w-5xl h-[88vh] max-h-[900px]'
            : 'w-full max-w-4xl h-[90vh] max-h-[950px]'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-[#151c28] border-b border-[#232f43] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Info & Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                isVideo
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isVideo ? <PlayCircle size={20} /> : <FileText size={20} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    isVideo
                      ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isVideo ? '동영상 실행' : '인성검사 확인'}
                </span>
                {media.candidateUid && (
                  <span className="text-xs font-semibold text-slate-200 bg-white/5 px-2 py-0.5 rounded border border-white/10 tabular-nums">
                    ID: {media.candidateUid}
                  </span>
                )}
                {media.candidateName && (
                  <span className="text-sm font-bold text-white truncate">
                    {media.candidateName}
                  </span>
                )}
              </div>

              {/* Subtitle / Details */}
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 truncate">
                <span className="font-semibold text-slate-100">{displayTitle}</span>
                {media.candidateJob && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                    • <Briefcase size={12} className="text-slate-400" /> {media.candidateJob}
                  </span>
                )}
                {media.candidateAgency && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                    • <Building size={12} className="text-slate-400" /> {media.candidateAgency}
                  </span>
                )}
                {media.candidateDept && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                    • <MapPin size={12} className="text-slate-400" /> {media.candidateDept}
                  </span>
                )}
                {media.scoreInfo && (
                  <span className="text-xs text-amber-300 font-semibold tabular-nums">
                    • {media.scoreInfo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Reload Button */}
            <button
              onClick={() => {
                setIsLoading(true);
                setReloadKey((prev) => prev + 1);
              }}
              title="다시 불러오기"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCw size={17} />
            </button>

            {/* Open in External Tab */}
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Google Drive 원본 새 창에서 열기"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">새 창에서 열기</span>
              </a>
            )}

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? '창 크기 복원' : '전체화면 확대'}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="창 닫기 (ESC)"
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d131f]/90 z-20 pointer-events-none">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold text-slate-300 animate-pulse">
                {isVideo ? '동영상 플레이어 로딩 중...' : '검사 결과 문서 불러오는 중...'}
              </p>
              <p className="text-xs text-slate-500 mt-1">구글 드라이브와 직접 연결 중입니다</p>
            </div>
          )}

          {/* Empty / Error state */}
          {!embedUrl ? (
            <div className="p-8 text-center max-w-md">
              <AlertCircle size={44} className="mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">
                {isVideo ? '영상 파일 링크 없음' : '인성검사 파일 링크 없음'}
              </h3>
              <p className="text-sm text-slate-400">
                해당 지원자에 등록된 {isVideo ? '동영상' : '인성검사'} 링크가 없거나 유효하지 않습니다.
              </p>
            </div>
          ) : mediaCategory === 'direct-video' ? (
            /* Direct Video Player */
            <video
              key={`video-${reloadKey}`}
              src={embedUrl}
              controls
              autoPlay
              onLoadedData={() => setIsLoading(false)}
              className="w-full h-full object-contain"
            >
              해당 브라우저에서 동영상 재생을 지원하지 않습니다.
            </video>
          ) : (
            /* Embed / Iframe (Google Drive Preview / YouTube / Etc.) */
            <iframe
              key={`iframe-${reloadKey}`}
              src={embedUrl}
              title={displayTitle}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer Info Notice */}
        <div className="bg-[#101725] border-t border-[#232f43] px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles size={13} className="text-blue-400 shrink-0" />
            <span className="truncate">
              구글 드라이브에 등록된 {isVideo ? '실무 영상' : '인성검사 자료'}를 프로그램 내에서 즉시 실행 중입니다.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-2">
            <span className="text-slate-400 hidden sm:inline">권한 필요 시</span>
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
              >
                원본 드라이브 열기
              </a>
            )}
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">ESC: 닫기</span>
          </div>
        </div>
      </div>
    </div>
  );
};
